import pandas as pd
import numpy as np

def compute_features(raw_data: dict) -> dict:
    """
    Computes model features from raw data dict.
    This ensures identical features between training and inference.
    """
    # Raw data expectations:
    # distance_km
    # cargo_class
    # weather_severity
    # traffic_density
    # driver_fatigue_proxy
    # incidents_on_route
    # warehouse_load_factor
    # historical_delay_rate_for_route
    # timestamp (datetime)
    
    dt = raw_data.get('timestamp', pd.Timestamp.now())
    time_of_day = dt.hour
    day_of_week = dt.dayofweek
    
    cargo_class_encoded_perishable = 1 if raw_data.get('cargo_class') == 'perishable' else 0
    cargo_class_encoded_pharma = 1 if raw_data.get('cargo_class') == 'pharmaceutical' else 0
    
    features = {
        'distance_km': float(raw_data.get('distance_km', 0.0)),
        'weather_severity': float(raw_data.get('weather_severity', 0.0)),
        'traffic_density': float(raw_data.get('traffic_density', 0.0)),
        'driver_fatigue_proxy': float(raw_data.get('driver_fatigue_proxy', 0.0)),
        'incidents_on_route': float(raw_data.get('incidents_on_route', 0.0)),
        'warehouse_load_factor': float(raw_data.get('warehouse_load_factor', 0.0)),
        'historical_delay_rate_for_route': float(raw_data.get('historical_delay_rate_for_route', 0.0)),
        'time_of_day': float(time_of_day),
        'day_of_week': float(day_of_week),
        'cargo_class_perishable': float(cargo_class_encoded_perishable),
        'cargo_class_pharmaceutical': float(cargo_class_encoded_pharma)
    }
    
    return features

def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess entire training dataframe
    """
    # Create dummies
    df = pd.get_dummies(df, columns=['cargo_class'], drop_first=False)
    
    # Ensure expected columns
    expected_cols = ['cargo_class_perishable', 'cargo_class_pharmaceutical']
    for col in expected_cols:
        if col not in df.columns:
            df[col] = 0
            
    # Standardize names
    df = df.rename(columns={
        'cargo_class_perishable': 'cargo_class_perishable',
        'cargo_class_pharmaceutical': 'cargo_class_pharmaceutical'
    })
    
    # Drop irrelevant if created standard
    if 'cargo_class_standard' in df.columns:
        df = df.drop(columns=['cargo_class_standard'])
        
    return df
