from celery import shared_task
import asyncio
from app.database import init_db
from app.models.shipment import Shipment
from app.models.alert import Alert
from app.services.weather import get_weather_severity
from app.api.websocket import broadcast_alert_new
from app.ml.predictor import run_prediction, load_models
import datetime

def async_task_wrapper(coro):
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

async def _poll_weather():
    await init_db()
    active_shipments = await Shipment.find(Shipment.status.nin(["delivered"])).to_list()
    for s in active_shipments:
        if s.current_position:
            # get_weather_severity caches the result internally
            await get_weather_severity(s.current_position.lat, s.current_position.lng)
    print(f"Polled weather for {len(active_shipments)} shipments.")

@shared_task
def poll_weather_for_active_shipments():
    async_task_wrapper(_poll_weather())

async def _poll_routes():
    await init_db()
    # Mocking refresh ETA for active shipments
    active_shipments = await Shipment.find(Shipment.status.nin(["delivered"])).to_list()
    print(f"Polled routes for {len(active_shipments)} shipments.")

@shared_task
def poll_route_conditions():
    async_task_wrapper(_poll_routes())

async def _run_bulk_predictions():
    await init_db()
    await load_models()
    active_shipments = await Shipment.find(Shipment.status.nin(["delivered"])).to_list()
    
    for shipment in active_shipments:
        raw_data = {
            'distance_km': 150.0,
            'cargo_class': shipment.cargo_class,
            'weather_severity': 0.2, # We would get this from cache ideally
            'traffic_density': 0.4,
            'driver_fatigue_proxy': 5.0,
            'incidents_on_route': 0,
            'warehouse_load_factor': 0.6,
            'historical_delay_rate_for_route': 0.1,
            'timestamp': datetime.datetime.utcnow()
        }
        
        risk_score, delay_pred, revised_eta, anomaly, shap_factors = await run_prediction(shipment, raw_data)
        
        # update shipment
        shipment.risk_score = risk_score
        shipment.delay_predicted = delay_pred
        shipment.shap_top_factors = shap_factors
        if revised_eta:
            shipment.eta_revised = revised_eta
        await shipment.save()
        
        # Threshold logic
        thresholds = {
            "pharmaceutical": 0.40,
            "perishable": 0.55,
            "standard": 0.70
        }
        
        t = thresholds.get(shipment.cargo_class, 0.70)
        
        if risk_score >= t:
            # Alert
            exists = await Alert.find_one(Alert.shipment_id == shipment.shipment_id, Alert.status == "pending")
            if not exists:
                msg = f"High delay risk ({risk_score:.2f}) for {shipment.cargo_class} shipment."
                alert = Alert(
                    shipment_id=shipment.shipment_id,
                    alert_type="delay_risk",
                    severity="CRITICAL" if shipment.cargo_class == "pharmaceutical" else "WARNING",
                    message=msg
                )
                await alert.insert()
                # Use a background task to alert via WS (it uses Redis under the hood usually, but we mock calling the WS server)
                try:
                    await broadcast_alert_new({
                        "alert_id": str(alert.id),
                        "shipment_id": alert.shipment_id,
                        "severity": alert.severity,
                        "message": alert.message
                    })
                except Exception:
                    pass
    print(f"Ran bulk predictions for {len(active_shipments)} shipments.")

@shared_task
def run_bulk_predictions():
    async_task_wrapper(_run_bulk_predictions())
