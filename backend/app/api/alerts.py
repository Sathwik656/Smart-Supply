from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
from app.models.alert import Alert
from app.services.auth import get_current_user
from app.api.websocket import broadcast_alert_resolved

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[Alert])
async def list_alerts(
    severity: Optional[str] = None, 
    status: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    query = {}
    if severity:
        query["severity"] = severity
    if status:
        query["status"] = status
        
    alerts = await Alert.find(query).sort("-created_at").to_list()
    return alerts

@router.patch("/{alert_id}/approve")
async def approve_alert(alert_id: str, current_user = Depends(get_current_user)):
    from bson import ObjectId
    try:
        alert = await Alert.get(ObjectId(alert_id))
    except:
        alert = await Alert.find_one(Alert.id == alert_id)
        
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = "approved"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = current_user.username
    await alert.save()
    
    await broadcast_alert_resolved({"alert_id": str(alert.id), "status": "approved"})
    return alert

@router.patch("/{alert_id}/dismiss")
async def dismiss_alert(alert_id: str, current_user = Depends(get_current_user)):
    from bson import ObjectId
    try:
        alert = await Alert.get(ObjectId(alert_id))
    except:
        alert = await Alert.find_one(Alert.id == alert_id)
        
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = "dismissed"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = current_user.username
    await alert.save()
    
    await broadcast_alert_resolved({"alert_id": str(alert.id), "status": "dismissed"})
    return alert
