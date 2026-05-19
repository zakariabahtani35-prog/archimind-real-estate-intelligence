# ArchiMind AI - Moroccan Real Estate ML Intelligence

ArchiMind AI is a FastAPI + React/Vite machine learning dashboard for Moroccan real estate intelligence. The project demonstrates a reproducible ML workflow from a PostgreSQL operational base table to trained sklearn artifacts, evaluation reports, interpretation views, and live inference.

## Objective

Build a credible portfolio-grade ML platform around this pipeline:

`Extraction OBT → Train/Test Split → Feature Engineering → Scaling/Encoding → Training → Evaluation → Optimization → Export → Dashboard Interpretation`

The application does not use mock CSVs or fake model scores. Training starts from PostgreSQL:

```text
Database: avito_db
Source:   ml_schema.ml_property_features
```

## Architecture

- `backend/app/main.py`: FastAPI app and JSON endpoints.
- `backend/app/data/loader.py`: PostgreSQL loader and ML table validation.
- `backend/app/features/feature_engineering.py`: defensive feature generation.
- `backend/app/models/train_regression.py`: regression model comparison, tuning, export, residual analysis.
- `backend/app/models/train_classifier.py`: classification model comparison, confusion matrix, export.
- `backend/app/artifacts/`: generated `.pkl` models and JSON reports.
- `src/`: React/Vite dashboard for status, prediction, metrics, importance, errors, and dataset inspection.

## Environment

Root `.env` and `backend/.env` should agree:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=avito_db
DB_USER=postgres
DB_PASSWORD=1234
DATABASE_URL=postgresql+psycopg2://postgres:1234@127.0.0.1:5432/avito_db

VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
PRICE_MODEL_PATH=backend/app/artifacts/price_model.pkl
CLASSIFICATION_MODEL_PATH=backend/app/artifacts/classification_model.pkl
METRICS_PATH=backend/app/artifacts/metrics.json
```

The backend builds a PostgreSQL URL from `DB_*` values when `DATABASE_URL` is absent. SQLite is disabled unless `ALLOW_SQLITE_DEMO=true` is explicitly set for emergency demos.

## ML Pipeline

Feature engineering is performed after extraction from `ml_schema.ml_property_features`. The sklearn pipelines learn transformations from the training split and then apply them to validation and inference data.

Generated features include:

- `log_price`
- `price_per_m2`
- `surface_per_room`
- `room_density`
- `surface_x_rooms`
- `property_age_bucket`
- `city_market_index`
- `district_market_index`
- `listing_year`
- `listing_month`
- `listing_quarter`
- `listing_season`

The `city_market_index` and `district_market_index` are supervised encodings learned inside the sklearn pipeline from the training fold to avoid leaking test targets.

## Regression Approach

`python -m backend.app.models.train_regression` trains and compares:

- `LinearRegression`
- `RandomForestRegressor`
- `GradientBoostingRegressor`
- `HistGradientBoostingRegressor`
- `XGBRegressor` when XGBoost is installed

It reports:

- MAE
- MSE
- RMSE
- R2
- Cross-validation mean/std
- GridSearchCV results for the best tree-based candidate

Generated files:

- `backend/app/artifacts/price_model.pkl`
- `backend/app/artifacts/regression_report.json`
- `backend/app/artifacts/error_analysis.json`
- `backend/app/artifacts/feature_importance.json`

## Classification Approach

`python -m backend.app.models.train_classifier` uses a real categorical target when available. If none exists, it derives:

- `low`
- `medium`
- `high`

from `price_per_m2` quantiles.

It compares:

- `LogisticRegression`
- `RandomForestClassifier`
- `GradientBoostingClassifier`

It reports:

- Accuracy
- Precision macro
- Recall macro
- F1 macro
- ROC-AUC macro when possible
- Confusion matrix
- Class distribution
- Cross-validation mean/std

Generated files:

- `backend/app/artifacts/classification_model.pkl`
- `backend/app/artifacts/classification_report.json`
- updated `error_analysis.json`
- updated `feature_importance.json`

If `imbalanced-learn` is installed and the training labels are meaningfully imbalanced, SMOTE is used. Otherwise the pipeline falls back to class weighting where supported and records that decision in the classification report.

## Run Backend

From the project root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

python -m backend.app.models.train_regression
python -m backend.app.models.train_classifier

uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## Run Frontend

In a second terminal:

```bash
npm install
npm run dev
npm run build
```

## API Endpoints

- `GET /health`
- `GET /db/health`
- `GET /models/status`
- `GET /metrics`
- `GET /metrics/regression`
- `GET /metrics/classification`
- `GET /metrics/error-analysis`
- `GET /metrics/feature-importance`
- `GET /dataset/summary`
- `POST /predict/price`
- `POST /predict/classification`

Missing reports return clear 404 JSON. Missing model artifacts return clear 503 JSON.

## Validation

```bash
source .venv/bin/activate
python -m backend.app.models.train_regression
python -m backend.app.models.train_classifier
ls backend/app/artifacts
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
npm run build
```

Optional curl checks:

```bash
curl http://localhost:8000/models/status
curl http://localhost:8000/metrics/regression
curl http://localhost:8000/metrics/classification
curl http://localhost:8000/metrics/feature-importance
```

## Known Limitations

- The current OBT has a modest number of valid rows after filtering missing `surface_m2`.
- The source table does not currently include a native `property_type`, so the classifier derives price-band classes from `price_per_m2`.
- Regression validation metrics are weak on the current scraped data; the dashboard surfaces this as a model reliability warning instead of hiding it.
- Segment-level MAE by city/property type should be read as diagnostics, not market truth.

## Future Improvements

- Expand the OBT with richer property attributes and verified property type labels.
- Add geospatial distance features for business districts, coastlines, and transport hubs.
- Track training runs in a formal experiment store.
- Add model drift checks when new Avito batches arrive.
- Add SHAP or permutation importance for more stable interpretation.
