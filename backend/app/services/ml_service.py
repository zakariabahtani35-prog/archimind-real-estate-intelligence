from __future__ import annotations

import json
import logging
from typing import Any

import numpy as np
import pandas as pd
from fastapi import HTTPException, status

from backend.app.core.config import settings
from backend.app.core.db import check_database_connection
from backend.app.data.loader import ML_TABLE_QUALIFIED, get_ml_feature_table_status, load_ml_property_features
from backend.app.features.feature_engineering import create_features
from backend.app.models.model_loader import loader
from backend.app.pipelines.train_pipeline import run_training_pipeline
from backend.app.schemas.prediction_schema import (
    AnalyticsData,
    ArtifactResponse,
    ClassificationInput,
    ClassificationOutput,
    DatasetSummary,
    DBHealthResponse,
    ModelMetric,
    ModelStatusResponse,
    PropertyPredictionInput,
    PropertyPredictionOutput,
    PropertyRecord,
    TrainingResponse,
)

logger = logging.getLogger(__name__)


def _input_to_frame(input_data: PropertyPredictionInput) -> pd.DataFrame:
    return pd.DataFrame([input_data.model_dump(exclude_none=True)])


def _model_name(model: Any) -> str:
    estimator = getattr(model, "named_steps", {}).get("model") if hasattr(model, "named_steps") else model
    return estimator.__class__.__name__


def _read_metrics_file() -> dict[str, Any]:
    path = settings.resolved_metrics_path
    if not path.exists():
        return {}


def _read_json_file(path, label: str, required: bool = True) -> dict[str, Any]:
    if not path.exists():
        if required:
            raise HTTPException(status_code=404, detail=f"{label} has not been generated. Train the models first.")
        return {}
    try:
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as exc:
        logger.warning("Could not read %s at %s: %s", label, path, exc)
        raise HTTPException(status_code=500, detail=f"{label} could not be read: {exc}") from exc
    try:
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as exc:
        logger.warning("Could not read metrics file %s: %s", path, exc)
        return {}


def _stat_block(series: pd.Series) -> dict[str, float | None]:
    values = pd.to_numeric(series, errors="coerce").dropna()
    if values.empty:
        return {"min": None, "max": None, "mean": None, "median": None}
    return {
        "min": round(float(values.min()), 2),
        "max": round(float(values.max()), 2),
        "mean": round(float(values.mean()), 2),
        "median": round(float(values.median()), 2),
    }


def _top_counts(df: pd.DataFrame, column: str, limit: int = 8) -> list[dict[str, Any]]:
    if column not in df.columns:
        return []
    counts = df[column].fillna("Unknown").astype(str).value_counts().head(limit)
    return [{"value": str(value), "count": int(count)} for value, count in counts.items()]


def _metrics_rows(metrics: dict[str, Any]) -> list[dict[str, Any]]:
    rows = list(metrics.get("regression", []))
    classification = metrics.get("classification")
    if classification:
        if "f1_score" in classification and "f1_macro" not in classification:
            classification["f1_macro"] = classification.pop("f1_score")
        rows.append(classification)
    return rows


def _regression_reliability(report: dict[str, Any]) -> dict[str, Any]:
    best = report.get("best_model", {})
    r2 = best.get("r2_score")
    rmse = best.get("rmse")
    cv_rmse = best.get("cv_rmse_mean")
    if isinstance(r2, (int, float)) and r2 >= 0.7:
        label = "strong"
    elif isinstance(r2, (int, float)) and r2 >= 0.3:
        label = "moderate"
    else:
        label = "low"
    return {
        "label": label,
        "basis": "Derived from held-out R2, RMSE, and cross-validation RMSE; it is not a statistical confidence interval.",
        "r2_score": r2,
        "rmse": rmse,
        "cv_rmse_mean": cv_rmse,
    }


def _estimated_range(predicted: float, report: dict[str, Any]) -> dict[str, float | None]:
    rmse = report.get("best_model", {}).get("rmse")
    if not isinstance(rmse, (int, float)):
        return {"lower": None, "upper": None, "basis_rmse": None}
    return {
        "lower": round(max(predicted - rmse, 0), 2),
        "upper": round(max(predicted + rmse, 0), 2),
        "basis_rmse": round(float(rmse), 2),
    }


