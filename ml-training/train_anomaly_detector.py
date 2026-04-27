import pandas as pd
from sklearn.ensemble import IsolationForest
import mlflow
import joblib
import os

os.makedirs('models', exist_ok=True)

def train():
    print("Loading data for Isolation Forest...")
    # For anomaly detection, we train on "normal" conditions
    # We will use distance, speed proxy, etc.
    df = pd.DataFrame({
        'pos_jump_km': [0.1, 0.5, 0.2, 0.1, 0.0, 50.0, 0.3, 0.2, 100.0, 0.1] * 100, # 50.0 and 100.0 are anomalies
        'stationary_minutes': [5, 10, 0, 0, 15, 200, 5, 2, 0, 0] * 100,  # 200 is anomaly
    })
    
    X = df[['pos_jump_km', 'stationary_minutes']]
    
    mlflow.set_tracking_uri(os.getenv('MLFLOW_TRACKING_URI', 'sqlite:///mlflow.db'))
    mlflow.set_experiment('Anomaly_Detector')
    
    with mlflow.start_run():
        model = IsolationForest(contamination=0.05, random_state=42)
        model.fit(X)
        
        joblib.dump(model, 'models/anomaly_detector.joblib')
        print("Isolation Forest saved to models/anomaly_detector.joblib")
        
        mlflow.log_metric('contamination', 0.05)
        mlflow.sklearn.log_model(model, "isolation_forest")

if __name__ == "__main__":
    train()
