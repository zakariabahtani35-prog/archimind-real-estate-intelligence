from __future__ import annotations

import logging
from typing import Any

import numpy as np
import pandas as pd
from sqlalchemy import text

from backend.app.core.db import engine

logger = logging.getLogger(__name__)

ML_SCHEMA = "ml_schema"
ML_TABLE = "ml_property_features"
ML_TABLE_QUALIFIED = f"{ML_SCHEMA}.{ML_TABLE}"

REQUIRED_ML_COLUMNS = {"price", "surface_m2"}
RECOMMENDED_ML_COLUMNS = {"city", "district", "bedrooms", "bathrooms", "floor", "price_per_m2"}


class DatasetValidationError(RuntimeError):
    """Raised when the PostgreSQL ML feature table is unavailable or malformed."""


def build_sample_obt(n_rows: int = 750, random_state: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(random_state)
    city_districts = {
        "Casablanca": ["Maarif", "Anfa", "Gauthier", "Ain Diab"],
        "Rabat": ["Agdal", "Hay Riad", "Souissi", "Ocean"],
        "Marrakech": ["Gueliz", "Hivernage", "Palmeraie", "Medina"],
        "Tangier": ["Malabata", "Iberia", "Centre Ville", "Marshan"],
        "Agadir": ["Cite Suisse", "Founty", "Talborjt", "Dakhla"],
        "Fes": ["Narjiss", "Agdal", "Saiss", "Ville Nouvelle"],
        "Kenitra": ["Maamora", "Centre", "Bir Rami", "Mimosas"],
    }
    city_base = {
        "Casablanca": 14500,
        "Rabat": 13200,
        "Marrakech": 11200,
        "Tangier": 10800,
        "Agadir": 9800,
        "Fes": 7600,
        "Kenitra": 7200,
    }
    type_multiplier = {
        "Apartment": 1.0,
        "Villa": 1.85,
        "House": 1.25,
        "Studio": 0.82,
        "Commercial Space": 1.55,
        "Land": 0.58,
    }

    cities = rng.choice(list(city_districts), size=n_rows, p=[0.24, 0.18, 0.15, 0.14, 0.12, 0.09, 0.08])
    property_types = rng.choice(list(type_multiplier), size=n_rows, p=[0.48, 0.12, 0.14, 0.10, 0.08, 0.08])
    rows = []
    for idx, (city, property_type) in enumerate(zip(cities, property_types, strict=True), start=1):
        bedrooms = int(rng.integers(0 if property_type in {"Studio", "Land"} else 1, 6))
        bathrooms = int(rng.integers(0 if property_type == "Land" else 1, 5))
        surface = float(rng.normal(95 + bedrooms * 28, 32))
        if property_type == "Villa":
            surface += float(rng.normal(180, 55))
        if property_type == "Land":
            surface += float(rng.normal(300, 120))
        surface = max(25.0, surface)
        age = int(rng.integers(0, 40))
        parking = bool(rng.random() < (0.65 if property_type in {"Villa", "House"} else 0.38))
        furnished = bool(rng.random() < 0.30)
        district = str(rng.choice(city_districts[city]))
        district_premium = 1.0 + (0.12 if district in {"Anfa", "Souissi", "Hivernage", "Malabata"} else 0.0)
        amenity_value = (85_000 if parking else 0) + (115_000 if furnished else 0)
        age_discount = max(0.68, 1 - age * 0.009)
        noise = rng.normal(1.0, 0.08)
        price = (
            surface
            * city_base[city]
            * type_multiplier[property_type]
            * district_premium
            * age_discount
            * noise
            + bedrooms * 55_000
            + bathrooms * 45_000
            + amenity_value
        )
        rows.append(
            {
                "id": str(idx),
                "city": city,
                "district": district,
                "property_type": property_type,
                "surface_m2": round(surface, 1),
                "bedrooms": bedrooms,
                "bathrooms": bathrooms,
                "property_age": age,
                "floor": int(rng.integers(0, 18)),
                "parking": parking,
                "furnished": furnished,
                "created_at": pd.Timestamp("2024-01-01") + pd.to_timedelta(int(rng.integers(0, 650)), unit="D"),
                "price": round(max(price, 120_000), 2),
            }
        )
    return pd.DataFrame(rows)


def get_ml_feature_columns() -> list[str]:
    query = text(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = :schema_name AND table_name = :table_name
        ORDER BY ordinal_position
        """
    )
    with engine.connect() as connection:
        return [
            str(row["column_name"])
            for row in connection.execute(
                query,
                {"schema_name": ML_SCHEMA, "table_name": ML_TABLE},
            ).mappings()
        ]


def get_ml_feature_table_status() -> dict[str, Any]:
    columns = get_ml_feature_columns()
    table_exists = bool(columns)
    row_count: int | None = None
    if table_exists:
        with engine.connect() as connection:
            row_count = int(connection.execute(text(f"SELECT COUNT(*) FROM {ML_TABLE_QUALIFIED}")).scalar_one())

    missing_required = sorted(REQUIRED_ML_COLUMNS.difference(columns))
    missing_recommended = sorted(RECOMMENDED_ML_COLUMNS.difference(columns))
    status = "ok" if table_exists and not missing_required else "error"
    message = (
        f"{ML_TABLE_QUALIFIED} is ready for ML training."
        if status == "ok"
        else f"{ML_TABLE_QUALIFIED} is missing required columns: {missing_required or 'table not found'}"
    )

    return {
        "status": status,
        "table_schema": ML_SCHEMA,
        "table_name": ML_TABLE,
        "table_exists": table_exists,
        "row_count": row_count,
        "columns": columns,
        "missing_required_columns": missing_required,
        "missing_recommended_columns": missing_recommended,
        "message": message,
    }


def validate_ml_feature_table(required_columns: set[str] | None = None) -> list[str]:
    required = required_columns or REQUIRED_ML_COLUMNS
    columns = get_ml_feature_columns()
    if not columns:
        raise DatasetValidationError(f"Required table {ML_TABLE_QUALIFIED} does not exist or has no columns.")

    missing = sorted(required.difference(columns))
    if missing:
        raise DatasetValidationError(
            f"Table {ML_TABLE_QUALIFIED} is missing required columns: {', '.join(missing)}. "
            f"Available columns: {', '.join(columns)}"
        )
    return columns


def load_ml_property_features(use_sample_on_failure: bool = False) -> pd.DataFrame:
    try:
        validate_ml_feature_table()
        with engine.connect() as connection:
            df = pd.read_sql(text(f"SELECT * FROM {ML_TABLE_QUALIFIED}"), connection)
    except Exception as exc:
        if use_sample_on_failure:
            logger.warning(
                "Falling back to generated demo data after PostgreSQL load failed. "
                "This path is for emergency demos only: %s",
                exc,
            )
            return build_sample_obt()
        raise

    if df.empty:
        raise DatasetValidationError(f"Table {ML_TABLE_QUALIFIED} exists but contains zero rows.")
    logger.info("Loaded %s rows and %s columns from %s.", df.shape[0], df.shape[1], ML_TABLE_QUALIFIED)
    return df


def load_obt_data(use_sample_on_failure: bool = False) -> pd.DataFrame:
    return load_ml_property_features(use_sample_on_failure=use_sample_on_failure)