def _distribution_warnings(input_data: PropertyPredictionInput, report: dict[str, Any]) -> list[str]:
    dataset = report.get("dataset", {})
    ranges = dataset.get("feature_ranges", {})
    warnings: list[str] = []
    input_values = input_data.model_dump()
    for column in ("surface_m2", "bedrooms", "bathrooms", "floor", "property_age"):
        bounds = ranges.get(column)
        value = input_values.get(column)
        if not isinstance(bounds, dict) or value is None:
            continue
        min_value = bounds.get("min")
        max_value = bounds.get("max")
        if isinstance(min_value, (int, float)) and value < min_value:
            warnings.append(f"{column}={value} is below the training minimum ({min_value}).")
        if isinstance(max_value, (int, float)) and value > max_value:
            warnings.append(f"{column}={value} is above the training maximum ({max_value}).")

    known_cities = set(dataset.get("known_cities", []))
    known_districts = set(dataset.get("known_districts", []))
    known_property_types = set(dataset.get("known_property_types", []))
    if known_cities and input_data.city not in known_cities:
        warnings.append(f"City '{input_data.city}' was not observed in the regression training data.")
    if known_districts and input_data.district not in known_districts:
        warnings.append(f"District '{input_data.district}' was not observed in the regression training data.")
    if known_property_types and input_data.property_type not in known_property_types:
        warnings.append(f"Property type '{input_data.property_type}' was not observed in the regression training data.")

    r2 = report.get("best_model", {}).get("r2_score")
    if isinstance(r2, (int, float)) and r2 < 0.3:
        warnings.append("Regression validation performance is weak; interpret individual predictions cautiously.")
    return warnings


