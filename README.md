# ArchiMind AI - Property Intelligence Platform

Professional real estate analytics and machine learning dashboard for the Moroccan market.

## Project Structure

- `src/`: React + TypeScript frontend powered by Vite.
- `backend/app/core/config.py`: Centralized backend settings and validation.
- `backend/app/`: FastAPI backend for ML inference.
- `backend/models/`: Local storage for trained `.pkl` models.

## Environment Setup

All configurable values live in environment variables. The root `.env` is used by both the frontend and backend during local development.

```bash
cp .env.example .env
```

Update `.env` with values for your machine. Never commit `.env` or real secrets.

### Required Variables

```dotenv
ENVIRONMENT=development
APP_NAME=ArchiMind AI ML Platform
APP_VERSION=2.4.0-ml-skeleton
APP_URL=http://localhost:5173
DEBUG=true
LOG_LEVEL=info

VITE_APP_NAME=ArchiMind AI
VITE_API_URL=http://localhost:8000
VITE_USER_AVATAR_URL=https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah
VITE_ENABLE_MOCKS=true

DB_HOST=localhost
DB_PORT=5432
DB_NAME=real_estate_ml
DB_USER=postgres
DB_PASSWORD=change_me

SECRET_KEY=change_this_secret
JWT_SECRET=change_this_jwt_secret
GEMINI_API_KEY=

CORS_ORIGINS=http://localhost:5173,http://localhost:3000
PRICE_MODEL_PATH=backend/models/price_model.pkl
CLASSIFICATION_MODEL_PATH=backend/models/classification_model.pkl
UPLOAD_DIR=backend/app/uploads
```

For production, set `ENVIRONMENT=production`, `DEBUG=false`, use strong unique secrets, and replace localhost values with deployed URLs. Production startup fails if insecure placeholder secrets or wildcard CORS are used.

## Backend Startup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

If you prefer running from inside `backend/`, use:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend loads settings through `pydantic-settings`. Missing required variables produce clear startup validation errors instead of silent fallback values.

## Frontend Startup

```bash
npm install
npm run dev
```

Vite only exposes variables prefixed with `VITE_` to browser code. The frontend validates required values at startup and fails clearly if `VITE_API_URL`, `VITE_APP_NAME`, `VITE_USER_AVATAR_URL`, or `VITE_ENABLE_MOCKS` are missing.

## Security Notes

- `.env` and all local env variants are ignored by `.gitignore`.
- `.env.example` contains placeholders only and is safe for GitHub.
- Backend credentials, CORS origins, model paths, upload paths, application URLs, and secrets are no longer hardcoded in source code.
- Frontend mock API fallbacks are disabled unless `VITE_ENABLE_MOCKS=true`.
- Do not expose private secrets through `VITE_` variables. Anything prefixed with `VITE_` is bundled into client-side code.

## ML Pipeline Integration

1. Add categorical encoding for city and district in `backend/app/ml_service.py`.
2. Scale `surface_m2` using the same preprocessing pipeline used during training.
3. Train the selected model on the curated Moroccan dataset.
4. Save models to the paths configured by `PRICE_MODEL_PATH` and `CLASSIFICATION_MODEL_PATH`.
5. The backend `ModelLoader` detects configured `.pkl` files and uses them when present.
