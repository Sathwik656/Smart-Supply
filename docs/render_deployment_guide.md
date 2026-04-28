# Render Deployment Guide

This guide walks through deploying the full Smart Supply Chain system on Render after your code is already pushed to GitHub.

## 1. What You Will Deploy

For this repository, the clean Render deployment layout is:

1. `frontend` as a Render Static Site
2. `backend` as a Render Web Service
3. `backend` Celery worker as a Render Background Worker
4. `backend` Celery beat as a second Render Background Worker
5. Render Key Value as the Redis broker
6. MongoDB Atlas as the external database
7. Optional MLflow service if you want a hosted ML tracking UI

Important:
- Your current app does not use MongoDB as a separate Render-managed service. Keep MongoDB on Atlas.
- Your ML inference is currently loaded inside the backend process from `backend/app/ml/predictor.py`, so there is no separate inference API service to deploy.
- Retraining and periodic background tasks run through Celery.

## 2. Before You Start

### Rotate secrets if needed

Before going live, rotate any API keys, MongoDB credentials, Redis credentials, or JWT secrets that may have been shared, copied, or committed in the past.

### Decide your production region

Deploy all Render services in the same region whenever possible:
- Backend
- Celery worker
- Celery beat
- Render Key Value
- Optional MLflow

This reduces latency and keeps internal networking simple.

### Make sure the backend can boot without local-only files

This repo is safe to deploy even if `ml-training/models/*.joblib` files are not in Git:
- the backend now falls back to in-memory mock models when trained model files are missing

If you want real model artifacts in production, generate and version them separately as part of your release process.

## 3. Create a Render Account and Connect GitHub

1. Go to the Render dashboard.
2. Sign in or create an account.
3. Connect your GitHub account.
4. Confirm that Render can access the repository that contains this project.

Official docs:
- https://render.com/docs/your-first-deploy

## 4. Create Render Key Value for Redis

Create the Redis-compatible broker first because both the backend and Celery services need it.

1. In Render, click `New` -> `Key Value`.
2. Choose your Git-connected workspace region.
3. Set a name such as `smart-supply-chain-redis`.
4. Set `Maxmemory Policy` to `noeviction`.
5. Choose a plan that supports persistence.
6. Create the service.
7. After creation, open the service and copy its Internal URL.

You will use that Internal URL as `REDIS_URL`.

Example format:
'red-d7oao18sfn5c73eiu5tg'
```text
redis://red-xxxxxxxxxxxxxxxxxxxx:6379
```

If internal auth is enabled, the URL may include credentials.

Official docs:
- https://render.com/docs/deploy-celery
- https://render.com/docs/background-workers

## 5. Create the Backend Web Service

1. In Render, click `New` -> `Web Service`.
2. Select your GitHub repository.
3. Configure the service like this:

```text
Name: smart-supply-chain-backend
Root Directory: backend
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /api/health
```

4. Add the environment variables below.

Required backend environment variables:

```text
MONGODB_URL=<your MongoDB Atlas connection string>
MONGODB_DB_NAME=supply_chain
REDIS_URL=<Render Key Value internal URL>
SECRET_KEY=<new production secret>
FRONTEND_URL=https://<your-frontend-domain-or-onrender-url>
```

Optional backend environment variables:

```text
OPENWEATHER_API_KEY=<optional>
ORS_API_KEY=<optional>
TWILIO_ACCOUNT_SID=<optional>
TWILIO_AUTH_TOKEN=<optional>
TWILIO_FROM_NUMBER=<optional>
SENDGRID_API_KEY=<optional>
MLFLOW_TRACKING_URI=<optional>
PYTHON_VERSION=3.12.0
```

Notes:
- `FRONTEND_URL` is a good production setting even though current CORS is permissive.
- Render web services must listen on `0.0.0.0`, and using `$PORT` is the safest deployment pattern.
- Render supports WebSockets on web services, so your Socket.IO endpoint can stay on the backend.

Once the deploy succeeds, open:

```text
https://<backend-service>.onrender.com/api/health
```

You should get a healthy JSON response.

Official docs:
- https://render.com/docs/web-services
- https://render.com/docs/deploy-fastapi
- https://render.com/docs/websocket

## 6. Create the Celery Worker

This service runs asynchronous background jobs.

1. In Render, click `New` -> `Background Worker`.
2. Select the same GitHub repository.
3. Configure it like this:

```text
Name: smart-supply-chain-worker
Root Directory: backend
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: celery -A app.tasks.celery_app worker --loglevel=info
```

4. Add the same environment variables used by the backend:

```text
MONGODB_URL
MONGODB_DB_NAME
REDIS_URL
SECRET_KEY
OPENWEATHER_API_KEY
ORS_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER
SENDGRID_API_KEY
MLFLOW_TRACKING_URI
FRONTEND_URL
PYTHON_VERSION
```