class MLService:
    @staticmethod
    def ensure_price_model_ready() -> None:
        loader.reload()
        if not loader.price_model_ready:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Price model is not loaded. Run "
                    "python -m backend.app.models.train_regression from the project root."
                ),
            )

    @staticmethod
    def ensure_classification_model_ready() -> None:
        loader.reload()
        if not loader.classification_model_ready:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "Classification model is not loaded. Run "
                    "python -m backend.app.models.train_classifier from the project root."
                ),
            )

    @staticmethod
    def db_health() -> DBHealthResponse:
        try:
            connection_status = check_database_connection()
            table_status = get_ml_feature_table_status()
        except Exception as exc:
            logger.exception("Database health check failed: %s", exc)
            raise HTTPException(status_code=503, detail=f"Database health check failed: {exc}") from exc
        return DBHealthResponse(database=connection_status.get("database"), **table_status)

    @staticmethod
    def model_status() -> ModelStatusResponse:
        loader.reload()
        return ModelStatusResponse(**loader.status())

    @staticmethod
    def train() -> TrainingResponse:
        try:
            report = run_training_pipeline()
            loader.reload()
            return TrainingResponse(**report)
        except Exception as exc:
            logger.exception("Training failed: %s", exc)
            raise HTTPException(status_code=500, detail=f"Training failed: {exc}") from exc

    @staticmethod
    def predict_price(input_data: PropertyPredictionInput) -> PropertyPredictionOutput:
        MLService.ensure_price_model_ready()
        if loader.price_model is None:
            raise HTTPException(status_code=503, detail="Price model is not loaded.")
        try:
            predicted = float(loader.price_model.predict(_input_to_frame(input_data))[0])
        except Exception as exc:
            logger.exception("Price prediction failed: %s", exc)
            raise HTTPException(status_code=422, detail=f"Price prediction failed: {exc}") from exc

        report = _read_json_file(settings.resolved_regression_report_path, "Regression report", required=False)
        predicted = max(predicted, 0.0)
        warnings = _distribution_warnings(input_data, report) if report else []
        return PropertyPredictionOutput(
            predicted_price=round(predicted, 2),
            estimated_range=_estimated_range(predicted, report) if report else {"lower": None, "upper": None, "basis_rmse": None},
            model_reliability_indicator=_regression_reliability(report) if report else {"label": "unknown", "basis": "Regression report missing."},
            out_of_distribution_warning=bool(warnings),
            warnings=warnings,
            model_name=_model_name(loader.price_model),
        )

    @staticmethod
    def predict_classification(input_data: ClassificationInput) -> ClassificationOutput:
        MLService.ensure_classification_model_ready()
        if loader.classification_model is None:
            raise HTTPException(status_code=503, detail="Classification model is not loaded.")
        try:
            frame = _input_to_frame(input_data)
            predicted_label = str(loader.classification_model.predict(frame)[0])
            probabilities: dict[str, float] = {}
            if hasattr(loader.classification_model, "predict_proba"):
                proba = loader.classification_model.predict_proba(frame)[0]
                classes = getattr(loader.classification_model, "classes_", [])
                probabilities = {str(label): round(float(prob), 4) for label, prob in zip(classes, proba, strict=False)}
            confidence = max(probabilities.values()) if probabilities else 1.0
        except Exception as exc:
            logger.exception("Classification prediction failed: %s", exc)
            raise HTTPException(status_code=422, detail=f"Classification prediction failed: {exc}") from exc

        classification_report = _read_json_file(settings.resolved_classification_report_path, "Classification report", required=False)
        label_source = classification_report.get("dataset", {}).get("label_source") or _read_metrics_file().get("classification", {}).get("label_source")
        return ClassificationOutput(
            predicted_label=predicted_label,
            confidence_score=round(float(confidence), 4),
            class_probabilities=probabilities,
            label_source=label_source,
            model_name=_model_name(loader.classification_model),
        )

    @staticmethod
    def metrics() -> list[ModelMetric]:
        return [ModelMetric(**row) for row in _metrics_rows(_read_metrics_file())]

    @staticmethod
    def regression_report() -> ArtifactResponse:
        return ArtifactResponse(data=_read_json_file(settings.resolved_regression_report_path, "Regression report"))

    @staticmethod
    def classification_report() -> ArtifactResponse:
        return ArtifactResponse(data=_read_json_file(settings.resolved_classification_report_path, "Classification report"))

    @staticmethod
    def error_analysis() -> ArtifactResponse:
        return ArtifactResponse(data=_read_json_file(settings.resolved_error_analysis_path, "Error analysis"))

    @staticmethod
    def feature_importance() -> ArtifactResponse:
        return ArtifactResponse(data=_read_json_file(settings.resolved_feature_importance_path, "Feature importance"))

    @staticmethod
    def dataset_summary() -> DatasetSummary:
        table_status = get_ml_feature_table_status()
        if table_status["status"] != "ok":
            raise HTTPException(status_code=503, detail=table_status["message"])
        df = load_ml_property_features()
        missing_values = [
            {
                "column": column,
                "missing_count": int(count),
                "missing_ratio": round(float(count / max(len(df), 1)), 4),
            }
            for column, count in df.isna().sum().sort_values(ascending=False).items()
        ]
        numeric_columns = df.select_dtypes(include=["number", "bool"]).columns.tolist()
        categorical_columns = df.select_dtypes(include=["object", "category"]).columns.tolist()
        return DatasetSummary(
            source_table=ML_TABLE_QUALIFIED,
            row_count=int(df.shape[0]),
            column_count=int(df.shape[1]),
            columns=df.columns.tolist(),
            numeric_columns=numeric_columns,
            categorical_columns=categorical_columns,
            missing_values=missing_values,
            sample_records=df.head(10).replace({np.nan: None}).to_dict("records"),
            missing_required_columns=table_status["missing_required_columns"],
            missing_recommended_columns=table_status["missing_recommended_columns"],
            price=_stat_block(df["price"]) if "price" in df.columns else _stat_block(pd.Series(dtype=float)),
            surface_m2=_stat_block(df["surface_m2"]) if "surface_m2" in df.columns else _stat_block(pd.Series(dtype=float)),
            cities=_top_counts(df, "city"),
            districts=_top_counts(df, "district"),
        )

    @staticmethod
    def properties(limit: int = 25) -> list[PropertyRecord]:
        df = create_features(load_ml_property_features(), include_target_features=True)
        df = df.dropna(subset=["price", "surface_m2"]).head(limit)
        records: list[PropertyRecord] = []
        for idx, row in df.reset_index(drop=True).iterrows():
            bedrooms = pd.to_numeric(pd.Series([row.get("bedrooms", 0)]), errors="coerce").fillna(0).iloc[0]
            bathrooms = pd.to_numeric(pd.Series([row.get("bathrooms", 0)]), errors="coerce").fillna(0).iloc[0]
            records.append(
                PropertyRecord(
                    id=str(row.get("id") or idx + 1),
                    city=str(row.get("city", "Unknown")),
                    district=str(row.get("district", "Unknown")),
                    property_type=str(row.get("property_type", "Unknown")),
                    price=float(row["price"]),
                    surface_m2=float(row["surface_m2"]),
                    bedrooms=int(bedrooms),
                    bathrooms=int(bathrooms),
                    status="Actual",
                )
            )
        return records

    @staticmethod
    def analytics() -> AnalyticsData:
        df = create_features(load_ml_property_features(), include_target_features=True)
        df = df.dropna(subset=["price"])
        price_bins = [0, 500_000, 1_000_000, 2_000_000, 4_000_000, 8_000_000, float("inf")]
        labels = ["0-500k", "500k-1M", "1M-2M", "2M-4M", "4M-8M", "8M+"]
        distribution = pd.cut(df["price"], bins=price_bins, labels=labels, include_lowest=True).value_counts().sort_index()
        trends = (
            df.groupby("listing_month", as_index=False)["price"]
            .mean()
            .sort_values("listing_month")
            .assign(month=lambda data: data["listing_month"].astype(int).astype(str))
        )

        feature_importance = _read_json_file(settings.resolved_feature_importance_path, "Feature importance", required=False)
        regression_importance = feature_importance.get("regression", {}).get("top_features", [])
        importance = [
            {"feature": str(row.get("feature")), "score": float(row.get("importance", 0))}
            for row in regression_importance[:10]
        ]

        return AnalyticsData(
            price_distribution=[{"price": str(label), "count": int(distribution.loc[label])} for label in labels],
            market_trends=[
                {"month": str(row["month"]), "price": round(float(row["price"]) / 1_000_000, 2)}
                for _, row in trends.iterrows()
            ],
            feature_importance=importance,
        )
