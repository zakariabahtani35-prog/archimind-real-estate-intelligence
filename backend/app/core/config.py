from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import quote_plus

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BASE_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(PROJECT_ROOT / ".env", BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    ENVIRONMENT: Literal["development", "staging", "production", "test"]
    APP_NAME: str
    APP_VERSION: str
    APP_URL: str
    DEBUG: bool
    LOG_LEVEL: str = Field(pattern="^(debug|info|warning|error|critical)$")

    DB_HOST: str
    DB_PORT: int = Field(gt=0, le=65535)
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: SecretStr

    SECRET_KEY: SecretStr
    JWT_SECRET: SecretStr
    GEMINI_API_KEY: SecretStr | None = None

    CORS_ORIGINS: str
    PRICE_MODEL_PATH: Path
    CLASSIFICATION_MODEL_PATH: Path
    UPLOAD_DIR: Path

    @field_validator("APP_URL")
    @classmethod
    def validate_app_url(cls, value: str) -> str:
        if not value.startswith(("http://", "https://")):
            raise ValueError("APP_URL must start with http:// or https://")
        return value.rstrip("/")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def database_url(self) -> str:
        password = quote_plus(self.DB_PASSWORD.get_secret_value())
        return f"postgresql://{self.DB_USER}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def price_model_path(self) -> Path:
        return self._resolve_path(self.PRICE_MODEL_PATH)

    @property
    def classification_model_path(self) -> Path:
        return self._resolve_path(self.CLASSIFICATION_MODEL_PATH)

    @property
    def upload_dir(self) -> Path:
        return self._resolve_path(self.UPLOAD_DIR)

    @model_validator(mode="after")
    def validate_security(self) -> "Settings":
        if not self.cors_origins:
            raise ValueError("CORS_ORIGINS must include at least one origin")

        if self.ENVIRONMENT == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be false in production")
            if "*" in self.cors_origins:
                raise ValueError("CORS_ORIGINS cannot contain '*' in production")

            insecure_values = {
                "change_me",
                "change_this_secret",
                "change_this_jwt_secret",
                "postgres",
                "password",
            }
            secrets = {
                "DB_PASSWORD": self.DB_PASSWORD.get_secret_value(),
                "SECRET_KEY": self.SECRET_KEY.get_secret_value(),
                "JWT_SECRET": self.JWT_SECRET.get_secret_value(),
            }
            for name, value in secrets.items():
                if value in insecure_values or len(value) < 32:
                    raise ValueError(f"{name} must be a strong production secret")

        return self

    @staticmethod
    def _resolve_path(path: Path) -> Path:
        return path if path.is_absolute() else (PROJECT_ROOT / path).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