Notes:
- Do not use the Windows-only `--pool=solo` flag on Render. Render runs Linux, so the default Celery worker pool is fine.

## 7. Create the Celery Beat Service

This service continuously schedules periodic jobs defined in [celery_app.py](D:\Smart-Supply-Chain\smart-supply-chain\backend\app\tasks\celery_app.py:1).

1. In Render, click `New` -> `Background Worker`.
2. Select the same GitHub repository.
3. Configure it like this:

```text
Name: smart-supply-chain-beat
Root Directory: backend
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: celery -A app.tasks.celery_app beat --loglevel=info
```

4. Reuse the same environment variables as the backend and worker.

This will keep these scheduled jobs alive in production:
- weather polling
- route condition polling
- bulk predictions
- weekly retraining trigger

## 8. Create the Frontend Static Site

1. In Render, click `New` -> `Static Site`.
2. Select the same GitHub repository.
3. Configure it like this:

```text
Name: smart-supply-chain-frontend
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

4. Add the frontend environment variable:

```text
VITE_API_URL=https://<backend-service>.onrender.com/api
```

5. Deploy the site.

6. After deployment, add a rewrite rule for React Router:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

This is required so client-side routes like `/dashboard` and `/vehicles` do not 404 on refresh.

Official docs:
- https://render.com/docs/static-sites
- https://render.com/docs/redirects-rewrites

## 9. MongoDB Atlas Setup

Because this app uses MongoDB, the simplest production setup is MongoDB Atlas.

1. Create or open your Atlas cluster.
2. Create a dedicated database user for Render.
3. Add Render outbound access if you want to lock down IPs.
4. Copy the connection string into `MONGODB_URL`.
5. Make sure the database name matches `MONGODB_DB_NAME`.

Recommended:
- use a dedicated production database
- use a dedicated production user
- do not reuse your local development credentials

## 10. Optional: Deploy MLflow

You only need this if you want a hosted training/experiment tracking UI.

Important:
- the current backend runtime does not require MLflow to serve API requests
- MLflow is only needed if you want experiment tracking for training workflows

### Recommended Render setup for MLflow

Deploy MLflow as a separate Web Service if you want to access the UI in the browser.

Suggested configuration:

```text
Name: smart-supply-chain-mlflow
Root Directory: ml-training
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: mlflow server --host 0.0.0.0 --port $PORT --backend-store-uri sqlite:////var/data/mlflow.db --default-artifact-root /var/data/mlruns
```

Also attach a persistent disk:

```text
Mount Path: /var/data
```

Then set:

```text
MLFLOW_TRACKING_URI=https://<mlflow-service>.onrender.com
```

Notes:
- Render services use an ephemeral filesystem by default, so local MLflow data should not stay on the default filesystem in production.
- If you do not attach a disk, MLflow history can disappear on redeploy or restart.

Official docs:
- https://mlflow.org/docs/latest/self-hosting/architecture/backend-store/
- https://mlflow.org/docs/2.12.1/cli.html
- https://render.com/docs/deploys/

## 11. Deployment Order That Works Best

Use this order:

1. Render Key Value
2. Backend Web Service
3. Celery Worker
4. Celery Beat
5. Frontend Static Site
6. Optional MLflow

Reason:
- the backend and workers need Redis first
- the frontend needs the backend URL before you set `VITE_API_URL`

## 12. Post-Deployment Verification

After everything is live, verify each layer:

### Backend

- Visit `/api/health`
- Open `/docs`
- Check Render logs for successful startup
- Confirm model load messages appear without fatal errors

### Worker

- Check worker logs for broker connection success
- Confirm it consumes tasks without import errors

### Beat

- Check beat logs for scheduled task registration

### Frontend

- Open the deployed site
- Log in
- Confirm API requests succeed
- Confirm refreshes on routed pages do not 404

### WebSocket

- Open the dashboard page
- Confirm Socket.IO connects successfully to the backend URL

## 13. Common Production Gotchas

### `REDIS_URL` is wrong

Use the Render Key Value Internal URL, not a local command like:

```text
redis-cli -u ...
```

### Frontend still points to localhost

If the frontend tries to call `localhost:8000`, update:

```text
VITE_API_URL=https://<backend-service>.onrender.com/api
```

Then trigger a redeploy of the static site.

### React routes return 404

Add the rewrite rule:

```text
/* -> /index.html
```

### Backend cannot reach MongoDB Atlas

Check:
- Atlas network access rules
- username and password
- database name
- whether the connection string is SRV or standard

### MLflow data disappears

That happens if MLflow uses Render's ephemeral filesystem without a persistent disk.

## 14. Recommended Next Improvement

Once your manual deployment is working, the next good step is to add a `render.yaml` Blueprint so the full stack can be recreated from code instead of clicking through the dashboard every time.

Official docs:
- https://render.com/docs/infrastructure-as-code
- https://render.com/docs/blueprint-spec
