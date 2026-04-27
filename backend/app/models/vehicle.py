from datetime import datetime
from pydantic import Field
from beanie import Document, Indexed

class Vehicle(Document):
    vehicle_id: Indexed(str, unique=True)
    driver_name: str
    driver_phone: str
    vehicle_type: str
    capacity_kg: float
    current_lat: float
    current_lng: float
    status: str
    last_ping_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "vehicles"
