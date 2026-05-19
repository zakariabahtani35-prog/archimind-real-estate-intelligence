from __future__ import annotations

from math import sqrt
from typing import Any

from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, mean_squared_error, r2_score


def evaluate_regression_model(model: Any, X_test, y_test) -> dict[str, float]:
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    return {
        "mae": float(mean_absolute_error(y_test, predictions)),
        "mse": float(mse),
        "rmse": float(sqrt(mse)),
        "r2_score": float(r2_score(y_test, predictions)),
    }


def evaluate_classification_model(model: Any, X_test, y_test) -> dict[str, float]:
    predictions = model.predict(X_test)
    return {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "f1_macro": float(f1_score(y_test, predictions, average="macro", zero_division=0)),
    }
