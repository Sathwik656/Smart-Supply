# Smart Supply Chain Optimization System: Setup & Execution Guide

This guide provides step-by-step instructions for manually setting up and running all services of the Smart Supply Chain Optimization System on a local machine or server.

---

## 1. Prerequisites

Before starting, ensure you have the following software installed:

### Required Software
*   **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
*   **npm**: v9.0.0 or higher (usually bundled with Node.js)
*   **Python**: v3.11 or higher ([Download](https://www.python.org/))
*   **MongoDB Community Server**: ([Download](https://www.mongodb.com/try/download/community)) - Primary database.
*   **Redis**: ([Download for Windows](https://github.com/tporadowski/redis/releases) | [General](https://redis.io/download)) - Message broker for Celery and WebSocket caching.

---

## 2. Environment Setup

### Steps
1.  Navigate to the project root: `smart-supply-chain/`
2.  Duplicate `.env.example` and rename it to `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Open `.env` and fill in the required variables.

---

## 3. Backend Setup & Execution

### Dependency Installation
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### Starting the Server
1.  Initialize the database and seed data (first time only):
    ```bash
    cd ..
    python seed_data.py
    ```
2.  Start the FastAPI server:
    ```bash
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```

### Running Background Workers (Celery)

Celery handles background tasks like weather polling, route condition monitoring, and ML model retraining. Since the system uses periodic tasks, you need both a **Worker** and a **Beat** process.

#### Prerequisites
- Ensure **Redis** is running and accessible via the `REDIS_URL` defined in your `.env` file.
- Open a new terminal, navigate to the `backend` directory, and ensure your virtual environment is active.

#### 1. Start the Celery Worker (Terminal A)
The worker is responsible for executing the background tasks.
> [!IMPORTANT]
> Because you are on Windows, you **MUST** include the `--pool=solo` flag for Celery to function correctly.

```bash
cd backend
celery -A app.tasks.celery_app worker --loglevel=info --pool=solo
```

#### 2. Start the Celery Beat (Terminal B)
The beat process acts as a scheduler, triggering periodic tasks (e.g., weather updates every 5 minutes).

```bash
cd backend
celery -A app.tasks.celery_app beat --loglevel=info
```

---

## 4. Frontend Setup & Execution

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```

---

## 5. ML Service Setup & Execution

1.  Navigate to the training directory:
    ```bash
    cd ml-training
    ```
2.  Create virtual environment and install requirements:
    ```bash
    python -m venv venv_ml
    venv_ml\Scripts\activate  # Windows
    pip install -r requirements.txt
    ```
3.  **Run Pipeline**: `python generate_synthetic_data.py`, then `python train_delay_classifier.py`.

---

## 6. Integration & Troubleshooting

*   **Communication**: Frontend communicates with Backend on Port 8000.
*   **Common Issues**: Ensure Redis is running before starting Celery. Ensure MongoDB service is started.
