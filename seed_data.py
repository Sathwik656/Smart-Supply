from dotenv import load_dotenv
load_dotenv()
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
import random

# Use exact models from backend but we can just insert raw dicts to mongodb easily
# To keep strictly to beanie, we'd import it, but pure motor is fine for a raw seed script.

# --- FORCE LOAD ENV FILE ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# --- STRICT ENV (NO FALLBACK) ---
MONGO_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("MONGODB_DB_NAME")

if not MONGO_URL:
    raise ValueError("❌ MONGODB_URL not found in .env")

if not DB_NAME:
    raise ValueError("❌ MONGODB_DB_NAME not found in .env")

print("Using Mongo URL:", MONGO_URL[:40] + "...")  # partial print

async def seed():
    client = AsyncIOMotorClient(MONGO_URL, uuidRepresentation="standard")
    db = client[DB_NAME]
    
    # Create an admin user manually (pass hash of "password")
    # For simplicity, bypassing Beanie and using raw insert
    import bcrypt
    hashed = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode()
    
    await db.users.delete_many({})
    await db.users.insert_one({
        "username": "admin",
        "email": "admin@smartlogis.com",
        "hashed_password": hashed,
        "role": "admin",
        "created_at": datetime.utcnow()
    })
    print("Seeded admin user: admin / password")
    
    # 20 realistic Indian freight shipments
    routes = [
        {"o_name": "Mumbai", "o_lat": 19.0760, "o_lng": 72.8777, "d_name": "Delhi", "d_lat": 28.7041, "d_lng": 77.1025},
        {"o_name": "Chennai", "o_lat": 13.0827, "o_lng": 80.2707, "d_name": "Bangalore", "d_lat": 12.9716, "d_lng": 77.5946},
        {"o_name": "Kolkata", "o_lat": 22.5726, "o_lng": 88.3639, "d_name": "Hyderabad", "d_lat": 17.3850, "d_lng": 78.4867},
        {"o_name": "Pune", "o_lat": 18.5204, "o_lng": 73.8567, "d_name": "Ahmedabad", "d_lat": 23.0225, "d_lng": 72.5714},
        {"o_name": "Delhi", "o_lat": 28.7041, "o_lng": 77.1025, "d_name": "Jaipur", "d_lat": 26.9124, "d_lng": 75.7873},
    ]
    
    cargo_classes = ["pharmaceutical", "perishable", "standard"]
    statuses = ["on_time", "at_risk", "delayed"]
    
    await db.shipments.delete_many({})
    
    shipments = []
    for i in range(1, 21):
        route = random.choice(routes)
        
        # Current pos somewhere in between
        progress = random.uniform(0.1, 0.9)
        c_lat = route["o_lat"] + (route["d_lat"] - route["o_lat"]) * progress
        c_lng = route["o_lng"] + (route["d_lng"] - route["o_lng"]) * progress
        
        shipments.append({
            "shipment_id": f"SHP-IN-{str(i).zfill(4)}",
            "origin": {"name": route["o_name"], "lat": route["o_lat"], "lng": route["o_lng"]},
            "destination": {"name": route["d_name"], "lat": route["d_lat"], "lng": route["d_lng"]},
            "current_position": {"lat": c_lat, "lng": c_lng, "timestamp": datetime.utcnow()},
            "cargo_class": random.choice(cargo_classes),
            "status": "on_time", # default
            "eta_original": datetime.utcnow() + timedelta(days=random.randint(1, 5)),
            "eta_revised": None,
            "assigned_driver_id": f"DRV-{random.randint(100, 999)}",
            "vehicle_id": f"VEH-{random.randint(1000, 9999)}",
            "risk_score": random.uniform(0.1, 0.8),
            "delay_predicted": False,
            "shap_top_factors": [],
            "route_waypoints": [],
            "alternate_routes": [],
            "approved_route_id": None,
            "created_at": datetime.utcnow() - timedelta(hours=random.randint(2, 48)),
            "updated_at": datetime.utcnow()
        })
        
    await db.shipments.insert_many(shipments)
    print("Seeded 20 shipments")
    
if __name__ == "__main__":
    asyncio.run(seed())
