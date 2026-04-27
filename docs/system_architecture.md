# System Architecture & Workflow

This document provides a step-by-step technical breakdown of how the Smart Supply Chain Optimization System operates, specifically focusing on the Backend (FastAPI), Background Workers (Celery), and the Machine Learning Pipeline.

---

## 1. Top-Level Overview

The application is designed to ingest real-time supply chain data, predict potential transit delays using Machine Learning, and provide actionable insights to operators via a real-time dashboard.

*   **Frontend**: React + Vite application (Dashboard, Maps, Analytics).
*   **Backend**: FastAPI application serving REST endpoints and WebSockets.
*   **Database**: MongoDB (managed via the Beanie ODM) for storing shipments, alerts, and historical data.
*   **Task Queue**: Celery (with Redis as the broker) for executing asynchronous background jobs (data ingestion, predictions, notifications).
*   **Machine Learning**: Scikit-Learn/XGBoost models tracked via MLflow, predicting delivery delays and providing SHAP feature impact analysis.

---

## 2. Backend System Workflow (FastAPI & MongoDB)

The FastAPI backend acts as the central orchestrator.

### A. API Routing & Client Communication
1.  **RESTful Endpoints**: The frontend communicates with standard REST APIs to fetch shipments, acknowledge alerts, and retrieve analytics.
2.  **WebSockets (`socketio`)**: Real-time updates (e.g., a shipment's location moving or a new critical alert being generated) are pushed from the backend to the frontend via WebSockets, ensuring the dashboard is always live without constant polling.

### B. Database Operations (Beanie ODM)
Instead of raw PyMongo dictionaries, the application uses **Beanie**, an asynchronous Object-Document Mapper (ODM). 
*   Models are defined as Python classes (e.g., `Shipment`, `Alert`).
*   When the API or a Celery worker needs to update a shipment's location, it retrieves the Beanie object, modifies the properties, and calls `.save()`.

---

## 3. Background Workers (Celery & Redis)

Because data ingestion and ML predictions are computationally heavy and network-dependent, they run asynchronously in the background.

### A. The Celery Beat (Scheduler)
The Beat process is the timekeeper. It triggers specific tasks based on a defined schedule in `celery_app.py`:
*   Every 5 minutes: Trigger weather polling.
*   Every 10 minutes: Trigger route traffic polling.
*   Every 5 minutes: Trigger bulk delay predictions.
*   Weekly (Sunday 2 AM): Trigger model retraining.

### B. The Celery Worker (Executor)
The Worker process picks up the tasks scheduled by Beat from the **Redis queue** and executes them.

#### Step-by-Step Execution of a Routine Polling Cycle:
1.  **Data Ingestion**: The worker queries external APIs (e.g., OpenWeatherMap, Mapbox/ORS) for active shipments.
2.  **Database Update**: The worker updates the MongoDB `Shipment` records with the latest weather condition and current geographical coordinates.
3.  **Real-Time Broadcast**: The worker triggers a WebSocket event. The FastAPI server broadcasts this update to the React frontend, and the Live Map marker moves instantly.

---

## 4. Machine Learning Pipeline Workflow

The ML system is responsible for calculating risk scores and predicting whether a shipment will be delayed.

### A. Real-Time Inference (Prediction)
When the Celery worker runs the bulk prediction task (every 5 minutes), the following happens:
1.  **Data Preparation**: The worker fetches all "in-transit" shipments from MongoDB. It extracts current features like `distance_remaining`, `weather_severity`, `traffic_density`, and `vehicle_status`.
2.  **Model Loading**: The pre-trained XGBoost model and standard scaler are loaded into memory.
3.  **Prediction**: The model evaluates the features and outputs a **Probability of Delay (Risk Score)** between 0.0 and 1.0.
4.  **SHAP Analysis**: The system calculates SHAP (SHapley Additive exPlanations) values to determine *why* the model made that prediction (e.g., "Heavy Rain contributed +15% to the delay risk").
5.  **Alert Generation**: If the risk score crosses a critical threshold (e.g., > 0.70), the system automatically generates an `Alert` document in MongoDB and broadcasts an `alert:new` event via WebSocket.

### B. Automated Model Retraining
To prevent the model from drifting over time, the system features a self-healing retraining loop:
1.  **Trigger**: Celery Beat triggers the `retrain_models_weekly` task every Sunday at 2:00 AM.
2.  **Dataset Construction**: The worker queries MongoDB for all *completed* shipments (status = `delivered`) from the past week, comparing the initial ETA with the actual delivery time to create ground-truth labels (`is_delayed`).
3.  **Training**: A new XGBoost model is trained on this updated historical dataset.
4.  **Evaluation & MLflow**: The new model's accuracy (F1-score, precision, recall) is evaluated. The metrics and the model artifact itself are logged to the local **MLflow** tracking server.
5.  **Deployment**: If the new model outperforms the current production model, it replaces the existing model file in the `ml-training/models/` directory, and future predictions automatically utilize the smarter model.

---

## 5. Summary Flow of a Single Shipment

1.  **Creation**: A shipment is created via the API. Status is `pending`.
2.  **Transit**: Status becomes `in_transit`. 
3.  **Monitoring**: Every 5 minutes, Celery fetches the truck's GPS, weather, and traffic data.
4.  **Prediction**: The ML model scores the shipment's delay risk.
5.  **Alerting**: If a storm hits and the ML model predicts an 85% chance of delay, an alert is created.
6.  **Action**: The operator sees the red alert on the React dashboard via WebSockets. They open the Shipment Drawer, see the SHAP factors ("Weather +30% risk"), and apply an ML-suggested alternative route.
7.  **Delivery & Learning**: The shipment arrives. Next Sunday, the ML model uses this shipment's final timeline to retrain itself and improve future predictions.
