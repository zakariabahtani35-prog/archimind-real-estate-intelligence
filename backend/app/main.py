from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.models.model_loader import loader
from backend.app.schemas.prediction_schema import (
    AnalyticsData,
    ArtifactResponse,
    ClassificationInput,
    ClassificationOutput,
    DatasetSummary,
    DBHealthResponse,
    HealthResponse,
    ModelMetric,
    ModelStatusResponse,
    PropertyPredictionInput,
    PropertyPredictionOutput,
    PropertyRecord,
    TrainingResponse,
)
from backend.app.services.ml_service import MLService

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    loader.reload()
    logger.info(
        "API started. price_model_ready=%s classification_model_ready=%s",
        loader.price_model_ready,
        loader.classification_model_ready,
    )


@app.get("/", response_model=HealthResponse)
@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    loader.reload()
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        version=settings.app_version,
        price_model_ready=loader.price_model_ready,
        classification_model_ready=loader.classification_model_ready,
    )


@app.get("/db/health", response_model=DBHealthResponse)
def db_health() -> DBHealthResponse:
    return MLService.db_health()


@app.get("/models/status", response_model=ModelStatusResponse)
def models_status() -> ModelStatusResponse:
    return MLService.model_status()


@app.post("/predict/price", response_model=PropertyPredictionOutput)
@app.post("/predict", response_model=PropertyPredictionOutput)
@app.post("/predict-price", response_model=PropertyPredictionOutput)
def predict_property_price(input_data: PropertyPredictionInput) -> PropertyPredictionOutput:
    return MLService.predict_price(input_data)


@app.post("/predict/classification", response_model=ClassificationOutput)
@app.post("/predict-type", response_model=ClassificationOutput)
def predict_classification(input_data: ClassificationInput) -> ClassificationOutput:
    return MLService.predict_classification(input_data)


@app.post("/train", response_model=TrainingResponse)
def train_models() -> TrainingResponse:
    return MLService.train()


@app.get("/metrics", response_model=list[ModelMetric])
def get_metrics() -> list[ModelMetric]:
    return MLService.metrics()


@app.get("/metrics/regression", response_model=ArtifactResponse)
def get_regression_metrics() -> ArtifactResponse:
    return MLService.regression_report()


@app.get("/metrics/classification", response_model=ArtifactResponse)
def get_classification_metrics() -> ArtifactResponse:
    return MLService.classification_report()


@app.get("/metrics/error-analysis", response_model=ArtifactResponse)
def get_error_analysis() -> ArtifactResponse:
    return MLService.error_analysis()


@app.get("/metrics/feature-importance", response_model=ArtifactResponse)
def get_feature_importance() -> ArtifactResponse:
    return MLService.feature_importance()


@app.get("/dataset/summary", response_model=DatasetSummary)
def get_dataset_summary() -> DatasetSummary:
    return MLService.dataset_summary()


@app.get("/properties", response_model=list[PropertyRecord])
def get_properties() -> list[PropertyRecord]:
    return MLService.properties()


@app.get("/analytics", response_model=AnalyticsData)
def get_analytics() -> AnalyticsData:
    return MLService.analytics()
