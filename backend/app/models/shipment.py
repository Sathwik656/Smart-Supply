from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from beanie import Document, Indexed

class Location(BaseModel):
    name: str = ""
    lat: float
    lng: float

class PositionQuery(BaseModel):
    lat: float
    lng: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SHAPFactor(BaseModel):
    feature: str
    impact: float

class AlternateRoute(BaseModel):
    route_id: str
    eta_delta_min: int
    score: float
    waypoints: List[Location]

class Shipment(Document):
    shipment_id: Indexed(str, unique=True)
    origin: Location
    destination: Location
    current_position: PositionQuery
    cargo_class: str
    status: str
    eta_original: datetime
    eta_revised: Optional[datetime] = None
    assigned_driver_id: str
    vehicle_id: str
    risk_score: float = 0.0
    delay_predicted: bool = False
    shap_top_factors: List[SHAPFactor] = []
    route_waypoints: List[Location] = []
    alternate_routes: List[AlternateRoute] = []
    approved_route_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "shipments"
