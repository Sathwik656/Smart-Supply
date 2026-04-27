from celery import shared_task
import asyncio
from app.database import init_db

async def _retrain_models():
    await init_db()
    # Mock retraining
    # Fetches predictions from MongoDB where actual_delayed is not null
    # Retrains XGBoost, compares precision, saves to MLflow
    print("Weekly model retraining triggered successfully.")

@shared_task
def retrain_models_weekly():
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    loop.run_until_complete(_retrain_models())
