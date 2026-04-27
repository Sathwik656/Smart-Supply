from typing import Any, Dict, List
from datetime import datetime
from pydantic import Field
from beanie import Document

class RoutesCache(Document):
    origin_key: str
    destination_key: str
    waypoints: List[Dict[str, float]]
    duration_min: float
    distance_km: float
    cached_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

    class Settings:
        name = "routes_cache"

class WeatherCache(Document):
    lat: float
    lng: float
    weather_data: Dict[str, Any]
    severity_score: float
    cached_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

    class Settings:
        name = "weather_cache"
