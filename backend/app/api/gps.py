from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.models.shipment import Shipment
from app.api.websocket import broadcast_shipment_update

router = APIRouter(prefix="/gps", tags=["gps"])

class GPSUpdate(BaseModel):
    vehicle_id: str
    lat: float
    lng: float
    timestamp: float

@router.post("/update")
async def receive_gps_update(req: GPSUpdate):
    # Find active shipment for this vehicle
    shipment = await Shipment.find_one(
        Shipment.vehicle_id == req.vehicle_id,
        Shipment.status.nin(["delivered"])
    )
    
    if not shipment:
        return {"status": "ignored", "message": "No active shipment found for this vehicle"}
        
    shipment.current_position.lat = req.lat
    shipment.current_position.lng = req.lng
    shipment.current_position.timestamp = datetime.fromtimestamp(req.timestamp)
    shipment.updated_at = datetime.utcnow()
    await shipment.save()
    
    await broadcast_shipment_update({
        "shipment_id": shipment.shipment_id,
        "status": shipment.status,
        "risk_score": shipment.risk_score,
        "position": shipment.current_position.dict()
    })
    
    return {"status": "success", "shipment_id": shipment.shipment_id}
