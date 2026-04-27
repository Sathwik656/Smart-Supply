import requests
import time
import random

API_URL = "http://localhost:8000/api"

def simulate():
    print("Starting GPS Simulator...")
    # Get active shipments
    try:
        # Using a dummy login if protected, or just modifying the DB via an endpoint directly if available.
        # But for this simulation, we'll patch the vehicles endpoint assuming it's unprotected or we have a token.
        # We'll just randomly hit the update shipment coordinate logic if exposed, but wait...
        # Prompt: "POST to /api/gps/update — useful for live demo without real IoT hardware"
        pass
    except Exception as e:
        print(f"Error fetching: {e}")

    # Fallback to pure logic: We just generate a loop of posts
    # For 20 shipments seeded
    try:
        while True:
            for i in range(1, 21):
                ship_id = f"SHP-IN-{str(i).zfill(4)}"
                
                # In real sim we would fetch their current lat/lng and inch them closer to dest.
                # Here we just send random tiny movements
                payload = {
                    "vehicle_id": f"VEH-SIM-{i}",
                    "lat": 20.59 + random.uniform(-0.01, 0.01),
                    "lng": 78.96 + random.uniform(-0.01, 0.01),
                    "timestamp": time.time()
                }
                
                try:
                    # In our API, we only implemented PATCH /api/shipments/{id} and POST /api/gps/update
                    # Wait, we need to implement /api/gps/update backend endpoint!
                    # I will add it to main backend router right after.
                    requests.post(f"{API_URL}/gps/update", json=payload)
                except:
                    pass
            
            print("Pushed GPS updates. Waiting 5 seconds...")
            time.sleep(5)
    except KeyboardInterrupt:
        print("Simulator stopped.")

if __name__ == "__main__":
    simulate()
