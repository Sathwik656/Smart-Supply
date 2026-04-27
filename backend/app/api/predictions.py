from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from app.models.prediction import Prediction
from app.models.shipment import Shipment
from app.services.auth import get_current_user
from app.ml.predictor import run_prediction

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/", response_model=List[Prediction])
async def list_predictions(current_user = Depends(get_current_user)):
    predictions = await Prediction.find().sort("-predicted_at").limit(100).to_list()
    return predictions

@router.post("/{shipment_id}")
async def run_shipment_prediction(shipment_id: str, current_user = Depends(get_current_user)):
    shipment = await Shipment.find_one(Shipment.shipment_id == shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    # Dummy raw data for feature extraction (in real scenario this comes from IoT and external APIs)
    raw_data = {
        'distance_km': 150.0,
        'cargo_class': shipment.cargo_class,
        'weather_severity': 0.2,
        'traffic_density': 0.4,
        'driver_fatigue_proxy': 5.0,
        'incidents_on_route': 0,
        'warehouse_load_factor': 0.6,
        'historical_delay_rate_for_route': 0.1,
        'timestamp': datetime.utcnow()
    }
    
    risk_score, delay_pred, revised_eta, anomaly, shap_factors = await run_prediction(shipment, raw_data)
    
    pred_doc = Prediction(
        shipment_id=shipment.shipment_id,
        risk_score=risk_score,
        delay_predicted=delay_pred,
        model_version="1.0.0",
        features_used=raw_data
    )
    await pred_doc.insert()
    
    shipment.risk_score = risk_score
    shipment.delay_predicted = delay_pred
    shipment.shap_top_factors = shap_factors
    if revised_eta:
        shipment.eta_revised = revised_eta
    shipment.updated_at = datetime.utcnow()
    await shipment.save()
    
    return {"status": "success", "risk_score": risk_score, "delay_predicted": delay_pred, "anomaly_flag": anomaly}

@router.patch("/{pred_id}/outcome")
async def record_prediction_outcome(pred_id: str, actual_delayed: bool, current_user = Depends(get_current_user)):
    from bson import ObjectId
    try:
        pred = await Prediction.get(ObjectId(pred_id))
    except:
        pred = await Prediction.find_one(Prediction.id == pred_id)
        
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    pred.actual_delayed = actual_delayed
    pred.outcome_recorded_at = datetime.utcnow()
    await pred.save()
    
    return pred
