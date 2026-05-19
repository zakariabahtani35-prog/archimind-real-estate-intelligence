from __future__ import annotations

import json
import logging
from datetime import UTC, datetime
from math import sqrt
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import GridSearchCV, KFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from backend.app.core.config import settings
from backend.app.data.loader import ML_TABLE_QUALIFIED, load_ml_property_features
from backend.app.features.feature_engineering import (
    FEATURE_DOCUMENTATION,
    RealEstateFeatureEngineer,
    create_features,
    normalize_property_columns,
)
from backend.app.models.evaluate import evaluate_regression_model

logger = logging.getLogger(__name__)

TARGET = "price"
MIN_REGRESSION_ROWS = 20
RANDOM_STATE = 42
TEST_SIZE = 0.2

METADATA_COLUMNS = {
    "id",
    "listing_id",
    "listing_url",
    "url",
    "batch_id",
    "scraped_year",
    "scraped_month",
    "created_at",
    "updated_at",
}
REGRESSION_LEAKAGE_COLUMNS = METADATA_COLUMNS | {
    "price",
    "log_price",
    "price_per_m2",
    "classification_label",
    "price_band",
}


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


def json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(key): json_safe(item) for key, item in value.items()}
    if isinstance(value, list | tuple):
        return [json_safe(item) for item in value]
    if isinstance(value, np.integer):
        return int(value)
    if isinstance(value, np.floating):
        return None if not np.isfinite(value) else float(value)
    if isinstance(value, np.ndarray):
        return json_safe(value.tolist())
    if isinstance(value, pd.Timestamp):
        return value.isoformat()
    if isinstance(value, float) and not np.isfinite(value):
        return None
    return value


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(json_safe(payload), file, indent=2, ensure_ascii=False)
        file.write("\n")


def read_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def one_hot_encoder() -> OneHotEncoder:
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def infer_feature_columns(raw_features: pd.DataFrame) -> tuple[list[str], list[str], list[str]]:
    engineered = create_features(raw_features, include_target_features=False)
    engineered = engineered.dropna(axis=1, how="all")
    numeric_features = engineered.select_dtypes(include=["number", "bool"]).columns.tolist()
    categorical_features = engineered.select_dtypes(include=["object", "category"]).columns.tolist()
    selected = numeric_features + categorical_features
    if not selected:
        raise ValueError("No usable numeric or categorical feature columns were found after leakage columns were removed.")
    return selected, numeric_features, categorical_features


def select_model_input(df: pd.DataFrame, drop_columns: set[str]) -> pd.DataFrame:
    features = df.drop(columns=[column for column in drop_columns if column in df.columns]).copy()
    return features.dropna(axis=1, how="all")


def build_estimator_pipeline(
    estimator: Any,
    numeric_features: list[str],
    categorical_features: list[str],
) -> Pipeline:
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
    return Pipeline(
        steps=[
            ("features", RealEstateFeatureEngineer()),
            ("preprocessor", preprocessor),
            ("model", estimator),
        ]
    )


def optional_regressors() -> dict[str, tuple[Any, dict[str, list[Any]], bool]]:
    models: dict[str, tuple[Any, dict[str, list[Any]], bool]] = {
        "LinearRegression": (LinearRegression(), {}, False),
        "RandomForestRegressor": (
            RandomForestRegressor(random_state=RANDOM_STATE, n_jobs=-1),
            {
                "model__n_estimators": [150, 300],
                "model__max_depth": [None, 8, 16],
                "model__min_samples_leaf": [1, 3],
            },
            True,
        ),
        "GradientBoostingRegressor": (
            GradientBoostingRegressor(random_state=RANDOM_STATE),
            {
                "model__n_estimators": [100, 200],
                "model__learning_rate": [0.05, 0.1],
                "model__max_depth": [2, 3],
            },
            True,
        ),
        "HistGradientBoostingRegressor": (
            HistGradientBoostingRegressor(random_state=RANDOM_STATE),
            {
                "model__max_iter": [100, 200],
                "model__learning_rate": [0.05, 0.1],
                "model__max_leaf_nodes": [15, 31],
            },
            True,
        ),
    }
    try:
        from xgboost import XGBRegressor

        models["XGBRegressor"] = (
            XGBRegressor(
                objective="reg:squarederror",
                random_state=RANDOM_STATE,
                n_jobs=-1,
                eval_metric="rmse",
            ),
            {
                "model__n_estimators": [150, 300],
                "model__max_depth": [3, 5],
                "model__learning_rate": [0.05, 0.1],
                "model__subsample": [0.85, 1.0],
            },
            True,
        )
    except Exception as exc:
        logger.info("XGBoost is not available; skipping XGBRegressor: %s", exc)
    return models


