from functools import lru_cache
from pathlib import Path
from urllib.parse import quote_plus

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(PROJECT_ROOT / ".env", BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(
        "ArchiMind AI Real Estate ML API",
        validation_alias=AliasChoices("APP_NAME", "app_name"),
    )
    app_version: str = Field(
        "1.0.0",
        validation_alias=AliasChoices("APP_VERSION", "app_version"),
    )
    log_level: str = Field("INFO", validation_alias=AliasChoices("LOG_LEVEL", "log_level"))
    db_host: str = Field("127.0.0.1", validation_alias=AliasChoices("DB_HOST", "db_host"))
    db_port: int = Field(5432, validation_alias=AliasChoices("DB_PORT", "db_port"))
    db_name: str = Field("avito_db", validation_alias=AliasChoices("DB_NAME", "db_name"))
    db_user: str = Field("postgres", validation_alias=AliasChoices("DB_USER", "db_user"))
    db_password: str = Field("1234", validation_alias=AliasChoices("DB_PASSWORD", "db_password"))
    database_url: str | None = Field(
        default=None,
        validation_alias=AliasChoices("DATABASE_URL", "database_url"),
    )
    allow_sqlite_demo: bool = Field(
        False,
        validation_alias=AliasChoices("ALLOW_SQLITE_DEMO", "allow_sqlite_demo"),
    )
    cors_origins: str = Field(
        "http://localhost:3000,http://localhost:5173",
        validation_alias=AliasChoices("CORS_ORIGINS", "cors_origins"),
    )
    price_model_path: Path = Field(
        Path("backend/app/artifacts/price_model.pkl"),
        validation_alias=AliasChoices("PRICE_MODEL_PATH", "MODEL_PATH", "price_model_path"),
    )
    classification_model_path: Path = Field(
        Path("backend/app/artifacts/classification_model.pkl"),
        validation_alias=AliasChoices("CLASSIFICATION_MODEL_PATH", "classification_model_path"),
    )
    metrics_path: Path = Field(
        Path("backend/app/artifacts/metrics.json"),
        validation_alias=AliasChoices("METRICS_PATH", "metrics_path"),
    )
    regression_report_path: Path = Field(
        Path("backend/app/artifacts/regression_report.json"),
        validation_alias=AliasChoices("REGRESSION_REPORT_PATH", "regression_report_path"),
    )
    classification_report_path: Path = Field(
        Path("backend/app/artifacts/classification_report.json"),
        validation_alias=AliasChoices("CLASSIFICATION_REPORT_PATH", "classification_report_path"),
    )
    error_analysis_path: Path = Field(
        Path("backend/app/artifacts/error_analysis.json"),
        validation_alias=AliasChoices("ERROR_ANALYSIS_PATH", "error_analysis_path"),
    )
    feature_importance_path: Path = Field(
        Path("backend/app/artifacts/feature_importance.json"),
        validation_alias=AliasChoices("FEATURE_IMPORTANCE_PATH", "feature_importance_path"),
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            if self.database_url.startswith("sqlite") and not self.allow_sqlite_demo:
                raise ValueError(
                    "SQLite DATABASE_URL is disabled for this project. "
                    "Use PostgreSQL DB_* variables or set ALLOW_SQLITE_DEMO=true only for emergency demos."
                )
            return self.database_url

        username = quote_plus(self.db_user)
        password = quote_plus(self.db_password)
        host = self.db_host
        database = quote_plus(self.db_name)
        return f"postgresql+psycopg2://{username}:{password}@{host}:{self.db_port}/{database}"

    @property
    def safe_database_url(self) -> str:
        password = quote_plus(self.db_password)
        return self.resolved_database_url.replace(f":{password}@", ":***@")

    def resolve_path(self, path: Path) -> Path:
        if path.is_absolute():
            return path
        if path.parts and path.parts[0] == "app":
            return (BACKEND_ROOT / path).resolve()
        return (PROJECT_ROOT / path).resolve()

    @property
    def resolved_price_model_path(self) -> Path:
        return self.resolve_path(self.price_model_path)

    @property
    def resolved_classification_model_path(self) -> Path:
        return self.resolve_path(self.classification_model_path)

    @property
    def resolved_metrics_path(self) -> Path:
        return self.resolve_path(self.metrics_path)

    @property
    def resolved_regression_report_path(self) -> Path:
        return self.resolve_path(self.regression_report_path)

    @property
    def resolved_classification_report_path(self) -> Path:
        return self.resolve_path(self.classification_report_path)

    @property
    def resolved_error_analysis_path(self) -> Path:
        return self.resolve_path(self.error_analysis_path)

    @property
    def resolved_feature_importance_path(self) -> Path:
        return self.resolve_path(self.feature_importance_path)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
