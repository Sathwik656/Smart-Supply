# Smart Supply Chain Optimization System

An end-to-end resilient logistics and dynamic supply chain optimization application.

## System Architecture

```text
IoT / Simulator =>   FastAPI => MongoDB (Beanie)
(gps updates)        (REST)      => Background Workers (Celery)
                       ^            => Route Optimization (NetworkX)
                       |            => Predictive ML (XGBoost)
WebSockets <=====  FastAPI <====   ML Models (loaded from Joblib/MLflow)
(live alerts)        (WS)

Frontend (React + Vite, Zustand, Tailwind, Leaflet) => User Dashboard
```

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **MongoDB Server** (running locally on port 27017 or remote)
- **Redis Server** (running locally on port 6379 or remote)
- API Keys configured in `.env` (Rename `.env.example` to `.env` and fill them)
  - OpenWeatherMap API Key
  - OpenRouteService API Key (optional, mocked)
  - Twilio and SendGrid credentials (optional, mocked)

## Deployment Instructions

Ensure MongoDB and Redis are running locally before starting the components.

### 1. Configure Environment
```bash
cd smart-supply-chain
cp .env.example .env
# Edit .env and supply your API keys
```

### 2. Backend API Setup
Open a new terminal.
```bash
cd smart-supply-chain/backend
python -m venv venv
# Windows: venv\\Scripts\\activate  | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Docs available at http://localhost:8000/docs*

### 3. Celery Workers Setup
Open two separate terminals, ensure the Python virtual environment is activated in both.
```bash
cd smart-supply-chain/backend

# Terminal A: Start the Celery Worker
celery -A app.tasks.celery_app worker --loglevel=info

# Terminal B: Start the Celery Beat scheduler
celery -A app.tasks.celery_app beat --loglevel=info
```

### 4. Frontend Application Setup
Open a new terminal.
```bash
cd smart-supply-chain/frontend
npm install

# Start the Vite dev server
npm run dev
```
*Frontend available at http://localhost:3000*

### 5. Utilities

#### Seed Database
To populate the database with initial fake data and admins:
```bash
cd smart-supply-chain
python seed_data.py
```
*Credentials: admin / password*

#### Run GPS Simulator
To simulate trucks moving along routes and triggering real-time alerts:
```bash
cd smart-supply-chain
python simulate_gps.py
```

## ML Training Pipeline

The `ml-training` module contains all dataset generation and model training scripts.
To retrain locally:
1. `cd ml-training`
2. `pip install -r requirements.txt`
3. `python generate_synthetic_data.py`
4. `python train_delay_classifier.py`
5. `python train_eta_forecaster.py`
6. `python train_anomaly_detector.py`
*(Note: A fallback `mock_models.py` has been provided which generates schema-compliant mock objects if local package compilation fails).*
