<div align="center">

<br/>

```
 █████╗ ██╗   ██╗██╗████████╗ ██████╗
██╔══██╗██║   ██║██║╚══██╔══╝██╔═══██╗
███████║██║   ██║██║   ██║   ██║   ██║
██╔══██║╚██╗ ██╔╝██║   ██║   ██║   ██║
██║  ██║ ╚████╔╝ ██║   ██║   ╚██████╔╝
╚═╝  ╚═╝  ╚═══╝  ╚═╝   ╚═╝    ╚═════╝
 ANALYTICS ENGINE — REAL ESTATE INTELLIGENCE PLATFORM
```

<br/>

**Enterprise-grade data platform transforming Moroccan real-estate market signals**  
**into governed analytical assets, ML intelligence, and decision-ready APIs.**

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Inference_API-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Analytical_Warehouse-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-ML_Pipelines-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![React](https://img.shields.io/badge/React_+_Vite-Analytics_Cockpit-61DAFB?style=for-the-badge&logo=react&logoColor=0B1623)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![Architecture](https://img.shields.io/badge/Architecture-Medallion-8b5cf6?style=flat-square)]()
[![Warehouse](https://img.shields.io/badge/Warehouse-Star_Schema-f59e0b?style=flat-square)]()

</div>

---

<br/>

## The Platform, in One Sentence

> Raw Avito property listings enter one end. Governed warehouse tables, trained regression and classification models, a versioned inference API, and an analytics cockpit come out the other.

This is not a notebook. It is not a tutorial. It is a production-oriented data platform built around the same architectural principles that power analytics organizations at scale — **Medallion ingestion**, **PostgreSQL warehousing**, **sklearn ML pipelines**, **FastAPI model serving**, and a **React BI cockpit** — applied end-to-end to the Moroccan real-estate market.

<br/>

---

<br/>

## Table of Contents

- [Platform Architecture](#-platform-architecture)
- [Why These Architectural Decisions](#-why-these-architectural-decisions)
- [Engineering Capabilities](#-engineering-capabilities)
- [Warehouse Design](#-warehouse-design)
- [ETL and Pipeline Lifecycle](#-etl-and-pipeline-lifecycle)
- [Machine Learning System](#-machine-learning-system)
- [API Surface](#-api-surface)
- [Analytics Cockpit](#-analytics-cockpit)
- [Data Quality Controls](#-data-quality-controls)
- [Performance Engineering](#-performance-engineering)
- [System Modules](#-system-modules)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Docker Blueprint](#-docker-blueprint)
- [Engineering Competencies Demonstrated](#-engineering-competencies-demonstrated)
- [Roadmap](#-roadmap)

<br/>

---

<br/>

## 🧭 Platform Architecture

### End-to-End Data Flow

```mermaid
flowchart LR
    A["🏠 Avito Market\nListing Source"] --> B["⚙️ Extraction\nScraping Layer"]
    B --> C[("🥉 Bronze\nImmutable Archive")]
    C --> D["🔄 Silver ETL\nNormalization · Validation"]
    D --> E[("🗄️ PostgreSQL\nAvito Warehouse")]
    E --> F["🥇 Gold BI Schema\nFacts · Dimensions · KPIs"]
    E --> G["🤖 ML Schema\nOne Big Table Contract"]
    F --> H["📊 Power BI\nMarket Reporting"]
    G --> I["⚗️ ML Pipelines\nRegression · Classification"]
    I --> J[("📦 Model Artifacts\n.pkl + JSON Reports")]
    J --> K["🚀 FastAPI\nInference + Diagnostics"]
    K --> L["🖥️ React Cockpit\nAnalytics Dashboard"]
    E --> M["🔍 Dataset Profiling\nDrift · Quality Monitoring"]
    M --> L

    classDef source fill:#1e1b4b,color:#c7d2fe,stroke:#4338ca,stroke-width:2px
    classDef bronze fill:#1c1917,color:#d6d3d1,stroke:#78716c,stroke-width:1px
    classDef process fill:#052e16,color:#bbf7d0,stroke:#16a34a,stroke-width:1px
    classDef warehouse fill:#1e3a5f,color:#bae6fd,stroke:#0284c7,stroke-width:2px
    classDef serving fill:#1c1917,color:#fde68a,stroke:#d97706,stroke-width:2px
    classDef bi fill:#1a1a2e,color:#c4b5fd,stroke:#7c3aed,stroke-width:2px

    class A source
    class C bronze
    class B,D,I,M process
    class E,G,J warehouse
    class K serving
    class F,H,L bi
```

### Medallion Layering

```mermaid
flowchart TB
    subgraph Bronze["🥉  BRONZE  ·  Raw Immutable Ingestion"]
        direction LR
        B1["Raw Avito payloads"]
        B2["Immutable CSV snapshots"]
        B3["Batch metadata & lineage"]
    end

    subgraph Silver["🥈  SILVER  ·  Curated Operational Data"]
        direction LR
        S1["Type normalization"]
        S2["Duplicate removal"]
        S3["Null & anomaly treatment"]
        S4["Schema validation"]
        S5["Feature standardization"]
    end

    subgraph Gold["🥇  GOLD  ·  Analytics & ML Products"]
        direction LR
        G1["BI star schema"]
        G2["Market KPI aggregates"]
        G3["ML One Big Table"]
        G4["Model training artifacts"]
    end

    Bronze --> Silver --> Gold

    style Bronze fill:#1c1917,stroke:#78716c,color:#d6d3d1
    style Silver fill:#1e293b,stroke:#475569,color:#cbd5e1
    style Gold fill:#1c1f0e,stroke:#65a30d,color:#d9f99d
```

### Serving Architecture

```mermaid
flowchart LR
    PSQL[("PostgreSQL\navito_db")] --> Loader["SQLAlchemy Loader\nSchema validation · Health checks"]
    Loader --> FE["Feature Engineering\nColumnTransformer pipeline"]
    FE --> Train["Training Pipeline\nCV · GridSearch · Model comparison"]
    Train --> Artifacts[("Artifacts\n.pkl models · JSON reports")]
    Artifacts --> API["FastAPI\nPrediction · Diagnostics · Status"]
    API --> React["React/Vite\nAnalytics cockpit"]
    API --> BI["Power BI\nSemantic consumption"]
    API --> Ops["Operational layer\nHealth · Model status · Dataset summary"]
    Ops --> React

    style PSQL fill:#1e3a5f,stroke:#0284c7,color:#bae6fd
    style Artifacts fill:#1e3a5f,stroke:#0284c7,color:#bae6fd
    style API fill:#052e16,stroke:#16a34a,color:#bbf7d0
    style React fill:#1a1a2e,stroke:#7c3aed,color:#c4b5fd
```

<br/>

---

<br/>

## 🏛️ Why These Architectural Decisions

Each design choice in this platform reflects a deliberate trade-off. This section documents the engineering reasoning, not just the implementation.

<details>
<summary><strong>Why Medallion Architecture (Bronze / Silver / Gold)?</strong></summary>

<br/>

Medallion architecture enforces a hard boundary between **data states**, not just data locations. Raw listing payloads are immutable in Bronze — any transformation mistake is recoverable. Silver applies deterministic cleaning, deduplication, and type normalization, producing validated operational entities. Gold serves consumption-optimized shapes: BI-ready star schemas and ML-ready One Big Tables.

Without this separation, a schema change during cleaning silently corrupts historical data. With it, reprocessing is surgical: replay from Bronze into Silver, republish to Gold. That is the foundation of a trustworthy data platform.

</details>

<details>
<summary><strong>Why PostgreSQL as the analytical warehouse?</strong></summary>

<br/>

PostgreSQL occupies a deliberate position in this architecture. It is not being used as a transactional store. It is being used as a **governed analytical warehouse** — one that supports dimensional modeling, schema-separated consumption layers, indexed access patterns for ML feature retrieval, and SQL-native BI tooling (Power BI DirectQuery, dbt targets). The schema separation (`bronze_schema`, `silver_schema`, `bi_schema`, `ml_schema`) mirrors the governance boundaries that cloud data warehouses like BigQuery and Redshift enforce through dataset and schema permissions. The portability advantage is significant for a portfolio platform: no vendor lock-in, reproducible with `createdb`, inspectable with any SQL client.

</details>

<details>
<summary><strong>Why One Big Table for ML?</strong></summary>

<br/>

The `ml_schema.ml_property_features` table is a denormalized **One Big Table** — a single wide row per listing that assembles all features needed for training without requiring joins at pipeline execution time. This pattern is deliberate: training pipelines that JOIN across fact and dimension tables at runtime couple model training to warehouse schema stability. By materializing a supervised-ready OBT, the ML pipeline becomes resilient to upstream warehouse refactoring. Feature lineage is traceable. The feature contract is explicit. Upstream changes require a controlled republication step, not an implicit pipeline fix.

</details>

<details>
<summary><strong>Why FastAPI for model serving?</strong></summary>

<br/>

FastAPI provides **Pydantic-contract enforcement** at the API boundary. Every prediction request is validated before it reaches the model. Every response is typed before it leaves. The framework's async design allows the inference endpoint and operational diagnostics (health, model status, dataset summary) to coexist under the same server with minimal overhead. The OpenAPI documentation is generated automatically, making the API surface self-describing. This is the pattern that production ML serving systems follow: typed contracts, operational endpoints, async routing.

</details>

<details>
<summary><strong>Why sklearn pipelines with ColumnTransformer?</strong></summary>

<br/>

The feature engineering step is encapsulated inside an sklearn `Pipeline` with `ColumnTransformer`, not as a pre-processing script that runs before training. This design ensures that **the same transformation logic that runs during training runs during inference** — no separate preprocessing script to maintain, no silent divergence between training and serving distributions. Supervised market index encodings (city and district price indices) are learned from the training fold and applied to validation. The entire transformation state is serialized inside the `.pkl` artifact and restored at serving time.

</details>

<details>
<summary><strong>Why schema separation at the warehouse level?</strong></summary>

<br/>

Schema separation enforces **access control boundaries** and **consumption contracts** independently of table-level naming. `bi_schema` users should not need visibility into `ml_schema` tables. ML pipelines should not need to JOIN against `silver_schema` staging tables. Each schema is a governance domain. In a production environment, this maps to database roles, row-level security, and audit logging. In a portfolio context, it maps to clear architectural intent: every consumer has a purpose-built data product, not a raw dump.

</details>

<br/>

---

<br/>

## 🏢 Engineering Capabilities

| Domain | Capability | Enterprise Signal |
|---|---|---|
| 🧱 Data Engineering | Bronze/Silver/Gold medallion architecture | Separates ingestion, validated business entities, and consumption-grade datasets with hard layer contracts |
| 🗄️ Warehouse | PostgreSQL analytical warehouse with schema-separated layers | Centralizes governed real-estate data for BI, ML, and application workloads |
| 📐 Analytics Engineering | Star-schema dimensional modeling for BI | Enables KPI reporting, city/district drilldowns, and OLAP-style market analysis |
| 🧪 Data Quality | Schema validation, missing-value profiling, anomaly detection | Prevents malformed feature tables from silently entering the ML lifecycle |
| 🤖 Machine Learning | Reproducible sklearn ColumnTransformer pipelines | Encapsulates feature generation, scaling, encoding, training, validation, and artifact export in a single serializable object |
| 🚀 Model Serving | FastAPI inference API with Pydantic contracts | Typed prediction requests, operational health endpoints, out-of-distribution warnings |
| 📊 BI and Monitoring | React analytics cockpit and Power BI-ready Gold schema | Exposes model performance, feature importance, market trends, and data diagnostics |
| ⚙️ Reproducibility | CLI training modules and GitHub Actions CI | Model refreshes are repeatable commands, not notebook reruns |
| 🧩 Extensibility | Docker Compose containerization blueprint | Aligns local development, CI, and cloud deployment to the same runtime topology |

<br/>

---

<br/>

## 🗄️ Warehouse Design

### Analytical Model

```mermaid
erDiagram
    DIM_LOCATION ||--o{ FACT_PROPERTY_LISTING : "located in"
    DIM_PROPERTY ||--o{ FACT_PROPERTY_LISTING : "described by"
    DIM_DATE ||--o{ FACT_PROPERTY_LISTING : "listed on"
    FACT_PROPERTY_LISTING ||--o{ ML_PROPERTY_FEATURES : "materialized into"

    DIM_LOCATION {
        int    location_key     PK
        string city
        string district
        string city_tier
        bool   is_coastal_city
    }

    DIM_PROPERTY {
        int    property_key   PK
        string property_type
        int    bedrooms
        int    bathrooms
        bool   parking
        bool   furnished
    }

    DIM_DATE {
        int    date_key        PK
        date   listing_date
        int    listing_year
        int    listing_month
        int    listing_quarter
        string listing_season
    }

    FACT_PROPERTY_LISTING {
        string  listing_id      PK
        int     location_key    FK
        int     property_key    FK
        int     date_key        FK
        numeric price
        numeric surface_m2
        numeric price_per_m2
        ts      scraped_at
    }

    ML_PROPERTY_FEATURES {
        string  listing_id     PK
        string  city
        string  district
        string  property_type
        numeric price
        numeric surface_m2
        int     bedrooms
        int     bathrooms
        int     floor
        int     property_age
        numeric price_per_m2
    }
```

### Schema Registry

| Schema | Governance Layer | Primary Assets |
|---|---|---|
| `bronze_schema` | Raw immutable archive — never modified post-ingest | `raw_avito_listings`, scrape batches, ingestion lineage |
| `silver_schema` | Validated operational entities | `clean_property_listings`, normalized attributes, deduplicated records |
| `bi_schema` | BI semantic and analytical serving | `fact_property_listing`, `dim_location`, `dim_property`, `dim_date` |
| `ml_schema` | ML feature serving contract | `ml_property_features` — One Big Table for supervised training |

### ML Feature Contract

```sql
-- Database: avito_db  ·  Schema: ml_schema  ·  Table: ml_property_features

CREATE TABLE IF NOT EXISTS ml_schema.ml_property_features (
    listing_id    TEXT PRIMARY KEY,
    city          TEXT,
    district      TEXT,
    property_type TEXT,
    surface_m2    NUMERIC,
    bedrooms      INTEGER,
    bathrooms     INTEGER,
    floor         INTEGER,
    property_age  INTEGER,
    parking       BOOLEAN,
    furnished     BOOLEAN,
    created_at    TIMESTAMPTZ,
    price         NUMERIC NOT NULL,   -- regression target
    price_per_m2  NUMERIC             -- classification feature & derived target
);
```

**Required columns:** `price`, `surface_m2`
**Recommended columns:** `city`, `district`, `bedrooms`, `bathrooms`, `floor`, `price_per_m2`
**Common enrichments:** `property_type`, `property_age`, `parking`, `furnished`, `created_at`, `listing_id`

> **Architectural note:** The backend enforces this contract at startup. `information_schema` inspection validates table existence. Required columns are asserted before any training job executes. Missing recommended columns degrade model quality with explicit warnings, not silent failures.

<br/>

---

<br/>

## 🔄 ETL and Pipeline Lifecycle

### Production Sequence

```mermaid
sequenceDiagram
    autonumber
    participant SRC  as 🏠 Avito Source
    participant SCRP as ⚙️ Scraping Layer
    participant BRZ  as 🥉 Bronze Archive
    participant SLV  as 🥈 Silver ETL
    participant WH   as 🗄️ PostgreSQL Warehouse
    participant ML   as 🤖 ML Pipeline
    participant API  as 🚀 FastAPI
    participant BI   as 📊 BI / Dashboard

    SRC  ->> SCRP : Paginated listing extraction
    SCRP ->> BRZ  : Persist raw listing snapshots (immutable)
    BRZ  ->> SLV  : Clean · Deduplicate · Normalize · Validate
    SLV  ->> WH   : Load curated tables into warehouse schemas
    WH   ->> ML   : Publish ml_schema.ml_property_features
    ML   ->> ML   : Train · Evaluate · Tune · Export artifacts
    ML   ->> API  : Load model artifacts at startup
    API  ->> BI   : Serve predictions · metrics · diagnostics
```

### Stage Responsibilities

| Stage | Responsibility | Quality Controls |
|---|---|---|
| Extract | Capture listing payloads, pagination, feature signals | Source coverage, request observability, batch identifiers |
| Archive | Persist raw snapshots before any transformation | Immutable archival, replayability, ingestion lineage |
| Transform | Normalize schema, enforce types, standardize categories | Validation gates, null handling, duplicate detection |
| Load | Publish curated tables into PostgreSQL schemas | Idempotent loads, schema separation, warehouse constraints |
| Feature Build | Generate ML-ready numerical and categorical features | Leakage controls, train/test separation, sklearn transformers |
| Train | Compare model families, tune best candidates | Cross-validation, held-out metrics, artifact versioning |
| Serve | Expose predictions and diagnostics over HTTP | Typed contracts, health checks, model readiness gates |
| Monitor | Surface data drift indicators and residual analysis | Error reports, feature importance, dataset summary |

<br/>

---

<br/>

## 🤖 Machine Learning System

The ML subsystem operates as a production modeling workflow. Training starts from PostgreSQL. Feature engineering is encapsulated inside sklearn pipelines. Artifacts are versioned and persisted for serving and dashboard diagnostics.

### ML Lifecycle

```mermaid
flowchart TB
    subgraph Ingest["DATA CONTRACT"]
        D1["ml_schema.ml_property_features\nPostgreSQL → SQLAlchemy loader"]
    end

    subgraph Features["FEATURE ENGINEERING"]
        F1["Numeric branch\nImputation → StandardScaler"]
        F2["Categorical branch\nImputation → OneHotEncoder"]
        F3["Market context\nCity/district index (train-fold learned)"]
        F4["Temporal features\nYear · Month · Quarter · Season"]
        F5["Interaction terms\nsurface × rooms · room_density"]
    end

    subgraph Training["MODEL TRAINING"]
        T1["LinearRegression\nbaseline"]
        T2["RandomForestRegressor\nensemble"]
        T3["GradientBoosting\nboosted trees"]
        T4["HistGradientBoosting\nfast boosting"]
        T5["XGBRegressor\nextreme boosting (optional)"]
        T6["GridSearchCV\nbest candidate tuning"]
    end

    subgraph Evaluation["EVALUATION"]
        E1["K-fold CV · RMSE / MAE / R²"]
        E2["Held-out test metrics"]
        E3["Error analysis by city/type"]
        E4["Feature importance ranking"]
    end

    subgraph Artifacts["ARTIFACTS"]
        A1["price_model.pkl"]
        A2["regression_report.json"]
        A3["error_analysis.json"]
        A4["feature_importance.json"]
        A5["metrics.json"]
    end

    Ingest --> Features --> Training --> Evaluation --> Artifacts

    style Ingest fill:#1e3a5f,stroke:#0284c7,color:#bae6fd
    style Features fill:#052e16,stroke:#16a34a,color:#bbf7d0
    style Training fill:#1c1917,stroke:#78716c,color:#d6d3d1
    style Evaluation fill:#1a1a2e,stroke:#7c3aed,color:#c4b5fd
    style Artifacts fill:#1c1f0e,stroke:#65a30d,color:#d9f99d
```

### Regression: Property Price Prediction

| Dimension | Implementation |
|---|---|
| Target | `price` (continuous, MAD/IQR-bounded outlier removal) |
| Model family | `LinearRegression`, `RandomForestRegressor`, `GradientBoostingRegressor`, `HistGradientBoostingRegressor`, optional `XGBRegressor` |
| Validation | Stratified `train_test_split` + K-fold cross-validation on training fold |
| Tuning | `GridSearchCV` applied to best tree-based candidate |
| Reported metrics | MAE, MSE, RMSE, R², CV RMSE mean/std |
| Artifacts | `price_model.pkl`, `regression_report.json`, `error_analysis.json`, `feature_importance.json` |

### Classification: Property Segment Intelligence

| Dimension | Implementation |
|---|---|
| Target strategy | Native column if present; otherwise derives `low / medium / high` price-per-m² quantile bands |
| Model family | `LogisticRegression`, `RandomForestClassifier`, `GradientBoostingClassifier` |
| Validation | Stratified split + Stratified K-fold cross-validation |
| Imbalance handling | SMOTE when `imbalanced-learn` is installed; class weighting fallback |
| Reported metrics | Accuracy, Precision macro, Recall macro, F1 macro, ROC-AUC macro (where available) |
| Artifacts | `classification_model.pkl`, `classification_report.json`, confusion matrix, per-class diagnostics |

### Feature Engineering Reference

| Feature Family | Generated Features | Engineering Rationale |
|---|---|---|
| Price diagnostics | `log_price`, `price_per_m2` | Normalizes right-skewed price distribution |
| Space efficiency | `rooms_total`, `surface_per_room`, `room_density`, `surface_x_rooms` | Captures size-to-room ratio market signals |
| Market context | `city_market_index`, `district_market_index`, `city_tier` | Supervised encodings learned from training fold only — leakage-safe |
| Location semantics | `city_district`, `is_major_city`, `is_coastal_city` | High-cardinality location signals with interpretable compression |
| Time intelligence | `listing_year`, `listing_month`, `listing_quarter`, `listing_season` | Seasonality and market cycle effects |
| Property attributes | `property_age_bucket`, `parking`, `furnished`, `floor` | Binary and ordinal property signals |

### Leakage-Aware Design

> The pipeline explicitly removes target-correlated and metadata columns before any model receives features. This includes `price`, `log_price`, `price_per_m2`, classification labels, listing IDs, scrape timestamps, and any column whose value would not be known at inference time. Supervised market encodings are computed inside the sklearn transformer on the training fold, then applied to validation and inference records — identical to the logic a production feature store would enforce.

<br/>

---

<br/>

## 🚀 API Surface

```mermaid
flowchart LR
    subgraph Operational["⚙️ OPERATIONAL"]
        O1["GET /health"]
        O2["GET /db/health"]
        O3["GET /models/status"]
    end

    subgraph Training["🤖 TRAINING"]
        T1["POST /train"]
    end

    subgraph Inference["🎯 INFERENCE"]
        P1["POST /predict/price"]
        P2["POST /predict/classification"]
    end

    subgraph Diagnostics["📊 DIAGNOSTICS"]
        D1["GET /metrics"]
        D2["GET /metrics/regression"]
        D3["GET /metrics/classification"]
        D4["GET /metrics/error-analysis"]
        D5["GET /metrics/feature-importance"]
    end

    subgraph Data["🗄️ DATA"]
        DA1["GET /dataset/summary"]
        DA2["GET /properties"]
        DA3["GET /analytics"]
    end

    style Operational fill:#1e3a5f,stroke:#0284c7,color:#bae6fd
    style Inference fill:#052e16,stroke:#16a34a,color:#bbf7d0
    style Diagnostics fill:#1a1a2e,stroke:#7c3aed,color:#c4b5fd
    style Training fill:#1c1917,stroke:#78716c,color:#d6d3d1
    style Data fill:#1c1f0e,stroke:#65a30d,color:#d9f99d
```

| Method | Endpoint | Contract |
|---|---|---|
| `GET` | `/health` | API and loaded model readiness |
| `GET` | `/db/health` | PostgreSQL connectivity and ML table validation |
| `GET` | `/models/status` | Artifact readiness and latest training timestamp |
| `POST` | `/train` | Execute unified model refresh pipeline |
| `POST` | `/predict/price` | Pydantic-validated regression inference |
| `POST` | `/predict/classification` | Pydantic-validated classification inference |
| `GET` | `/metrics` | Consolidated model metrics across both models |
| `GET` | `/metrics/regression` | Full regression evaluation report |
| `GET` | `/metrics/classification` | Full classification evaluation report |
| `GET` | `/metrics/error-analysis` | Residual breakdown by city and property type |
| `GET` | `/metrics/feature-importance` | Top model drivers ranked by importance |
| `GET` | `/dataset/summary` | Warehouse feature table runtime profile |
| `GET` | `/properties` | Sample property records from warehouse |
| `GET` | `/analytics` | Dashboard-ready aggregated analytical series |

<details>
<summary><strong>Example Requests</strong></summary>

```bash
# Operational status
curl http://localhost:8000/health
curl http://localhost:8000/db/health
curl http://localhost:8000/models/status
```

```bash
# Price prediction — Casablanca apartment
curl -X POST http://localhost:8000/predict/price \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Casablanca",
    "district": "Maarif",
    "surface_m2": 92,
    "bedrooms": 2,
    "bathrooms": 2,
    "property_type": "Apartment",
    "floor": 4,
    "property_age": 8,
    "parking": true,
    "furnished": false
  }'
```

```bash
# Segment classification — Rabat apartment
curl -X POST http://localhost:8000/predict/classification \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Rabat",
    "district": "Agdal",
    "surface_m2": 110,
    "bedrooms": 3,
    "bathrooms": 2,
    "property_type": "Apartment",
    "floor": 2,
    "property_age": 5
  }'
```

</details>

<br/>

---

<br/>

## 📊 Analytics Cockpit

The dashboard is a React/Vite analytics interface over the FastAPI backend. It is the BI consumption layer of the platform — not a demo UI, but a purpose-built instrument for model interpretation, market intelligence, and dataset exploration.

| Panel | Business Question Answered |
|---|---|
| **KPI Cards** | What is the current model, dataset, and market signal status? |
| **Price Prediction** | What is the estimated value of a property under current market patterns? |
| **Classification** | Which segment or price band does this listing resemble? |
| **Market Visualizations** | How are prices distributed across listing segments and months? |
| **Pipeline View** | Where does data move from warehouse to model to dashboard? |
| **Model Performance** | Which algorithms were evaluated and which was selected? |
| **Feature Importance** | Which market, property, and temporal signals drive predictions? |
| **Error Analysis** | Where does the model over-predict or under-predict by city/property type? |
| **Dataset Explorer** | What does the warehouse feature contract look like at runtime? |

**Stack:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Framer Motion

> **Power BI positioning:** The Gold schema materializes fact and dimension tables ready for Power BI import or DirectQuery patterns. Market KPIs can be sliced by city, district, property type, listing month, and price-per-m² bands. The ML schema can be joined back into BI reporting for prediction monitoring and model explainability surfaces.

<br/>

---

<br/>

## 🧪 Data Quality Controls

Data quality is treated as a platform-level concern across ingestion, warehouse publishing, ML training, and API serving — not a post-hoc validation step.

| Control | Layer | Implementation |
|---|---|---|
| Table availability | ML pipeline startup | `information_schema` inspection validates `ml_schema.ml_property_features` existence |
| Required columns | Feature engineering | `price` and `surface_m2` are asserted before training begins |
| Recommended column profiling | Loader | `city`, `district`, `bedrooms`, `bathrooms`, `floor`, `price_per_m2` are profiled with missing-value reports |
| Type enforcement | Feature engineering | Numeric coercion and categorical normalization during ColumnTransformer execution |
| Null imputation | sklearn pipeline | Median imputer for numeric branches, mode imputer for categorical branches |
| Duplicate detection | Silver ETL | Listing ID, URL, and normalized property fingerprint deduplication |
| Anomaly filtering | Feature engineering | Surface and price range filters remove physically implausible training rows |
| Leakage prevention | Feature engineering | Target-correlated and metadata columns are explicitly removed before model input |
| OOD warnings | Inference API | Prediction responses flag unseen cities and values outside training distribution bounds |
| Runtime observability | API endpoints | `/db/health`, `/dataset/summary`, `/models/status` expose full platform readiness |

<br/>

---

<br/>

## ⚙️ Performance Engineering

| Area | Approach | Rationale |
|---|---|---|
| Database connectivity | SQLAlchemy engine with `pool_pre_ping` | Detects stale connections before use; prevents silent failures on long-idle pools |
| Warehouse schema design | Star-schema facts/dimensions for BI; OBT for ML | Separates join-heavy OLAP access from flat training access by consumer type |
| Indexing strategy | Indexes on `city`, `district`, `price`, `created_at` | Supports BI filter pushdowns, ML feature retrieval, and time-range partition queries |
| Vectorized processing | Pandas + NumPy feature generation | Avoids row-wise Python loops; transforms operate on array-backed data structures |
| Preprocessing architecture | ColumnTransformer pipeline | Separates numeric and categorical branches; serializes with the model for inference parity |
| Parallelism | `n_jobs=-1` for Random Forest, XGBoost, CV | Uses all available CPU cores for training and cross-validation jobs |
| Artifact serving | Models loaded from disk at startup, held in memory | Zero per-request I/O; prediction latency is dominated by model inference, not disk reads |
| Dashboard data | Pre-aggregated API responses consumed by React | Client never recomputes analytics; all aggregation happens at the API/warehouse layer |

### Recommended Warehouse Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_ml_features_city       ON ml_schema.ml_property_features (city);
CREATE INDEX IF NOT EXISTS idx_ml_features_district   ON ml_schema.ml_property_features (district);
CREATE INDEX IF NOT EXISTS idx_ml_features_price      ON ml_schema.ml_property_features (price);
CREATE INDEX IF NOT EXISTS idx_ml_features_created_at ON ml_schema.ml_property_features (created_at);
```

<br/>

---

<br/>

## 🧬 System Modules

| Module | Responsibility | Production Signal |
|---|---|---|
| `backend/app/core/config.py` | Environment-driven settings via Pydantic `BaseSettings` | No hardcoded credentials; all secrets injected through `.env` |
| `backend/app/core/db.py` | SQLAlchemy engine, PostgreSQL health checks | Pool management, `pool_pre_ping`, connection diagnostics |
| `backend/app/data/loader.py` | Loads and validates `ml_schema.ml_property_features` | Explicit source-table contract, required-column assertion, table health metadata |
| `backend/app/features/feature_engineering.py` | Generates normalized ML features inside ColumnTransformer | Leakage-aware supervised market encodings, train-fold-only fitting |
| `backend/app/models/train_regression.py` | Trains and evaluates price prediction models | Model comparison, cross-validation, GridSearchCV tuning, RMSE/MAE/R² reporting |
| `backend/app/models/train_classifier.py` | Trains property segment classifiers | Native or derived target support, F1 macro optimization, confusion matrix diagnostics |
| `backend/app/models/evaluate.py` | Regression evaluation utilities | Shared metric computation across model comparison and held-out evaluation |
| `backend/app/models/model_loader.py` | Runtime artifact loading and readiness gating | Validates artifact presence and model state before serving |
| `backend/app/pipelines/train_pipeline.py` | Unified model refresh orchestration | Single entry point for coordinated regression + classification refresh |
| `backend/app/services/ml_service.py` | Application service facade | Inference, metrics, artifact access, health checks, OOD warnings |
| `backend/app/schemas/prediction_schema.py` | Pydantic API and response contracts | Input validation, field bounds, serialization |
| `backend/app/main.py` | FastAPI entrypoint | Versioned API, CORS, startup artifact loading, typed response models |
| `src/components/*` | React analytics cockpit modules | KPI cards, prediction panels, pipeline visualization, error analysis |
| `src/services/api.ts` | Frontend API client | Typed API calls matching backend Pydantic response contracts |
| `.github/workflows/ci.yml` | Continuous integration | Frontend build validation and backend compilation checks |

<br/>

---

<br/>

## 📁 Project Structure

```
.
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── core/
│       │   ├── config.py                 # Pydantic Settings — environment-driven config
│       │   └── db.py                     # SQLAlchemy engine, pool management, health checks
│       ├── data/
│       │   └── loader.py                 # ML feature contract loader and validator
│       ├── features/
│       │   └── feature_engineering.py    # ColumnTransformer pipeline, market encodings
│       ├── models/
│       │   ├── evaluate.py               # Shared regression evaluation utilities
│       │   ├── model_loader.py           # Artifact loading and readiness gating
│       │   ├── train_classifier.py       # Classification training lifecycle
│       │   └── train_regression.py       # Regression training lifecycle
│       ├── pipelines/
│       │   └── train_pipeline.py         # Coordinated model refresh orchestration
│       ├── schemas/
│       │   └── prediction_schema.py      # Pydantic request/response contracts
│       ├── services/
│       │   └── ml_service.py             # Application service facade
│       ├── artifacts/                    # Serialized model and report outputs
│       │   ├── price_model.pkl
│       │   ├── classification_model.pkl
│       │   ├── regression_report.json
│       │   ├── classification_report.json
│       │   ├── error_analysis.json
│       │   ├── feature_importance.json
│       │   └── metrics.json
│       └── main.py                       # FastAPI application entrypoint
│
├── src/
│   ├── components/                       # React dashboard modules
│   ├── hooks/                            # Frontend API hooks
│   ├── services/api.ts                   # Typed API client
│   ├── types/ml.ts                       # Frontend ML domain types
│   └── App.tsx                           # Analytics cockpit composition
│
├── .github/
│   └── workflows/ci.yml                  # GitHub Actions CI
│
├── .env.example                          # Environment configuration template
├── package.json
├── vite.config.ts
└── README.md
```

> **Implementation scope:** This repository contains the ML pipeline, FastAPI serving layer, and React analytics cockpit. It expects the upstream data engineering process to publish the curated ML feature table into PostgreSQL at `ml_schema.ml_property_features`.

<br/>

---

<br/>

## 🛠️ Installation

### Prerequisites

| Tool | Version | Role |
|---|---|---|
| Python | 3.11+ | Backend, ETL, ML training |
| Node.js | 20+ | React/Vite dashboard |
| PostgreSQL | 14+ | Analytical warehouse |
| npm | 10+ | Frontend dependency management |
| Docker | 24+ | Optional containerized runtime |

<details>
<summary><strong>Linux / macOS</strong></summary>

```bash
git clone <repository-url>
cd avito-analytics-engine

cp .env.example .env
cp backend/.env.example backend/.env

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

npm install
```

**Train models:**

```bash
source .venv/bin/activate
python -m backend.app.models.train_regression
python -m backend.app.models.train_classifier
```

**Start the API:**

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

**Start the dashboard:**

```bash
npm run dev
```

</details>

<details>
<summary><strong>Windows (PowerShell)</strong></summary>

```powershell
git clone <repository-url>
cd avito-analytics-engine

Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env

py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r backend\requirements.txt

npm install
```

**Train models:**

```powershell
python -m backend.app.models.train_regression
python -m backend.app.models.train_classifier
```

**Start the API:**

```powershell
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

**Start the dashboard:**

```powershell
npm run dev
```

</details>

<details>
<summary><strong>PostgreSQL Warehouse Setup</strong></summary>

```bash
createdb avito_db
```

```sql
-- Create ML schema and feature contract
CREATE SCHEMA IF NOT EXISTS ml_schema;

CREATE TABLE IF NOT EXISTS ml_schema.ml_property_features (
    listing_id    TEXT PRIMARY KEY,
    city          TEXT,
    district      TEXT,
    property_type TEXT,
    surface_m2    NUMERIC,
    bedrooms      INTEGER,
    bathrooms     INTEGER,
    floor         INTEGER,
    property_age  INTEGER,
    parking       BOOLEAN,
    furnished     BOOLEAN,
    created_at    TIMESTAMPTZ,
    price         NUMERIC NOT NULL,
    price_per_m2  NUMERIC
);

-- Validate contract
SELECT COUNT(*) FROM ml_schema.ml_property_features;
```

**Environment variables** (`backend/.env`):

```dotenv
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=avito_db
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgresql+psycopg2://postgres:your_password@127.0.0.1:5432/avito_db

VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

> SQLite is disabled by default. Set `ALLOW_SQLITE_DEMO=true` only for air-gapped demo scenarios where PostgreSQL is unavailable.

</details>

<br/>

---

<br/>

## 🐳 Docker Blueprint

The application is structured for containerized deployment. The recommended Compose topology:

| Container | Image | Responsibility |
|---|---|---|
| `postgres` | `postgres:16` | Warehouse database — Bronze/Silver/Gold/ML schemas |
| `pgadmin` | `dpage/pgadmin4` | Database administration and schema inspection |
| `api` | Custom (Dockerfile.api) | FastAPI backend, training endpoints, model serving |
| `dashboard` | Custom (Dockerfile.dashboard) | React/Vite analytics cockpit |

<details>
<summary><strong>docker-compose.yml</strong></summary>

```yaml
services:
  postgres:
    image: postgres:16
    container_name: avito-postgres
    environment:
      POSTGRES_DB: avito_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: avito-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@avito.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      postgres:
        condition: service_healthy

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: avito-api
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: avito_db
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      CORS_ORIGINS: http://localhost:3000,http://localhost:5173
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy

  dashboard:
    build:
      context: .
      dockerfile: Dockerfile.dashboard
    container_name: avito-dashboard
    environment:
      VITE_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

```bash
docker compose up --build
```

</details>

<br/>

---

<br/>

## ✅ Validation Checklist

```bash
# 1. Activate environment
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1 on Windows

# 2. Train models
python -m backend.app.models.train_regression
python -m backend.app.models.train_classifier

# 3. Start API
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Validate platform health
curl http://localhost:8000/health
curl http://localhost:8000/db/health
curl http://localhost:8000/models/status

# 5. Build frontend
npm run build
```

**Expected artifact output:**

```
backend/app/artifacts/
├── price_model.pkl              ← Serialized regression pipeline
├── classification_model.pkl     ← Serialized classification pipeline
├── regression_report.json       ← Full model comparison and evaluation
├── classification_report.json   ← Per-class metrics and confusion matrix
├── error_analysis.json          ← Residual breakdown by city/property type
├── feature_importance.json      ← Top model drivers ranked by importance
└── metrics.json                 ← Consolidated cross-model metrics
```

<br/>

---

<br/>

## 🏆 Engineering Competencies Demonstrated

This platform was designed to validate competencies across the full data and ML engineering stack. Each section below maps to skills and patterns that senior engineering roles evaluate.

### Data Engineering

- Medallion architecture with hard layer separation and replay semantics
- PostgreSQL as a governed multi-schema analytical warehouse
- Idempotent ETL with source lineage and deduplication controls
- Schema contract enforcement at pipeline startup via `information_schema`

### Analytics Engineering

- Star-schema dimensional modeling (`fact_property_listing`, `dim_location`, `dim_property`, `dim_date`)
- Power BI-ready Gold schema with KPI aggregation surfaces
- Market KPI materialization by city, district, property type, and time band

### Machine Learning Engineering

- Reproducible sklearn `Pipeline` + `ColumnTransformer` architecture
- Leakage-aware supervised market encodings learned per training fold
- Multi-model comparison with cross-validation and held-out evaluation
- GridSearchCV hyperparameter tuning with structured reporting
- Artifact versioning and serialization for serving parity

### Backend Engineering

- FastAPI with Pydantic-enforced request/response contracts
- Operational health endpoints, model readiness gating, OOD warnings
- SQLAlchemy connection pooling with `pool_pre_ping` resilience
- Environment-driven configuration through Pydantic `BaseSettings`

### Frontend Analytics

- React/Vite/TypeScript analytics cockpit consuming API-aggregated data
- Model performance visualization, feature importance, error analysis panels
- Typed API client matching backend Pydantic contracts

### Systems and DevOps Thinking

- Schema-separated consumption contracts enforcing governance boundaries
- Docker Compose topology aligning local dev, CI, and deployment environments
- GitHub Actions CI validating frontend build and backend compilation
- Designed for Airflow orchestration, dbt analytics engineering, and MLflow experiment tracking

<br/>

---

<br/>

## 🧭 Roadmap

| Horizon | Improvement | Strategic Impact |
|---|---|---|
| **Orchestration** | Apache Airflow DAGs for scraping, transformation, warehouse loads, and model refresh | Converts the platform into a fully orchestrated, SLA-governed data product |
| **Analytics Engineering** | dbt models, tests, documentation, and lineage exposures over the Gold schema | Adds modular SQL modeling, contract testing, and BI governance |
| **Streaming** | Kafka ingestion layer for near-real-time listing updates | Enables fresh market monitoring and streaming data products |
| **Distributed Processing** | Spark for large-scale feature generation and historical backfills | Supports higher scraping volumes and multi-city market expansion |
| **MLOps** | MLflow experiment tracking and model registry integration | Improves model governance, reproducibility, and promotion workflows |
| **CI/CD** | Expanded GitHub Actions: tests, linting, Docker builds, deployment gates | Hardens engineering quality gates and delivery confidence |
| **Cloud Deployment** | PostgreSQL, API, and dashboard deployed to AWS/GCP/Azure | Converts local architecture into cloud-grade infrastructure |
| **Observability** | Data drift detection, model drift monitoring, SLA metrics, alerting | Makes model and data behavior operationally visible |
| **Geospatial AI** | Distance-to-center, coastline proximity, transport, schools, POI features | Improves property valuation realism with geospatial market signals |
| **AI Analytics** | Natural-language market intelligence layer over warehouse and BI metrics | Creates executive-friendly insight discovery on top of the analytical layer |

<br/>

---

<br/>

## 🧾 Tech Stack

| Category | Technologies |
|---|---|
| Language and Data | Python 3.11+, Pandas, NumPy |
| Analytical Warehouse | PostgreSQL 14+, SQLAlchemy, pgAdmin |
| Machine Learning | scikit-learn, XGBoost, joblib |
| Model Serving | FastAPI, Pydantic, Uvicorn |
| Analytics Frontend | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Framer Motion |
| BI Layer | Power BI-ready Gold schema, dashboard analytics APIs |
| DevOps | Docker, Docker Compose blueprint, GitHub Actions CI |
| Configuration | `.env`, Pydantic Settings |

<br/>

---

<div align="center">

<br/>

**Built with production engineering principles.**  
**Medallion architecture. Warehouse-centric analytics. API-first ML serving.**

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)

<br/>

</div>
