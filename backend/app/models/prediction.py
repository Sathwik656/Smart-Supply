from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import Field
from beanie import Document

class Prediction(Document):
    shipment_id: str
    predicted_at: datetime = Field(default_factory=datetime.utcnow)
    risk_score: float
    delay_predicted: bool
    model_version: str
    features_used: Dict[str, Any]
    actual_delayed: Optional[bool] = None
    outcome_recorded_at: Optional[datetime] = None

    class Settings:
        name = "predictions"
