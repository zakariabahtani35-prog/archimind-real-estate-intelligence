from __future__ import annotations

import logging
import json
from pathlib import Path
from typing import Any

import joblib

from backend.app.core.config import settings

logger = logging.getLogger(__name__)


def load_model(path: Path) -> Any | None:
    if not path.exists():
        logger.warning("Model artifact does not exist: %s", path)
        return None
    try:
        return joblib.load(path)
    except ModuleNotFoundError as exc:
        logger.warning(
            "Model artifact %s was created with an unavailable Python module (%s). "
            "Regenerate it with python -m backend.app.models.train_regression or train_classifier.",
            path,
            exc.name,
        )
        return None
    except Exception as exc:
        logger.warning("Failed to load model artifact %s: %s", path, exc)
        return None


class ModelLoader:
    def __init__(self) -> None:
        self.price_model: Any | None = None
        self.classification_model: Any | None = None
        self.reload()

    def reload(self) -> None:
        self.price_model = load_model(settings.resolved_price_model_path)
        self.classification_model = load_model(settings.resolved_classification_model_path)

    @property
    def is_price_model_ready(self) -> bool:
        return self.price_model is not None

    @property
    def is_classification_model_ready(self) -> bool:
        return self.classification_model is not None

    @property
    def price_model_ready(self) -> bool:
        return self.is_price_model_ready

    @property
    def classification_model_ready(self) -> bool:
        return self.is_classification_model_ready

    def status(self) -> dict[str, Any]:
        latest_training_timestamp = None
        if settings.resolved_metrics_path.exists():
            try:
                with settings.resolved_metrics_path.open("r", encoding="utf-8") as file:
                    latest_training_timestamp = json.load(file).get("latest_training_timestamp")
            except Exception:
                latest_training_timestamp = None
        return {
            "price_model_ready": self.price_model_ready,
            "classification_model_ready": self.classification_model_ready,
            "price_model_path": str(settings.resolved_price_model_path),
            "classification_model_path": str(settings.resolved_classification_model_path),
            "regression_report_ready": settings.resolved_regression_report_path.exists(),
            "classification_report_ready": settings.resolved_classification_report_path.exists(),
            "error_analysis_ready": settings.resolved_error_analysis_path.exists(),
            "feature_importance_ready": settings.resolved_feature_importance_path.exists(),
            "latest_training_timestamp": latest_training_timestamp,
        }


loader = ModelLoader()