def prepare_regression_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, pd.DataFrame, dict[str, Any]]:
    normalized = normalize_property_columns(df)
    featured_for_validation = create_features(normalized, include_target_features=True)
    if TARGET not in featured_for_validation.columns:
        raise ValueError(
            f"Column '{TARGET}' is required for regression training. "
            f"Available columns: {', '.join(featured_for_validation.columns)}"
        )

    featured_for_validation[TARGET] = pd.to_numeric(featured_for_validation[TARGET], errors="coerce")
    featured_for_validation["surface_m2"] = pd.to_numeric(featured_for_validation["surface_m2"], errors="coerce")
    valid = featured_for_validation.dropna(subset=[TARGET, "surface_m2"])
    valid = valid[(valid[TARGET] > 0) & (valid["surface_m2"] > 10)].copy()
    if len(valid) < MIN_REGRESSION_ROWS:
        raise ValueError(
            f"At least {MIN_REGRESSION_ROWS} valid rows are required for regression training; found {len(valid)}."
        )

    X_raw = select_model_input(valid, REGRESSION_LEAKAGE_COLUMNS)
    selected_features, numeric_features, categorical_features = infer_feature_columns(X_raw)
    y = valid[TARGET].astype(float)
    dataset_info = {
        "source_table": ML_TABLE_QUALIFIED,
        "raw_rows": int(df.shape[0]),
        "raw_columns": int(df.shape[1]),
        "valid_rows": int(valid.shape[0]),
        "valid_columns_after_feature_engineering": int(valid.shape[1]),
        "target": TARGET,
        "selected_features": selected_features,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "feature_documentation": FEATURE_DOCUMENTATION,
        "feature_ranges": _feature_ranges(valid, set(normalized.columns)),
        "known_cities": sorted(valid["city"].dropna().astype(str).unique().tolist()) if "city" in valid.columns else [],
        "known_districts": sorted(valid["district"].dropna().astype(str).unique().tolist()) if "district" in valid.columns else [],
        "known_property_types": sorted(valid["property_type"].dropna().astype(str).unique().tolist()) if "property_type" in normalized.columns else [],
    }
    return X_raw, y, valid, dataset_info


def _feature_ranges(valid: pd.DataFrame, available_columns: set[str]) -> dict[str, dict[str, float]]:
    ranges: dict[str, dict[str, float]] = {}
    for column in ["surface_m2", "bedrooms", "bathrooms", "floor", "property_age", "price_per_m2"]:
        if column not in valid.columns or column not in available_columns:
            continue
        values = pd.to_numeric(valid[column], errors="coerce").dropna()
        if values.empty:
            continue
        ranges[column] = {
            "min": float(values.min()),
            "max": float(values.max()),
            "median": float(values.median()),
        }
    return ranges


