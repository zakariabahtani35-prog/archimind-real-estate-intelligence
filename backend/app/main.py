from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from .core.config import settings
from .schemas import (
    PricePredictionInput, 
    PricePredictionResponse, 
    ClassificationInput, 
    ClassificationResponse,
    ModelMetrics,
    PropertyRecord
)
from .ml_service import MLService

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "operational",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }

@app.post("/predict-price", response_model=PricePredictionResponse)
async def predict_price(input_data: PricePredictionInput):
    return await MLService.predict_price(input_data)

@app.post("/predict-type", response_model=ClassificationResponse)
async def predict_type(input_data: ClassificationInput):
    return await MLService.predict_type(input_data)

@app.get("/metrics", response_model=List[ModelMetrics])
async def get_metrics():
    # Return placeholder metrics
    return [
        {
            "mae": "124,500", "mse": "1.5B", "rmse": "156,000", "r2_score": "0.942",
            "accuracy": "94.8%", "precision": "0.92", "recall": "0.91", "f1_score": "0.915",
            "roc_auc": "0.96", "status": "Best", "name": "Regressor v2.4 (XGBoost)"
        }
    ]

@app.get("/properties", response_model=List[PropertyRecord])
async def get_properties():
    # TODO: Fetch from PostgreSQL ml_schema.obt_real_estate
    return []

@app.get("/analytics")
async def get_analytics():
    # TODO: Return real aggregated distribution data
    return {
        "price_distribution": [],
        "market_trends": [],
        "feature_importance": []
    }
