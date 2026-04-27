from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from app.models.vehicle import Vehicle
from app.services.auth import get_current_user

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.get("/", response_model=List[Vehicle])
async def list_vehicles(current_user = Depends(get_current_user)):
    vehicles = await Vehicle.find_all().to_list()
    return vehicles

@router.get("/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str, current_user = Depends(get_current_user)):
    vehicle = await Vehicle.find_one(Vehicle.vehicle_id == vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.patch("/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, req: dict, current_user = Depends(get_current_user)):
    vehicle = await Vehicle.find_one(Vehicle.vehicle_id == vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    for k, v in req.items():
        if hasattr(vehicle, k):
            setattr(vehicle, k, v)
            
    vehicle.last_ping_at = datetime.utcnow()
    await vehicle.save()
    return vehicle
