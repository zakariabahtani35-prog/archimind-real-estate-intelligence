from __future__ import annotations

import logging
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_recall_fscore_support,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelBinarizer, StandardScaler

from backend.app.core.config import settings
from backend.app.data.loader import ML_TABLE_QUALIFIED, load_ml_property_features
from backend.app.features.feature_engineering import FEATURE_DOCUMENTATION, RealEstateFeatureEngineer, create_features, normalize_property_columns
from backend.app.models.train_regression import (
    METADATA_COLUMNS,
    build_estimator_pipeline,
    extract_feature_importance,
    infer_feature_columns,
    json_safe,
    one_hot_encoder,
    read_json,
    select_model_input,
    update_error_analysis,
    update_feature_importance,
    update_metrics_report,
    utc_now,
    write_json,
)

logger = logging.getLogger(__name__)

CLASSIFICATION_LABEL = "classification_label"
MIN_CLASSIFICATION_ROWS = 30
RANDOM_STATE = 42
TEST_SIZE = 0.2
REAL_TARGET_CANDIDATES = ("property_type", "property_category", "listing_type", "price_band")
CLASSIFICATION_LEAKAGE_COLUMNS = METADATA_COLUMNS | {
    "price",
    "log_price",
    "price_per_m2",
    "classification_label",
    "price_band",
    "property_type",
    "property_category",
    "listing_type",
}


def _derived_price_band(featured: pd.DataFrame) -> tuple[pd.Series, str]:
    price_per_m2 = pd.to_numeric(featured.get("price_per_m2"), errors="coerce")
    if price_per_m2.isna().all():
        price = pd.to_numeric(featured["price"], errors="coerce")
        surface = pd.to_numeric(featured["surface_m2"], errors="coerce").clip(lower=1)
        price_per_m2 = price / surface

    valid_values = price_per_m2.dropna()
    if valid_values.nunique() < 3:
        raise ValueError("At least three unique price-per-m2 values are required to derive low/medium/high labels.")

    labels = pd.qcut(
        price_per_m2.rank(method="first"),
        q=3,
        labels=["low", "medium", "high"],
    )
    return labels.astype("object"), "derived_price_per_m2_quantile"


def _native_target(normalized: pd.DataFrame) -> str | None:
    for column in REAL_TARGET_CANDIDATES:
        if column not in normalized.columns:
            continue
        values = normalized[column].dropna().astype(str).str.strip()
        values = values[values.ne("") & values.ne("Unknown")]
        if 2 <= values.nunique() <= 30:
            return column
    return None


def prepare_classification_dataset(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.Series, pd.DataFrame, dict[str, Any]]:
    normalized = normalize_property_columns(df)
    featured = create_features(normalized, include_target_features=True)
    featured["price"] = pd.to_numeric(featured["price"], errors="coerce")
    featured["surface_m2"] = pd.to_numeric(featured["surface_m2"], errors="coerce")
    valid = featured.dropna(subset=["price", "surface_m2"]).copy()
    valid = valid[(valid["price"] > 0) & (valid["surface_m2"] > 10)].copy()

    native_target = _native_target(normalized)
    if native_target:
        y = valid[native_target].fillna("Unknown").astype(str).str.strip().replace("", "Unknown")
        label_source = native_target
    else:
        y, label_source = _derived_price_band(valid)
        valid[CLASSIFICATION_LABEL] = y

    mask = y.notna()
    valid = valid.loc[mask].copy()
    y = y.loc[mask].astype(str)
    y = y[y.ne("Unknown")]
    valid = valid.loc[y.index].copy()

    if len(valid) < MIN_CLASSIFICATION_ROWS:
        raise ValueError(
            f"At least {MIN_CLASSIFICATION_ROWS} valid rows are required for classification training; found {len(valid)}."
        )
    if y.nunique() < 2:
        raise ValueError("Classification training requires at least two target classes.")

    X_raw = select_model_input(valid, CLASSIFICATION_LEAKAGE_COLUMNS)
    selected_features, numeric_features, categorical_features = infer_feature_columns(X_raw)
    class_distribution = {str(label): int(count) for label, count in y.value_counts().sort_index().items()}
    dataset_info = {
        "source_table": ML_TABLE_QUALIFIED,
        "raw_rows": int(df.shape[0]),
        "valid_rows": int(valid.shape[0]),
        "target": native_target or CLASSIFICATION_LABEL,
        "label_source": label_source,
        "classes": sorted(y.unique().tolist()),
        "class_distribution": class_distribution,
        "selected_features": selected_features,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "feature_documentation": FEATURE_DOCUMENTATION,
    }
    return X_raw, y, valid, dataset_info


