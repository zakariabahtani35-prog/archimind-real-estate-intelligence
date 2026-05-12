from pydantic import BaseModel
from typing import Optional, List, Dict

class PricePredictionInput(BaseModel):
    city: str
    district: str
    property_type: str
    surface_m2: float
    bedrooms: int
    bathrooms: int
    floor: Optional[int] = None
    parking: Optional[bool] = True
    furnished: Optional[bool] = False
    property_age: int

class PricePredictionResponse(BaseModel):
    predicted_price: float
    confidence_score: float
    market_category: str
    risk_level: str
    investment_score: float

class ClassificationInput(PricePredictionInput):
    pass

class ClassificationResponse(BaseModel):
    predicted_type: str
    confidence_score: float
    class_probabilities: Dict[str, float]

class ModelMetrics(BaseModel):
    mae: str
    mse: str
    rmse: str
    r2_score: str
    accuracy: str
    precision: str
    recall: str
    f1_score: str
    roc_auc: str
    status: str
    name: str

class PropertyRecord(BaseModel):
    id: str
    city: str
    district: str
    property_type: str
    price: float
    surface_m2: float
    bedrooms: int
    bathrooms: int
    status: str
    created_at: Optional[str] = None
