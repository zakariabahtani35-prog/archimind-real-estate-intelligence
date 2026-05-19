from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

MAJOR_CITIES = {"Casablanca", "Rabat", "Marrakech", "Tangier", "Tanger", "Agadir"}
COASTAL_CITIES = {"Casablanca", "Rabat", "Tangier", "Tanger", "Agadir", "Tetouan", "Kenitra", "Kénitra"}

FEATURE_DOCUMENTATION: dict[str, str] = {
    "log_price": "Natural log transform of price, used only for target diagnostics and never as a prediction input.",
    "price_per_m2": "Price divided by usable surface area; used for diagnostics and derived price-band classification labels.",
    "rooms_total": "Bedrooms plus bathrooms after numeric coercion.",
    "surface_per_room": "Surface area divided by total rooms with a one-room lower bound to avoid division by zero.",
    "room_density": "Total rooms divided by surface area with a one-square-meter lower bound.",
    "surface_x_rooms": "Interaction feature between surface area and total rooms.",
    "property_age_bucket": "Categorical age segment: new, recent, established, old, or historic.",
    "city_market_index": "Training-fold city price index learned inside the sklearn pipeline from y.",
    "district_market_index": "Training-fold district price index learned inside the sklearn pipeline from y.",
    "listing_year": "Year extracted from created_at/listing_date/scraped_year when available.",
    "listing_month": "Month extracted from created_at/listing_date/scraped_month when available.",
    "listing_quarter": "Calendar quarter derived from listing_month.",
    "listing_season": "Season derived from listing_month.",
    "city_district": "Combined city and district categorical location token.",
    "is_major_city": "Boolean flag for major Moroccan market cities.",
    "is_coastal_city": "Boolean flag for coastal market cities.",
    "city_tier": "Coarse city tier for large, medium, and smaller city markets.",
}


def normalize_property_columns(df: pd.DataFrame) -> pd.DataFrame:
    data = df.copy()
    rename_map = {}
    if "surface" in data.columns and "surface_m2" not in data.columns:
        rename_map["surface"] = "surface_m2"
    if "type" in data.columns and "property_type" not in data.columns:
        rename_map["type"] = "property_type"
    if "rooms" in data.columns and "bedrooms" not in data.columns:
        rename_map["rooms"] = "bedrooms"
    if rename_map:
        data = data.rename(columns=rename_map)
    return data


def _safe_positive(series: pd.Series, lower: float = 1.0) -> pd.Series:
    values = pd.to_numeric(series, errors="coerce")
    return values.clip(lower=lower)


def _listing_datetime(data: pd.DataFrame) -> pd.Series:
    for column in ("created_at", "listing_date", "scraped_at", "updated_at"):
        if column in data.columns:
            parsed = pd.to_datetime(data[column], errors="coerce")
            if parsed.notna().any():
                return parsed
    return pd.Series(pd.Timestamp("2025-01-01"), index=data.index)


def _season_from_month(month: pd.Series) -> pd.Series:
    month_values = pd.to_numeric(month, errors="coerce").fillna(1).astype(int)
    return pd.cut(
        month_values,
        bins=[0, 2, 5, 8, 11, 12],
        labels=["winter", "spring", "summer", "autumn", "winter"],
        ordered=False,
        include_lowest=True,
    ).astype(str)