def _smote_status(y: pd.Series) -> tuple[Any | None, dict[str, Any]]:
    counts = y.value_counts()
    imbalance_ratio = float(counts.max() / max(counts.min(), 1))
    status = {
        "imbalanced_learn_installed": False,
        "used_smote": False,
        "imbalance_ratio": imbalance_ratio,
        "fallback": "class_weight where estimator supports it",
    }
    if imbalance_ratio < 1.5:
        status["fallback"] = "not applied; class distribution is acceptable"
        return None, status
    try:
        from imblearn.over_sampling import SMOTE

        k_neighbors = max(1, min(5, int(counts.min()) - 1))
        status["imbalanced_learn_installed"] = True
        status["used_smote"] = True
        status["fallback"] = None
        return SMOTE(random_state=RANDOM_STATE, k_neighbors=k_neighbors), status
    except Exception as exc:
        logger.info("imbalanced-learn is unavailable; using class_weight where possible instead of SMOTE: %s", exc)
        return None, status


def build_classifier_pipeline(
    estimator: Any,
    numeric_features: list[str],
    categorical_features: list[str],
    sampler: Any | None,
) -> Pipeline:
    if sampler is None:
        return build_estimator_pipeline(estimator, numeric_features, categorical_features)

    try:
        from imblearn.pipeline import Pipeline as ImbPipeline
    except Exception:
        return build_estimator_pipeline(estimator, numeric_features, categorical_features)

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", one_hot_encoder()),
        ]
    )
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, numeric_features),
            ("cat", categorical_pipeline, categorical_features),
        ],
        remainder="drop",
    )
    return ImbPipeline(
        steps=[
            ("features", RealEstateFeatureEngineer()),
            ("preprocessor", preprocessor),
            ("sampler", sampler),
            ("model", estimator),
        ]
    )


def candidate_classifiers() -> dict[str, Any]:
    return {
        "LogisticRegression": LogisticRegression(max_iter=2000, class_weight="balanced", random_state=RANDOM_STATE),
        "RandomForestClassifier": RandomForestClassifier(
            n_estimators=250,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            min_samples_leaf=2,
            class_weight="balanced",
        ),
        "GradientBoostingClassifier": GradientBoostingClassifier(random_state=RANDOM_STATE),
    }


def _roc_auc_macro(model: Pipeline, X_test: pd.DataFrame, y_test: pd.Series, labels: list[str]) -> float | None:
    if not hasattr(model, "predict_proba"):
        return None
    try:
        probabilities = model.predict_proba(X_test)
        if len(labels) == 2:
            return float(roc_auc_score(y_test, probabilities[:, 1]))
        label_binarizer = LabelBinarizer()
        label_binarizer.fit(labels)
        y_binary = label_binarizer.transform(y_test)
        return float(roc_auc_score(y_binary, probabilities, average="macro", multi_class="ovr"))
    except Exception as exc:
        logger.info("ROC-AUC macro could not be computed: %s", exc)
        return None


