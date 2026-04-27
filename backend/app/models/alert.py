from typing import Optional
from datetime import datetime
from pydantic import Field
from beanie import Document

class Alert(Document):
    shipment_id: str
    alert_type: str
    severity: str
    message: str
    shap_explanation: str = ""
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None

    class Settings:
        name = "alerts"
