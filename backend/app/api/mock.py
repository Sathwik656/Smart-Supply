from fastapi import APIRouter, Depends
from typing import List, Optional
from datetime import datetime, timedelta
from app.services.auth import get_current_user, require_roles

router = APIRouter(prefix="/mock", tags=["mock"])

# ==================== Mock Alerts ====================

MOCK_ALERTS = [
    {
        "id": "alert-001",
        "shipment_id": "SHP-2026-1001",
        "alert_type": "delay_risk",
        "severity": "high",
        "message": "High probability of delay due to severe weather conditions in transit area",
        "shap_explanation": "Weather factor: 0.45, Traffic factor: 0.25, Historical delay: 0.30",
        "status": "pending",
        "created_at": (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
        "resolved_at": None,
        "resolved_by": None
    },
    {
        "id": "alert-002",
        "shipment_id": "SHP-2026-1002",
        "alert_type": "route_deviation",
        "severity": "medium",
        "message": "Vehicle has deviated 15km from planned route near checkpoint 3",
        "shap_explanation": "GPS anomaly: 0.60, Route deviation: 0.40",
        "status": "pending",
        "created_at": (datetime.utcnow() - timedelta(minutes=32)).isoformat(),
        "resolved_at": None,
        "resolved_by": None
    },
    {
        "id": "alert-003",
        "shipment_id": "SHP-2026-1003",
        "alert_type": "temperature_excursion",
        "severity": "critical",
        "message": "Cold chain temperature exceeded threshold: 8°C (limit: 5°C)",
        "shap_explanation": "Sensor reading: 8°C, Duration: 45min, Ambient: 32°C",
        "status": "pending",
        "created_at": (datetime.utcnow() - timedelta(minutes=8)).isoformat(),
        "resolved_at": None,
        "resolved_by": None
    },
    {
        "id": "alert-004",
        "shipment_id": "SHP-2026-1004",
        "alert_type": "eta_update",
        "severity": "low",
        "message": "Estimated arrival time revised from 14:30 to 16:45 due to traffic congestion",
        "shap_explanation": "Traffic delay: 2h 15min, Route optimization available",
        "status": "approved",
        "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "resolved_at": (datetime.utcnow() - timedelta(hours=1, minutes=45)).isoformat(),
        "resolved_by": "admin"
    },
    {
        "id": "alert-005",
        "shipment_id": "SHP-2026-1005",
        "alert_type": "driver_behavior",
        "severity": "medium",
        "message": "Excessive speeding detected: 95 km/h in 60 km/h zone",
        "shap_explanation": "Speed violation: +35 km/h, Location: Highway 401, Duration: 12min",
        "status": "pending",
        "created_at": (datetime.utcnow() - timedelta(minutes=45)).isoformat(),
        "resolved_at": None,
        "resolved_by": None
    },
    {
        "id": "alert-006",
        "shipment_id": "SHP-2026-1006",
        "alert_type": "maintenance_due",
        "severity": "low",
        "message": "Vehicle maintenance due in 500km or 5 days",
        "shap_explanation": "Service interval: 10000km, Current: 9500km",
        "status": "pending",
        "created_at": (datetime.utcnow() - timedelta(hours=5)).isoformat(),
        "resolved_at": None,
        "resolved_by": None
    },
    {
        "id": "alert-007",
        "shipment_id": "SHP-2026-1007",
        "alert_type": "fuel_low",
        "severity": "medium",
        "message": "Fuel level critical: 12% remaining (estimated range: 80km)",
        "shap_explanation": "Fuel: 45L, Consumption rate: 8.5L/100km",
        "status": "pending",
        "created_at": (datetime.utcnow() - timedelta(minutes=22)).isoformat(),
        "resolved_at": None,
        "resolved_by": None
    },
    {
        "id": "alert-008",
        "shipment_id": "SHP-2026-1008",
        "alert_type": "geofence_breach",
        "severity": "high",
        "message": "Vehicle entered restricted zone outside approved delivery area",
        "shap_explanation": "Geofence: Warehouse District, Entry time: 14:22",
        "status": "dismissed",
        "created_at": (datetime.utcnow() - timedelta(hours=3)).isoformat(),
        "resolved_at": (datetime.utcnow() - timedelta(hours=2, minutes=50)).isoformat(),
        "resolved_by": "operator"
    }
]


@router.get("/alerts", response_model=List[dict])
async def list_mock_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Get mock alerts for live feed"""
    alerts = MOCK_ALERTS.copy()
    
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    if status:
        alerts = [a for a in alerts if a["status"] == status]
    
    # Sort by created_at descending
    alerts.sort(key=lambda x: x["created_at"], reverse=True)
    return alerts


@router.get("/alerts/{alert_id}")
async def get_mock_alert(alert_id: str, current_user = Depends(get_current_user)):
    """Get a single mock alert by ID"""
    for alert in MOCK_ALERTS:
        if alert["id"] == alert_id:
            return alert
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Alert not found")


@router.patch("/alerts/{alert_id}/approve")
async def approve_mock_alert(alert_id: str, current_user = Depends(get_current_user)):
    """Approve a mock alert"""
    for alert in MOCK_ALERTS:
        if alert["id"] == alert_id:
            alert["status"] = "approved"
            alert["resolved_at"] = datetime.utcnow().isoformat()
            alert["resolved_by"] = current_user.username
            return alert
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Alert not found")


@router.patch("/alerts/{alert_id}/dismiss")
async def dismiss_mock_alert(alert_id: str, current_user = Depends(get_current_user)):
    """Dismiss a mock alert"""
    for alert in MOCK_ALERTS:
        if alert["id"] == alert_id:
            alert["status"] = "dismissed"
            alert["resolved_at"] = datetime.utcnow().isoformat()
            alert["resolved_by"] = current_user.username
            return alert
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Alert not found")


# ==================== Mock Vehicles (Fleet Management) ====================

MOCK_VEHICLES = [
    {
        "vehicle_id": "VEH-001",
        "driver_name": "John Martinez",
        "driver_phone": "+1-555-0101",
        "vehicle_type": "Semi-Truck",
        "capacity_kg": 24000,
        "current_lat": 40.7128,
        "current_lng": -74.0060,
        "status": "active",
        "last_ping_at": (datetime.utcnow() - timedelta(minutes=2)).isoformat(),
        "current_shipment": "SHP-2026-1001",
        "destination": "Boston, MA",
        "eta": (datetime.utcnow() + timedelta(hours=4, minutes=30)).isoformat(),
        "fuel_level": 78,
        "speed_kmh": 65,
        "total_distance_km": 345,
        "remaining_distance_km": 120
    },
    {
        "vehicle_id": "VEH-002",
        "driver_name": "Sarah Chen",
        "driver_phone": "+1-555-0102",
        "vehicle_type": "Refrigerated Truck",
        "capacity_kg": 18000,
        "current_lat": 41.8781,
        "current_lng": -87.6298,
        "status": "active",
        "last_ping_at": (datetime.utcnow() - timedelta(minutes=1)).isoformat(),
        "current_shipment": "SHP-2026-1003",
        "destination": "Chicago, IL",
        "eta": (datetime.utcnow() + timedelta(hours=2, minutes=15)).isoformat(),
        "fuel_level": 45,
        "speed_kmh": 72,
        "total_distance_km": 280,
        "remaining_distance_km": 85
    },
    {
        "vehicle_id": "VEH-003",
        "driver_name": "Mike Johnson",
        "driver_phone": "+1-555-0103",
        "vehicle_type": "Box Truck",
        "capacity_kg": 10000,
        "current_lat": 34.0522,
        "current_lng": -118.2437,
        "status": "active",
        "last_ping_at": (datetime.utcnow() - timedelta(minutes=3)).isoformat(),
        "current_shipment": "SHP-2026-1005",
        "destination": "Phoenix, AZ",
        "eta": (datetime.utcnow() + timedelta(hours=6, minutes=45)).isoformat(),
        "fuel_level": 62,
        "speed_kmh": 58,
        "total_distance_km": 420,
        "remaining_distance_km": 180
    },
    {
        "vehicle_id": "VEH-004",
        "driver_name": "Emily Davis",
        "driver_phone": "+1-555-0104",
        "vehicle_type": "Semi-Truck",
        "capacity_kg": 24000,
        "current_lat": 29.7604,
        "current_lng": -95.3698,
        "status": "idle",
        "last_ping_at": (datetime.utcnow() - timedelta(minutes=45)).isoformat(),
        "current_shipment": None,
        "destination": "Houston, TX",
        "eta": None,
        "fuel_level": 95,
        "speed_kmh": 0,
        "total_distance_km": 0,
        "remaining_distance_km": 0
    },
    {
        "vehicle_id": "VEH-005",
        "driver_name": "Robert Wilson",
        "driver_phone": "+1-555-0105",
        "vehicle_type": "Tanker Truck",
        "capacity_kg": 20000,
        "current_lat": 33.7490,
        "current_lng": -84.3880,
        "status": "maintenance",
        "last_ping_at": (datetime.utcnow() - timedelta(hours=24)).isoformat(),
        "current_shipment": None,
        "destination": "Atlanta, GA",
        "eta": None,
        "fuel_level": 30,
        "speed_kmh": 0,
        "total_distance_km": 0,
        "remaining_distance_km": 0
    },
    {
        "vehicle_id": "VEH-006",
        "driver_name": "Lisa Anderson",
        "driver_phone": "+1-555-0106",
        "vehicle_type": "Refrigerated Truck",
        "capacity_kg": 16000,
        "current_lat": 47.6062,
        "current_lng": -122.3321,
        "status": "active",
        "last_ping_at": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
        "current_shipment": "SHP-2026-1007",
        "destination": "Seattle, WA",
        "eta": (datetime.utcnow() + timedelta(hours=8, minutes=20)).isoformat(),
        "fuel_level": 55,
        "speed_kmh": 62,
        "total_distance_km": 180,
        "remaining_distance_km": 145
    },
    {
        "vehicle_id": "VEH-007",
        "driver_name": "David Brown",
        "driver_phone": "+1-555-0107",
        "vehicle_type": "Flatbed Truck",
        "capacity_kg": 22000,
        "current_lat": 39.7392,
        "current_lng": -104.9903,
        "status": "active",
        "last_ping_at": (datetime.utcnow() - timedelta(minutes=1)).isoformat(),
        "current_shipment": "SHP-2026-1002",
        "destination": "Denver, CO",
        "eta": (datetime.utcnow() + timedelta(hours=3, minutes=10)).isoformat(),
        "fuel_level": 82,
        "speed_kmh": 70,
        "total_distance_km": 150,
        "remaining_distance_km": 65
    },
    {
        "vehicle_id": "VEH-008",
        "driver_name": "Jennifer Taylor",
        "driver_phone": "+1-555-0108",
        "vehicle_type": "Box Truck",
        "capacity_kg": 8000,
        "status": "idle",
        "last_ping_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "current_shipment": None,
        "destination": "Miami, FL",
        "eta": None,
        "fuel_level": 88,
        "speed_kmh": 0,
        "total_distance_km": 0,
        "remaining_distance_km": 0,
        "current_lat": 25.7617,
        "current_lng": -80.1918
    }
]


@router.get("/vehicles", response_model=List[dict])
async def list_mock_vehicles(
    status: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """Get mock vehicles for fleet management"""
    vehicles = MOCK_VEHICLES.copy()
    
    if status:
        vehicles = [v for v in vehicles if v["status"] == status]
    
    return vehicles


@router.get("/vehicles/{vehicle_id}")
async def get_mock_vehicle(vehicle_id: str, current_user = Depends(get_current_user)):
    """Get a single mock vehicle by ID"""
    for vehicle in MOCK_VEHICLES:
        if vehicle["vehicle_id"] == vehicle_id:
            return vehicle
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Vehicle not found")


@router.get("/vehicles/{vehicle_id}/location")
async def get_mock_vehicle_location(vehicle_id: str, current_user = Depends(get_current_user)):
    """Get mock vehicle location for map display"""
    for vehicle in MOCK_VEHICLES:
        if vehicle["vehicle_id"] == vehicle_id:
            return {
                "vehicle_id": vehicle["vehicle_id"],
                "driver_name": vehicle["driver_name"],
                "current_lat": vehicle["current_lat"],
                "current_lng": vehicle["current_lng"],
                "speed_kmh": vehicle["speed_kmh"],
                "status": vehicle["status"],
                "last_ping_at": vehicle["last_ping_at"]
            }
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Vehicle not found")


# ==================== Mock Settings ====================

MOCK_SETTINGS = {
    "alert_thresholds": {
        "delay_risk": {
            "enabled": True,
            "high_severity_threshold": 0.75,
            "medium_severity_threshold": 0.50,
            "low_severity_threshold": 0.25
        },
        "temperature": {
            "enabled": True,
            "max_temp_celsius": 5,
            "critical_temp_celsius": 8,
            "alert_duration_minutes": 15
        },
        "speed": {
            "enabled": True,
            "max_speed_kmh": 80,
            "critical_speed_kmh": 100,
            "alert_duration_minutes": 5
        },
        "fuel": {
            "enabled": True,
            "low_fuel_threshold_percent": 20,
            "critical_fuel_threshold_percent": 10
        },
        "geofence": {
            "enabled": True,
            "alert_on_boundary_cross": True,
            "alert_on_unauthorized_zone": True
        }
    },
    "notifications": {
        "email": {
            "enabled": True,
            "recipients": ["ops@smartsupply.com", "alerts@smartsupply.com"],
            "alert_types": ["delay_risk", "temperature_excursion", "geofence_breach"]
        },
        "sms": {
            "enabled": True,
            "recipients": ["+1-555-0100"],
            "alert_types": ["temperature_excursion", "geofence_breach", "fuel_low"]
        },
        "push": {
            "enabled": True,
            "users": ["admin", "operator"],
            "all_alerts": True
        },
        "webhook": {
            "enabled": False,
            "url": "https://api.example.com/webhooks/supply-chain",
            "secret_key": "whsec_xxxxx"
        }
    },
    "system": {
        "data_retention_days": 90,
        "auto_resolve_hours": 24,
        "enable_ml_predictions": True,
        "prediction_refresh_minutes": 15,
        "map_provider": "mapbox",
        "timezone": "America/New_York"
    },
    "api": {
        "rate_limit_per_minute": 100,
        "enable_caching": True,
        "cache_ttl_seconds": 300,
        "enable_metrics": True
    }
}


@router.get("/settings")
async def get_mock_settings(current_user = Depends(get_current_user)):
    """Get mock settings"""
    return MOCK_SETTINGS


@router.get("/settings/{category}")
async def get_mock_settings_category(
    category: str,
    current_user = Depends(get_current_user)
):
    """Get mock settings by category"""
    if category in MOCK_SETTINGS:
        return MOCK_SETTINGS[category]
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")


@router.patch("/settings")
async def update_mock_settings(
    settings: dict,
    current_user = Depends(require_roles("admin"))
):
    """Update mock settings (simulated)"""
    # In a real app, this would save to database
    # For mock, we just return the updated settings
    for key, value in settings.items():
        if key in MOCK_SETTINGS:
            MOCK_SETTINGS[key].update(value)
    return MOCK_SETTINGS


# ==================== Mock Dashboard Stats ====================

@router.get("/dashboard/stats")
async def get_mock_dashboard_stats(current_user = Depends(get_current_user)):
    """Get mock dashboard statistics"""
    return {
        "total_shipments": 1247,
        "active_shipments": 89,
        "delivered_today": 23,
        "delayed_shipments": 7,
        "on_time_rate": 94.2,
        "total_vehicles": 8,
        "active_vehicles": 5,
        "idle_vehicles": 2,
        "maintenance_vehicles": 1,
        "pending_alerts": 6,
        "critical_alerts": 1,
        "resolved_today": 12,
        "avg_delivery_time_hours": 18.5,
        "fuel_efficiency_l_per_100km": 28.3,
        "total_distance_km_today": 4520,
        "alerts_by_severity": {
            "critical": 1,
            "high": 2,
            "medium": 3,
            "low": 2
        },
        "shipments_by_status": {
            "on_time": 72,
            "at_risk": 10,
            "delayed": 7
        }
    }


@router.get("/dashboard/kpis")
async def get_mock_kpis(current_user = Depends(get_current_user)):
    """Get mock KPI data"""
    return {
        "on_time_delivery_rate": 94.2,
        "fleet_utilization": 62.5,
        "avg_transit_time": 18.5,
        "alert_response_time_minutes": 8.3,
        "fuel_cost_per_km": 0.42,
        "maintenance_cost_per_vehicle": 1250,
        "customer_satisfaction": 4.7,
        "incidents_this_month": 3
    }
