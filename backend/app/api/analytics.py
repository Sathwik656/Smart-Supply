from fastapi import APIRouter, Depends
from datetime import datetime
from app.models.shipment import Shipment
from app.models.alert import Alert
from app.services.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
async def get_summary(current_user = Depends(get_current_user)):
    total_shipments = await Shipment.find_all().count()
    active_shipments = await Shipment.find(Shipment.status != "delivered").count()
    delayed_shipments = await Shipment.find({"status": {"$in": ["at_risk", "delayed"]}}).count()
    
    on_time_rate = 100.0
    if active_shipments > 0:
        on_time_rate = ((active_shipments - delayed_shipments) / active_shipments) * 100.0
        
    open_alerts = await Alert.find(Alert.status == "pending").count()
    
    return {
        "on_time_rate": round(on_time_rate, 1),
        "active_shipments": active_shipments,
        "open_alerts": open_alerts,
        "avg_delay_minutes": 45  # mockup logic
    }

@router.get("/delays")
async def get_delays(current_user = Depends(get_current_user)):
    # Returns some dummy structural data for charts
    return [
        {"route": "Mumbai - Delhi", "delay_rate": 0.15},
        {"route": "Chennai - Bangalore", "delay_rate": 0.08},
        {"route": "Kolkata - Hyderabad", "delay_rate": 0.22}
    ]

@router.get("/model-perf")
async def get_model_perf(current_user = Depends(get_current_user)):
    # In real app we fetch this from MLflow REST API. Mocking it here.
    return {
        "accuracy": 0.92,
        "precision": 0.88,
        "recall": 0.85,
        "f1": 0.86,
        "auc": 0.94
    }