def evaluate_classifier(
    model_name: str,
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    cv: StratifiedKFold,
    labels: list[str],
) -> tuple[Pipeline, dict[str, Any], dict[str, Any]]:
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="f1_macro", n_jobs=-1)
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    matrix = confusion_matrix(y_test, predictions, labels=labels)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_test,
        predictions,
        labels=labels,
        zero_division=0,
    )
    per_class = [
        {
            "class": label,
            "precision": float(p),
            "recall": float(r),
            "f1": float(f),
            "support": int(s),
        }
        for label, p, r, f, s in zip(labels, precision, recall, f1, support, strict=False)
    ]
    metric_row = {
        "name": model_name,
        "accuracy": float(accuracy_score(y_test, predictions)),
        "precision_macro": float(precision_score(y_test, predictions, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(y_test, predictions, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(y_test, predictions, average="macro", zero_division=0)),
        "roc_auc_macro": _roc_auc_macro(pipeline, X_test, y_test, labels),
        "cv_score_mean": float(cv_scores.mean()),
        "cv_score_std": float(cv_scores.std()),
        "status": "Candidate",
    }
    diagnostics = {
        "labels": labels,
        "confusion_matrix": matrix.tolist(),
        "per_class": per_class,
    }
    return pipeline, metric_row, diagnostics


def classification_error_section(best_diagnostics: dict[str, Any]) -> dict[str, Any]:
    per_class = best_diagnostics.get("per_class", [])
    worst = min(per_class, key=lambda row: row["f1"]) if per_class else None
    return {
        "classification": {
            "labels": best_diagnostics.get("labels", []),
            "confusion_matrix": best_diagnostics.get("confusion_matrix", []),
            "per_class": per_class,
            "worst_performing_class": worst,
        }
    }


def train_classification_model(df: pd.DataFrame) -> tuple[Pipeline, dict[str, Any], dict[str, Any], dict[str, Any]]:
    X_raw, y, valid, dataset_info = prepare_classification_dataset(df)
    numeric_features = dataset_info["numeric_features"]
    categorical_features = dataset_info["categorical_features"]
    labels = dataset_info["classes"]
    stratify = y if y.value_counts().min() >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X_raw,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=stratify,
    )
    cv = StratifiedKFold(n_splits=max(2, min(5, int(y_train.value_counts().min()))), shuffle=True, random_state=RANDOM_STATE)
    sampler, smote_status = _smote_status(y_train)

    results: list[dict[str, Any]] = []
    fitted: dict[str, Pipeline] = {}
    diagnostics_by_model: dict[str, dict[str, Any]] = {}
    for model_name, estimator in candidate_classifiers().items():
        logger.info("Training classification candidate: %s", model_name)
        pipeline = build_classifier_pipeline(estimator, numeric_features, categorical_features, sampler)
        candidate, metrics, diagnostics = evaluate_classifier(model_name, pipeline, X_train, X_test, y_train, y_test, cv, labels)
        results.append(metrics)
        fitted[model_name] = candidate
        diagnostics_by_model[model_name] = diagnostics

    best_result = max(results, key=lambda row: row["f1_macro"])
    best_result["status"] = "Best"
    for result in results:
        if result is not best_result:
            result["status"] = "Candidate"

    best_model = fitted[best_result["name"]]
    best_diagnostics = diagnostics_by_model[best_result["name"]]
    model_path = settings.resolved_classification_model_path
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, model_path)

    feature_importance = extract_feature_importance(best_model, best_result["name"])
    error_section = classification_error_section(best_diagnostics)
    report = {
        "generated_at": utc_now(),
        "source_table": ML_TABLE_QUALIFIED,
        "artifact_path": str(model_path),
        "split": {
            "test_size": TEST_SIZE,
            "random_state": RANDOM_STATE,
            "train_rows": int(X_train.shape[0]),
            "test_rows": int(X_test.shape[0]),
            "cv_folds": cv.n_splits,
        },
        "dataset": dataset_info,
        "class_distribution": dataset_info["class_distribution"],
        "imbalance_handling": smote_status,
        "model_comparison": results,
        "best_model": best_result,
        "confusion_matrix": best_diagnostics["confusion_matrix"],
        "labels": labels,
        "per_class": best_diagnostics["per_class"],
    }
    write_json(settings.resolved_classification_report_path, report)
    update_error_analysis(**error_section)
    update_feature_importance(classification=feature_importance)
    return best_model, best_result, dataset_info, report


def train_classifier_from_database() -> dict[str, Any]:
    df = load_ml_property_features()
    model, classification_metrics, dataset_info, report = train_classification_model(df)
    update_metrics_report(
        classification=classification_metrics,
        classification_dataset=dataset_info,
        classification_report=report,
    )
    model_path = settings.resolved_classification_model_path

    logger.info("Dataset: %s rows x %s columns from %s", df.shape[0], df.shape[1], ML_TABLE_QUALIFIED)
    logger.info("Selected target: %s (%s)", dataset_info["target"], dataset_info["label_source"])
    logger.info("Selected classes: %s", ", ".join(dataset_info["classes"]))
    logger.info("Selected numeric features: %s", ", ".join(dataset_info["numeric_features"]) or "none")
    logger.info("Selected categorical features: %s", ", ".join(dataset_info["categorical_features"]) or "none")
    logger.info("Classification metrics: %s", classification_metrics)
    logger.info("Saved classification model: %s", model_path)
    logger.info("Saved classification report: %s", settings.resolved_classification_report_path)

    return {
        "model": model,
        "metrics": classification_metrics,
        "dataset": dataset_info,
        "report": report,
        "artifact_path": str(model_path),
    }


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    result = train_classifier_from_database()
    metrics = result["metrics"]
    print(f"Loaded dataset from {ML_TABLE_QUALIFIED}")
    print(f"Dataset rows: {result['dataset']['valid_rows']}")
    print(f"Selected target: {result['dataset']['target']} ({result['dataset']['label_source']})")
    print(f"Selected features: {', '.join(result['dataset']['selected_features'])}")
    print(f"Classes: {', '.join(result['dataset']['classes'])}")
    print(
        "Metrics: "
        f"accuracy={metrics['accuracy']:.4f}, precision_macro={metrics['precision_macro']:.4f}, "
        f"recall_macro={metrics['recall_macro']:.4f}, f1_macro={metrics['f1_macro']:.4f}, "
        f"cv_f1={metrics['cv_score_mean']:.4f} (+/- {metrics['cv_score_std']:.4f})"
    )
    print(f"Saved artifact path: {result['artifact_path']}")
    print(f"Saved classification report: {settings.resolved_classification_report_path}")


if __name__ == "__main__":
    main()
