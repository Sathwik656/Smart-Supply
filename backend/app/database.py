import motor.motor_asyncio
from beanie import init_beanie
from .config import settings
from .models import Shipment, Alert, Prediction, Vehicle, User, RoutesCache, WeatherCache

async def init_db():
    # Create motor client
    client = motor.motor_asyncio.AsyncIOMotorClient(
        settings.mongodb_url,
        uuidRepresentation="standard"
    )
    
    # Initialize beanie with the models
    await init_beanie(
        database=client[settings.mongodb_db_name],
        document_models=[
            Shipment,
            Alert,
            Prediction,
            Vehicle,
            User,
            RoutesCache,
            WeatherCache
        ]
    )