def create_features(
    df: pd.DataFrame,
    include_target_features: bool = True,
    city_market_index: dict[str, float] | None = None,
    district_market_index: dict[str, float] | None = None,
    global_market_index: float = 1.0,
) -> pd.DataFrame:
    data = normalize_property_columns(df)

    numeric_defaults = {
        "surface_m2": np.nan,
        "bedrooms": 0,
        "bathrooms": 0,
        "property_age": 0,
        "floor": 0,
    }
    for column, default in numeric_defaults.items():
        if column not in data.columns:
            data[column] = default
        data[column] = pd.to_numeric(data[column], errors="coerce")

    for column in ("city", "district", "property_type"):
        if column not in data.columns:
            data[column] = "Unknown"
        data[column] = data[column].fillna("Unknown").astype(str).str.strip().replace("", "Unknown")

    for column in ("parking", "furnished"):
        if column not in data.columns:
            data[column] = False
        data[column] = data[column].fillna(False).astype(bool)

    data["rooms_total"] = data["bedrooms"].fillna(0) + data["bathrooms"].fillna(0)
    positive_surface = _safe_positive(data["surface_m2"])
    positive_rooms = _safe_positive(data["rooms_total"])
    data["surface_per_room"] = data["surface_m2"].fillna(0) / positive_rooms
    data["room_density"] = positive_rooms / positive_surface
    data["surface_x_rooms"] = data["surface_m2"].fillna(0) * data["rooms_total"].fillna(0)
    data["bathrooms_per_bedroom"] = data["bathrooms"].fillna(0) / _safe_positive(data["bedrooms"])
    data["property_age_bucket"] = pd.cut(
        data["property_age"].fillna(0).clip(lower=0),
        bins=[-1, 2, 10, 25, 50, np.inf],
        labels=["new", "recent", "established", "old", "historic"],
    ).astype(str)

    data["city_district"] = data["city"] + "_" + data["district"]
    data["is_major_city"] = data["city"].isin(MAJOR_CITIES)
    data["is_coastal_city"] = data["city"].isin(COASTAL_CITIES)
    data["city_tier"] = np.select(
        [data["city"].isin({"Casablanca", "Rabat"}), data["city"].isin(MAJOR_CITIES)],
        ["tier_1", "tier_2"],
        default="tier_3",
    )

    city_index = city_market_index or {}
    district_index = district_market_index or {}
    data["city_market_index"] = data["city"].map(city_index).fillna(global_market_index).astype(float)
    data["district_market_index"] = data["district"].map(district_index).fillna(global_market_index).astype(float)

    listing_date = _listing_datetime(data)
    data["listing_year"] = listing_date.dt.year.fillna(2025).astype(int)
    data["listing_month"] = listing_date.dt.month.fillna(1).astype(int)
    if "scraped_year" in data.columns:
        scraped_year = pd.to_numeric(data["scraped_year"], errors="coerce")
        data["listing_year"] = scraped_year.fillna(data["listing_year"]).astype(int)
    if "scraped_month" in data.columns:
        scraped_month = pd.to_numeric(data["scraped_month"], errors="coerce")
        data["listing_month"] = scraped_month.fillna(data["listing_month"]).astype(int)
    data["listing_quarter"] = (((data["listing_month"] - 1) // 3) + 1).clip(1, 4).astype(int)
    data["listing_season"] = _season_from_month(data["listing_month"])

    if include_target_features and "price" in data.columns:
        data["price"] = pd.to_numeric(data["price"], errors="coerce")
        if "price_per_m2" in data.columns:
            data["price_per_m2"] = pd.to_numeric(data["price_per_m2"], errors="coerce")
        else:
            data["price_per_m2"] = pd.Series(np.nan, index=data.index)
        data["price_per_m2"] = data["price_per_m2"].fillna(data["price"] / positive_surface)
        data["log_price"] = np.log1p(data["price"].clip(lower=0))

    return data


class RealEstateFeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self) -> None:
        self.global_market_index_: float = 1.0
        self.city_market_index_: dict[str, float] = {}
        self.district_market_index_: dict[str, float] = {}

    def fit(self, X: pd.DataFrame, y=None):
        if y is None:
            return self

        data = normalize_property_columns(pd.DataFrame(X).copy())
        target = pd.to_numeric(pd.Series(y), errors="coerce")
        valid = target.notna() & (target > 0)
        if not valid.any():
            return self

        self.global_market_index_ = float(target.loc[valid].median())
        if "city" in data.columns:
            city_values = data.loc[valid, "city"].fillna("Unknown").astype(str).str.strip().replace("", "Unknown")
            self.city_market_index_ = target.loc[valid].groupby(city_values).median().astype(float).to_dict()
        if "district" in data.columns:
            district_values = data.loc[valid, "district"].fillna("Unknown").astype(str).str.strip().replace("", "Unknown")
            self.district_market_index_ = target.loc[valid].groupby(district_values).median().astype(float).to_dict()
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        return create_features(
            pd.DataFrame(X).copy(),
            include_target_features=False,
            city_market_index=self.city_market_index_,
            district_market_index=self.district_market_index_,
            global_market_index=self.global_market_index_,
        )
