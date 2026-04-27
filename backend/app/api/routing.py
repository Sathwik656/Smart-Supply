from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from app.models.shipment import Shipment, AlternateRoute
from app.services.auth import get_current_user
from app.services.routing import compute_alternate_routes

router = APIRouter(prefix="/routes", tags=["routing"])

class ComputeRouteRequest(BaseModel):
    shipment_id: str

@router.post("/compute", response_model=List[AlternateRoute])
async def compute_routes(req: ComputeRouteRequest, current_user = Depends(get_current_user)):
    shipment = await Shipment.find_one(Shipment.shipment_id == req.shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    routes = await compute_alternate_routes(shipment)
    
    # Attach recommended routes to shipment document
    shipment.alternate_routes = routes
    await shipment.save()
    
    return routes

@router.get("/{shipment_id}", response_model=List[AlternateRoute])
async def get_cached_routes(shipment_id: str, current_user = Depends(get_current_user)):
    shipment = await Shipment.find_one(Shipment.shipment_id == shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    return shipment.alternate_routes
