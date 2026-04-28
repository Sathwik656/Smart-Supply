from dotenv import load_dotenv
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
env_path = os.path.join(BASE_DIR, ".env")

load_dotenv(env_path)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import socketio

from app.config import settings
from app.database import init_db
from app.api import router as api_router
from app.api.websocket import sio_app

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    # ML Models load lazily in predictor.py or we can init them here,
    # but the prompt requires them to load at startup. We'll init the predictor module.
    import app.ml.predictor as predictor
    await predictor.load_models()
    yield
    # Shutdown
    pass

app = FastAPI(title="Smart Supply Chain API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

# Mount Socket.IO
app.mount("/ws/socket.io", sio_app)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "Smart Supply Chain API",
        "health": "/api/health",
        "docs": "/docs",
    }

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Smart Supply Chain API is running."}
