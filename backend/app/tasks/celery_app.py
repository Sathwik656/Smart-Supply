from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "smart_supply_chain_tasks",
    broker=settings.redis_url,
    include=[
        "app.tasks.data_ingestion",
        "app.tasks.retraining",
        "app.tasks.notifications"
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True
)

celery_app.conf.beat_schedule = {
    "poll-weather-every-5-mins": {
        "task": "app.tasks.data_ingestion.poll_weather_for_active_shipments",
        "schedule": crontab(minute="*/5"),
    },
    "poll-routes-every-10-mins": {
        "task": "app.tasks.data_ingestion.poll_route_conditions",
        "schedule": crontab(minute="*/10"),
    },
    "run-bulk-predictions-every-5-mins": {
        "task": "app.tasks.data_ingestion.run_bulk_predictions",
        "schedule": crontab(minute="*/5"),
    },
    "retrain-models-weekly": {
        "task": "app.tasks.retraining.retrain_models_weekly",
        "schedule": crontab(hour=2, minute=0, day_of_week=0), # Sunday 2 AM
    }
}