def _cv_folds(y: pd.Series) -> int:
    return max(2, min(5, int(len(y) // 30) or 2))


def evaluate_candidate(
    model_name: str,
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    cv: KFold,
) -> tuple[Pipeline, dict[str, Any]]:
    cv_scores = cross_val_score(
        pipeline,
        X_train,
        y_train,
        cv=cv,
        scoring="neg_root_mean_squared_error",
        n_jobs=-1,
    )
    pipeline.fit(X_train, y_train)
    metrics = evaluate_regression_model(pipeline, X_test, y_test)
    result = {
        "name": model_name,
        **metrics,
        "cv_score_mean": float(cv_scores.mean()),
        "cv_score_std": float(cv_scores.std()),
        "cv_rmse_mean": float(-cv_scores.mean()),
        "cv_rmse_std": float(cv_scores.std()),
        "status": "Candidate",
    }
    return pipeline, result


def tune_tree_model(
    model_name: str,
    estimator: Any,
    param_grid: dict[str, list[Any]],
    numeric_features: list[str],
    categorical_features: list[str],
    X_train: pd.DataFrame,
    y_train: pd.Series,
    cv: KFold,
) -> GridSearchCV:
    pipeline = build_estimator_pipeline(estimator, numeric_features, categorical_features)
    search = GridSearchCV(
        pipeline,
        param_grid=param_grid,
        scoring="neg_root_mean_squared_error",
        cv=cv,
        n_jobs=-1,
        refit=True,
        error_score="raise",
    )
    logger.info("Running GridSearchCV for %s with %s candidates.", model_name, len(search.get_params()["param_grid"]))
    search.fit(X_train, y_train)
    return search


def get_transformed_feature_names(pipeline: Pipeline) -> list[str]:
    preprocessor = pipeline.named_steps.get("preprocessor")
    if preprocessor is None:
        return []
    try:
        names = preprocessor.get_feature_names_out()
    except Exception:
        return []
    cleaned = []
    for name in names:
        text = str(name)
        for prefix in ("num__", "cat__"):
            if text.startswith(prefix):
                text = text[len(prefix) :]
        cleaned.append(text)
    return cleaned


def extract_feature_importance(pipeline: Pipeline, model_name: str) -> dict[str, Any]:
    model = pipeline.named_steps.get("model")
    feature_names = get_transformed_feature_names(pipeline)
    values: np.ndarray | None = None
    method = "unavailable"
    if hasattr(model, "feature_importances_"):
        values = np.asarray(model.feature_importances_, dtype=float)
        method = "feature_importances_"
    elif hasattr(model, "coef_"):
        values = np.abs(np.asarray(model.coef_, dtype=float)).ravel()
        method = "absolute_coefficients"

    if values is None:
        return {"model_name": model_name, "method": method, "top_features": []}

    if not feature_names or len(feature_names) != len(values):
        feature_names = [f"feature_{idx}" for idx in range(len(values))]
    rows = [
        {"feature": name, "importance": float(value)}
        for name, value in zip(feature_names, values, strict=False)
    ]
    rows = sorted(rows, key=lambda row: row["importance"], reverse=True)
    return {
        "model_name": model_name,
        "method": method,
        "top_features": rows[:20],
        "all_features_count": len(rows),
    }


def regression_error_analysis(
    model: Pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
) -> dict[str, Any]:
    predictions = pd.Series(model.predict(X_test), index=X_test.index, name="predicted_price")
    actual = pd.Series(y_test, index=X_test.index, name="actual_price")
    residual = predictions - actual
    absolute_error = residual.abs()
    test_features = create_features(X_test, include_target_features=False)
    analysis_frame = test_features.copy()
    analysis_frame["actual_price"] = actual
    analysis_frame["predicted_price"] = predictions
    analysis_frame["residual"] = residual
    analysis_frame["absolute_error"] = absolute_error

    def grouped_mae(column: str) -> list[dict[str, Any]]:
        if column not in analysis_frame.columns:
            return []
        grouped = analysis_frame.groupby(column, dropna=False)["absolute_error"].mean().sort_values(ascending=False)
        return [{"group": str(key), "mae": float(value)} for key, value in grouped.head(15).items()]

    sample_columns = [
        "city",
        "district",
        "property_type",
        "surface_m2",
        "bedrooms",
        "bathrooms",
        "actual_price",
        "predicted_price",
        "residual",
        "absolute_error",
    ]
    available_sample_columns = [column for column in sample_columns if column in analysis_frame.columns]
    over = analysis_frame.sort_values("residual", ascending=False).head(10)[available_sample_columns].to_dict("records")
    under = analysis_frame.sort_values("residual", ascending=True).head(10)[available_sample_columns].to_dict("records")

    return {
        "regression": {
            "residual_summary": {
                "mean_residual": float(residual.mean()),
                "median_residual": float(residual.median()),
                "std_residual": float(residual.std()),
                "min_residual": float(residual.min()),
                "max_residual": float(residual.max()),
                "mae": float(absolute_error.mean()),
                "rmse": float(sqrt(float((residual**2).mean()))),
                "test_rows": int(len(analysis_frame)),
            },
            "mae_by_city": grouped_mae("city"),
            "mae_by_property_type": grouped_mae("property_type"),
            "top_over_predicted_samples": json_safe(over),
            "top_under_predicted_samples": json_safe(under),
        }
    }


def update_error_analysis(**sections: Any) -> dict[str, Any]:
    current = read_json(settings.resolved_error_analysis_path)
    current.update(sections)
    current["updated_at"] = utc_now()
    write_json(settings.resolved_error_analysis_path, current)
    return current


def update_feature_importance(**sections: Any) -> dict[str, Any]:
    current = read_json(settings.resolved_feature_importance_path)
    current.update(sections)
    current["updated_at"] = utc_now()
    write_json(settings.resolved_feature_importance_path, current)
    return current


def update_metrics_report(**sections: Any) -> dict[str, Any]:
    report = read_json(settings.resolved_metrics_path)
    for key, value in sections.items():
        if value is not None:
            report[key] = value
    report["latest_training_timestamp"] = utc_now()
    write_json(settings.resolved_metrics_path, report)
    return report


def train_price_model(df: pd.DataFrame) -> tuple[Pipeline, list[dict[str, Any]], dict[str, Any], dict[str, Any]]:
    X_raw, y, valid, dataset_info = prepare_regression_dataset(df)
    numeric_features = dataset_info["numeric_features"]
    categorical_features = dataset_info["categorical_features"]
    X_train, X_test, y_train, y_test = train_test_split(X_raw, y, test_size=TEST_SIZE, random_state=RANDOM_STATE)
    cv = KFold(n_splits=_cv_folds(y_train), shuffle=True, random_state=RANDOM_STATE)

    results: list[dict[str, Any]] = []
    fitted_candidates: dict[str, Pipeline] = {}
    tree_results: list[dict[str, Any]] = []
    model_specs = optional_regressors()

    for model_name, (estimator, _, is_tree_based) in model_specs.items():
        logger.info("Training regression candidate: %s", model_name)
        pipeline = build_estimator_pipeline(estimator, numeric_features, categorical_features)
        fitted, metrics = evaluate_candidate(model_name, pipeline, X_train, X_test, y_train, y_test, cv)
        fitted_candidates[model_name] = fitted
        results.append(metrics)
        if is_tree_based:
            tree_results.append(metrics)

    if not results:
        raise RuntimeError("No regression model candidates could be trained.")

    best_tree = min(tree_results, key=lambda row: row["rmse"]) if tree_results else min(results, key=lambda row: row["rmse"])
    best_tree_name = best_tree["name"]
    _, param_grid, _ = model_specs[best_tree_name]
    tuned_search = tune_tree_model(
        best_tree_name,
        model_specs[best_tree_name][0],
        param_grid,
        numeric_features,
        categorical_features,
        X_train,
        y_train,
        cv,
    )
    tuned_model = tuned_search.best_estimator_
    tuned_metrics = evaluate_regression_model(tuned_model, X_test, y_test)
    tuned_result = {
        "name": f"{best_tree_name} Tuned",
        **tuned_metrics,
        "cv_score_mean": float(tuned_search.best_score_),
        "cv_score_std": float(tuned_search.cv_results_["std_test_score"][tuned_search.best_index_]),
        "cv_rmse_mean": float(-tuned_search.best_score_),
        "cv_rmse_std": float(tuned_search.cv_results_["std_test_score"][tuned_search.best_index_]),
        "best_params": tuned_search.best_params_,
        "status": "Candidate",
    }
    results.append(tuned_result)
    fitted_candidates[tuned_result["name"]] = tuned_model

    best_result = min(results, key=lambda row: row["rmse"])
    best_result["status"] = "Best"
    for result in results:
        if result is not best_result:
            result["status"] = "Candidate"

    best_model = fitted_candidates[best_result["name"]]
    model_path = settings.resolved_price_model_path
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, model_path)

    feature_importance = extract_feature_importance(best_model, best_result["name"])
    error_analysis = regression_error_analysis(best_model, X_test, y_test)
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
        "model_comparison": results,
        "best_model": best_result,
        "hyperparameter_tuning": {
            "tuned_model_family": best_tree_name,
            "search": "GridSearchCV",
            "scoring": "neg_root_mean_squared_error",
            "best_params": tuned_search.best_params_,
            "best_cv_score": float(tuned_search.best_score_),
        },
    }
    write_json(settings.resolved_regression_report_path, report)
    update_error_analysis(**error_analysis)
    update_feature_importance(regression=feature_importance)
    return best_model, results, dataset_info, report


def train_regression_from_database() -> dict[str, Any]:
    df = load_ml_property_features()
    model, regression_metrics, dataset_info, report = train_price_model(df)
    update_metrics_report(regression=regression_metrics, dataset=dataset_info, regression_report=report)
    best = next(metric for metric in regression_metrics if metric["status"] == "Best")
    model_path = settings.resolved_price_model_path

    logger.info("Dataset: %s rows x %s columns from %s", df.shape[0], df.shape[1], ML_TABLE_QUALIFIED)
    logger.info("Target: %s", TARGET)
    logger.info("Selected numeric features: %s", ", ".join(dataset_info["numeric_features"]) or "none")
    logger.info("Selected categorical features: %s", ", ".join(dataset_info["categorical_features"]) or "none")
    logger.info("Best regression metrics: %s", best)
    logger.info("Saved price model: %s", model_path)
    logger.info("Saved regression report: %s", settings.resolved_regression_report_path)

    return {
        "model": model,
        "metrics": regression_metrics,
        "dataset": dataset_info,
        "report": report,
        "artifact_path": str(model_path),
    }


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    result = train_regression_from_database()
    best = next(metric for metric in result["metrics"] if metric["status"] == "Best")
    print(f"Loaded dataset from {ML_TABLE_QUALIFIED}")
    print(f"Dataset rows/columns: {result['dataset']['valid_rows']} / {result['dataset']['valid_columns_after_feature_engineering']}")
    print(f"Selected target: {result['dataset']['target']}")
    print(f"Selected features: {', '.join(result['dataset']['selected_features'])}")
    print(
        "Metrics: "
        f"MAE={best['mae']:.2f}, RMSE={best['rmse']:.2f}, R2={best['r2_score']:.4f}, "
        f"CV_RMSE={best['cv_rmse_mean']:.2f} (+/- {best['cv_rmse_std']:.2f})"
    )
    print(f"Saved artifact path: {result['artifact_path']}")
    print(f"Saved regression report: {settings.resolved_regression_report_path}")


if __name__ == "__main__":
    main()
