import pandas as pd
import numpy as np
import os

def generate_data(n_samples=10000):
    np.random.seed(42)
    
    cargo_classes = ['standard', 'perishable', 'pharmaceutical']
    weather_severities = np.random.uniform(0.0, 1.0, n_samples)
    distances = np.random.uniform(50, 2000, n_samples)
    traffic_density = np.random.uniform(0.0, 1.0, n_samples)
    driver_fatigue = np.random.uniform(0.0, 14.0, n_samples) # hours driving
    incidents = np.random.poisson(0.5, n_samples)
    warehouse_load = np.random.uniform(0.3, 1.0, n_samples)
    route_historical_delay_rate = np.random.uniform(0.05, 0.4, n_samples)
    
    time_of_day = np.random.randint(0, 24, n_samples)
    day_of_week = np.random.randint(0, 7, n_samples)
    
    cargos = np.random.choice(cargo_classes, n_samples, p=[0.7, 0.2, 0.1])
    
    df = pd.DataFrame({
        'cargo_class': cargos,
        'distance_km': distances,
        'weather_severity': weather_severities,
        'traffic_density': traffic_density,
        'driver_fatigue_proxy': driver_fatigue,
        'incidents_on_route': incidents,
        'warehouse_load_factor': warehouse_load,
        'historical_delay_rate_for_route': route_historical_delay_rate,
        'time_of_day': time_of_day,
        'day_of_week': day_of_week
    })
    
    # Target variables calculation
    # Base risk linearly combined
    base_risk = (
        weather_severities * 1.5 + 
        traffic_density * 1.2 + 
        (driver_fatigue / 14) * 0.8 + 
        incidents * 1.0 + 
        route_historical_delay_rate * 2.0
    )
    
    # Add random noise
    base_risk += np.random.normal(0, 0.5, n_samples)
    
    # Convert risk to binary delayed and continuous delay_minutes
    # Let's say risk > 3.0 means delayed
    threshold = 3.2
    df['delayed'] = (base_risk > threshold).astype(int)
    
    # Delay minutes if delayed: between 15 mins and 300 mins depending on risk
    df['delay_minutes'] = 0.0
    delayed_mask = df['delayed'] == 1
    df.loc[delayed_mask, 'delay_minutes'] = np.clip((base_risk[delayed_mask] - threshold) * 60 + np.random.normal(30, 20, np.sum(delayed_mask)), 15, 300)
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/synthetic_shipments.csv', index=False)
    print(f"Generated {n_samples} records and saved to data/synthetic_shipments.csv")
    print(f"Delay rate: {df['delayed'].mean():.2f}")

if __name__ == "__main__":
    generate_data()
