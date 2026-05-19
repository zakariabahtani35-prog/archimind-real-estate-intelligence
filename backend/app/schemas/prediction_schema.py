from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class APIModel(BaseModel):
    model_config = ConfigDict(protected_namespaces=())


class PropertyPredictionInput(APIModel):
    city: str = Field(min_length=1, max_length=80)
    district: str = Field(min_length=1, max_length=120)
    surface_m2: float = Field(gt=10, lt=2_000)
    bedrooms: int = Field(ge=0, le=20)
    bathrooms: int = Field(ge=0, le=20)
    property_type: str = Field(default="Apartment", min_length=1, max_length=80)
    floor: int | None = Field(default=0, ge=-2, le=100)
    property_age: int = Field(default=0, ge=0, le=150)
    price_per_m2: float | None = Field(default=None, gt=0)
    parking: bool = False
    furnished: bool = False
    rooms: int | None = Field(default=None, ge=0, le=80)

    @field_validator("city", "district", "property_type", mode="before")
    @classmethod
    def reject_empty_text(cls, value: Any) -> str:
        if not isinstance(value, str):
            raise ValueError("must be text")
        stripped = value.strip()
        if not stripped:
            raise ValueError("cannot be empty")
        return stripped

    @field_validator("surface_m2", "price_per_m2", mode="before")
    @classmethod
    def reject_string_float(cls, value: Any) -> Any:
        if value is None:
            return value
        if isinstance(value, str):
            raise ValueError("must be a numeric JSON value, not a string")
        return value

    @field_validator("bedrooms", "bathrooms", "floor", "property_age", "rooms", mode="before")
    @classmethod
    def reject_string_int(cls, value: Any) -> Any:
        if value is None:
            return value
        if isinstance(value, str):
            raise ValueError("must be an integer JSON value, not a string")
        return value

    @model_validator(mode="after")
    def normalize_rooms(self) -> "PropertyPredictionInput":
        if self.rooms is None:
            self.rooms = self.bedrooms
        return self


class PropertyPredictionOutput(APIModel):
    predicted_price: float
    estimated_range: dict[str, float | None]
    model_reliability_indicator: dict[str, Any]
    out_of_distribution_warning: bool
    warnings: list[str]
    model_name: str


class ClassificationInput(PropertyPredictionInput):
    pass


class ClassificationOutput(APIModel):
    predicted_label: str
    confidence_score: float
    class_probabilities: dict[str, float]
    label_source: str | None = None
    model_name: str


class ModelMetric(APIModel):
    name: str
    mae: float | None = None
    mse: float | None = None
    rmse: float | None = None
    r2_score: float | None = None
    accuracy: float | None = None
    precision_macro: float | None = None
    recall_macro: float | None = None
    f1_macro: float | None = None
    roc_auc_macro: float | None = None
    cv_score_mean: float | None = None
    cv_score_std: float | None = None
    cv_rmse_mean: float | None = None
    cv_rmse_std: float | None = None
    label_source: str | None = None
    status: str


class TrainingResponse(APIModel):
    rows: int
    columns: int
    regression: list[ModelMetric]
    classification: ModelMetric


class HealthResponse(APIModel):
    status: str
    app_name: str
    version: str
    price_model_ready: bool
    classification_model_ready: bool


class DBHealthResponse(APIModel):
    status: str
    database: str | None = None
    table_schema: str
    table_name: str
    table_exists: bool
    row_count: int | None = None
    columns: list[str]
    missing_required_columns: list[str]
    missing_recommended_columns: list[str]
    message: str


class ModelStatusResponse(APIModel):
    price_model_ready: bool
    classification_model_ready: bool
    price_model_path: str
    classification_model_path: str
    regression_report_ready: bool = False
    classification_report_ready: bool = False
    error_analysis_ready: bool = False
    feature_importance_ready: bool = False
    latest_training_timestamp: str | None = None


class DatasetSummary(APIModel):
    source_table: str
    row_count: int
    column_count: int
    columns: list[str]
    numeric_columns: list[str] = []
    categorical_columns: list[str] = []
    missing_values: list[dict[str, Any]] = []
    sample_records: list[dict[str, Any]] = []
    missing_required_columns: list[str]
    missing_recommended_columns: list[str]
    price: dict[str, float | None]
    surface_m2: dict[str, float | None]
    cities: list[dict[str, Any]]
    districts: list[dict[str, Any]]


class PropertyRecord(APIModel):
    id: str
    city: str
    district: str
    property_type: str
    price: float
    surface_m2: float
    bedrooms: int
    bathrooms: int
    status: str


class AnalyticsData(APIModel):
    price_distribution: list[dict[str, float | int | str]]
    market_trends: list[dict[str, float | int | str]]
    feature_importance: list[dict[str, float | int | str]]


class ArtifactResponse(APIModel):
    data: dict[str, Any]
