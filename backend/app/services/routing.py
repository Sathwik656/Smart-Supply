import httpx
import osmnx as ox
import networkx as nx
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.config import settings
from app.models.shipment import Shipment, AlternateRoute, Location
from app.models.cache import RoutesCache
from app.services.weather import get_weather_severity

async def compute_alternate_routes(shipment: Shipment) -> List[AlternateRoute]:
    origin_key = f"{shipment.current_position.lat},{shipment.current_position.lng}"
    dest_key = f"{shipment.destination.lat},{shipment.destination.lng}"
    
    # Check cache
    cache = await RoutesCache.find_one(
        RoutesCache.origin_key == origin_key,
        RoutesCache.destination_key == dest_key,
        RoutesCache.expires_at > datetime.utcnow()
    )
    
    # In a real comprehensive app, we'd build the graph using ox.graph_from_point
    # then calculate shortest paths via nx.shortest_simple_paths with custom weights.
    # We will simulate the ORS call / NetworkX logic because real ORS requires API key
    if cache:
        # Mocking parsing cache back to AlternateRoute
        pass
        
    try:
        if settings.ors_api_key:
            # Fake logic for ORS call
            pass
    except Exception as e:
        print(f"Routing API Error: {e}")
        
    # Mocking Route Computation
    weather_sev = await get_weather_severity(shipment.current_position.lat, shipment.current_position.lng)
    
    routes = [
        AlternateRoute(
            route_id="route_1_fast",
            eta_delta_min=-45,
            score=min(1.0, 0.8 + weather_sev * 0.1),
            waypoints=[Location(lat=shipment.current_position.lat, lng=shipment.current_position.lng), shipment.destination]
        ),
        AlternateRoute(
            route_id="route_2_safe",
            eta_delta_min=10,
            score=min(1.0, 0.95 - weather_sev * 0.2),
            waypoints=[Location(lat=shipment.current_position.lat, lng=shipment.current_position.lng), shipment.destination]
        ),
        AlternateRoute(
            route_id="route_3_eco",
            eta_delta_min=30,
            score=0.85,
            waypoints=[Location(lat=shipment.current_position.lat, lng=shipment.current_position.lng), shipment.destination]
        )
    ]
    
    # Sort best score first
    routes.sort(key=lambda x: x.score, reverse=True)
    
    # Cache result
    rcache = RoutesCache(
        origin_key=origin_key,
        destination_key=dest_key,
        waypoints=[], # simplify
        duration_min=0,
        distance_km=0,
        expires_at=datetime.utcnow() + timedelta(minutes=30)
    )
    await rcache.insert()
    
    return routes
