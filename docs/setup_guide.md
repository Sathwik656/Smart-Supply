# Smart Supply Chain: Full Startup Guide

This guide explains how to start the complete local stack:
- Backend API (`FastAPI`)
- Background workers (`Celery Worker + Beat`)
- ML service (`ml-training` scripts + optional MLflow UI)
- Frontend (`React + Vite`)

## 1. Prerequisites

- Python `3.11+`
- Node.js `18+` and npm
- MongoDB running and reachable from your `MONGODB_URL`
- Redis running and reachable from your `REDIS_URL`

## 2. Environment Configuration

From repo root (`smart-supply-chain`), make sure `.env` exists and has valid values.

Required keys used by runtime:
- `MONGODB_URL`
- `MONGODB_DB_NAME`
- `REDIS_URL`
- `SECRET_KEY`

Optional but used by features/tasks:
- `OPENWEATHER_API_KEY`
- `ORS_API_KEY`
- `TWILIO_*`
- `SENDGRID_API_KEY`
- `MLFLOW_TRACKING_URI`
- `FRONTEND_URL`

Important:
- `REDIS_URL` must be a Redis URI like `redis://...` or `rediss://...`.
- Do not set `REDIS_URL` to a CLI command (example of invalid value: `redis-cli -u redis://...`).

## 3. One-Time Install Steps

### Backend environment

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend environment

```powershell
cd ..\frontend
npm install
```

### ML training environment (optional but recommended)

```powershell
cd ..\ml-training
python -m venv venv_ml
.\venv_ml\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 4. Start the Full System

Use separate terminals for each process.

### Terminal 1: Backend API

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs: `http://localhost:8000/docs`

### Terminal 2: Celery Worker

```powershell
cd backend
.\venv\Scripts\Activate.ps1
celery -A app.tasks.celery_app worker --loglevel=info --pool=solo
```

`--pool=solo` is required on Windows.

### Terminal 3: Celery Beat Scheduler

```powershell
cd backend
.\venv\Scripts\Activate.ps1
celery -A app.tasks.celery_app beat --loglevel=info
```

### Terminal 4: Frontend

```powershell
cd frontend
npm run dev
```

Frontend URL is usually `http://localhost:5173` (Vite default).

If needed, set API base URL for frontend before starting:

```powershell
$env:VITE_API_URL="http://localhost:8000/api"
npm run dev
```

## 5. ML Service: Training and Model Artifacts

The backend loads model files from `ml-training/models`.

### Option A: Generate mock models quickly

```powershell
cd ml-training
python mock_models.py
```

### Option B: Train full models

```powershell
cd ml-training
python generate_synthetic_data.py
python train_delay_classifier.py
python train_eta_forecaster.py
python train_anomaly_detector.py
```

This writes:
- `ml-training/models/delay_classifier.joblib`
- `ml-training/models/eta_forecaster.joblib`
- `ml-training/models/anomaly_detector.joblib`
- `ml-training/models/shap_explainer.joblib`

## 6. Optional: Start MLflow Tracking UI

If you want to inspect training runs:

```powershell
cd ml-training
mlflow ui --backend-store-uri sqlite:///mlflow.db --host 0.0.0.0 --port 5000
```

UI URL: `http://localhost:5000`

If you use local MLflow UI, set:
- `MLFLOW_TRACKING_URI=http://localhost:5000`

## 7. Seed and Simulation Utilities

From repo root:

```powershell
python seed_data.py
python simulate_gps.py
```

Default seeded admin credential:
- Username: `admin`
- Password: `password`

## 8. Quick Health Checklist

- Backend healthy: `GET http://localhost:8000/api/health`
- Frontend loads and can call APIs
- Celery worker logs show task consumption
- Celery beat logs show scheduled task dispatch
- Backend startup logs show model load messages

## 9. Common Issues

- `Failed to load delay_classifier ... MockDelayClassifier`:
  regenerate artifacts with `python ml-training/mock_models.py`.
- Mongo SRV/DNS timeout:
  verify network and `MONGODB_URL`.
- Celery cannot connect:
  verify `REDIS_URL` format and Redis availability.
- Frontend cannot hit backend:
  set `VITE_API_URL=http://localhost:8000/api`.
