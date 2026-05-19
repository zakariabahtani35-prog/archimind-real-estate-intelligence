from __future__ import annotations

import logging

from backend.app.data.loader import load_obt_data
from backend.app.features.feature_engineering import create_features
from backend.app.models.train_classifier import train_classification_model
from backend.app.models.train_regression import train_price_model, update_metrics_report

logger = logging.getLogger(__name__)


def run_training_pipeline() -> dict:
    logger.info("Loading extraction OBT.")
    raw_df = load_obt_data()
    featured_df = create_features(raw_df, include_target_features=True)
    logger.info("Training on %s rows and %s columns.", featured_df.shape[0], featured_df.shape[1])

    _, regression_metrics, regression_dataset, regression_report = train_price_model(featured_df)
    _, classification_metrics, classification_dataset, classification_report = train_classification_model(featured_df)
    update_metrics_report(
        regression=regression_metrics,
        classification=classification_metrics,
        dataset=regression_dataset,
        classification_dataset=classification_dataset,
        regression_report=regression_report,
        classification_report=classification_report,
    )

    return {
        "rows": int(featured_df.shape[0]),
        "columns": int(featured_df.shape[1]),
        "regression": regression_metrics,
        "classification": classification_metrics,
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    report = run_training_pipeline()
    print(report)
