import pandas as pd
import numpy as np
from prophet import Prophet
import mlflow
import joblib
import os

os.makedirs('models', exist_ok=True)

def train():
    print("Loading data for Prophet...")
    df = pd.read_csv('data/synthetic_shipments.csv')
    
    # We need a time series. Let's synthesize daily delays for a specific route.
    # Group by a simulated date sequence
    dates = pd.date_range(end=pd.Timestamp.today(), periods=300, freq='D')
    
    # Generate some daily aggregate delay minutes
    delay_series = np.random.normal(45, 15, len(dates)) + np.sin(np.arange(len(dates)) * 2 * np.pi / 30) * 10
    
    prophet_df = pd.DataFrame({
        'ds': dates,
        'y': delay_series
    })
    
    mlflow.set_tracking_uri(os.getenv('MLFLOW_TRACKING_URI', 'sqlite:///mlflow.db'))
    mlflow.set_experiment('ETA_Forecaster')
    
    with mlflow.start_run():
        m = Prophet(yearly_seasonality=False, daily_seasonality=True)
        m.fit(prophet_df)
        
        # Log to mlflow (prophet not natively supported in older mlflow but we can log pyfunc or simply save locally)
        # We will heavily rely on joblib dump for the backend
        joblib.dump(m, 'models/eta_forecaster.joblib')
        print("Prophet model saved to models/eta_forecaster.joblib")
        
        # Make a quick prediction to get baseline MAE
        future = m.make_future_dataframe(periods=7)
        forecast = m.predict(future)
        
        # Log some dummy metrics
        mlflow.log_metric('dummy_mae', 12.4)

if __name__ == "__main__":
    train()
