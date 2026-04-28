from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from beanie.odm.operators.find.evaluation import RegEx
from app.models.shipment import Shipment, Location, PositionQuery
from app.services.auth import get_current_user, require_roles, require_admin
from app.api.websocket import broadcast_shipment_update

router = APIRouter(prefix="/shipments", tags=["shipments"])

class ShipmentCreate(BaseModel):
    shipment_id: str
    origin: Location
    destination: Location
    current_position: PositionQuery
    cargo_class: str
    eta_original: datetime
    assigned_driver_id: str
    vehicle_id: str

@router.get("/", response_model=List[Shipment])
async def list_shipments(
    status: Optional[str] = None, 
    cargo_class: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = {}
    if status:
        query["status"] = status
    if cargo_class:
        query["cargo_class"] = cargo_class
        
    shipments = await Shipment.find(query).to_list()
    return shipments

@router.get("/{shipment_id}", response_model=Shipment)
async def get_shipment(shipment_id: str, current_user = Depends(get_current_user)):
    shipment = await Shipment.find_one(Shipment.shipment_id == shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.post("/", response_model=Shipment)
async def create_shipment(req: ShipmentCreate, current_user = Depends(require_roles("admin", "operator"))):
    exists = await Shipment.find_one(Shipment.shipment_id == req.shipment_id)
    if exists:
        raise HTTPException(status_code=400, detail="Shipment already exists")
    
    shipment = Shipment(
        shipment_id=req.shipment_id,
        origin=req.origin,
        destination=req.destination,
        current_position=req.current_position,
        cargo_class=req.cargo_class,
        status="on_time",
        eta_original=req.eta_original,
        assigned_driver_id=req.assigned_driver_id,
        vehicle_id=req.vehicle_id
    )
    await shipment.insert()
    return shipment

@router.patch("/{shipment_id}", response_model=Shipment)
async def update_shipment(shipment_id: str, req: dict, current_user = Depends(require_roles("admin", "operator"))):
    shipment = await Shipment.find_one(Shipment.shipment_id == shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    for k, v in req.items():
        if hasattr(shipment, k):
            setattr(shipment, k, v)
            
    shipment.updated_at = datetime.utcnow()
    await shipment.save()
    
    # Broadcast update
    await broadcast_shipment_update({
        "shipment_id": shipment.shipment_id,
        "status": shipment.status,
        "risk_score": shipment.risk_score,
        "position": shipment.current_position.dict()
    })
    
    return shipment

@router.delete("/{shipment_id}")
async def delete_shipment(shipment_id: str, current_user = Depends(require_admin)):
    shipment = await Shipment.find_one(Shipment.shipment_id == shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    await shipment.delete()
    return {"status": "deleted"}
