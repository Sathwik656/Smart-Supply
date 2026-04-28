import joblib
import os
import asyncio
import pandas as pd
from typing import Tuple, List, Dict, Any

from app.models.shipment import Shipment, SHAPFactor
from app.ml.features import compute_features
from app.ml.mock_models import (
    MockDelayClassifier,
    MockIsolationForest,
    MockProphet,
    MockShapExplainer,
)

_classifiers = {}
_MODEL_FALLBACKS = {
    'delay_classifier': MockDelayClassifier,
    'eta_forecaster': MockProphet,
    'anomaly_detector': MockIsolationForest,
    'shap_explainer': MockShapExplainer,
}


def _load_model(models_dir: str, model_name: str):
    model_path = os.path.join(models_dir, f'{model_name}.joblib')
    try:
        model = joblib.load(model_path)
        print(f"Loaded {model_name} from {model_path}")
        return model
    except Exception as e:
        fallback_factory = _MODEL_FALLBACKS.get(model_name)
        if fallback_factory is None:
            raise
        print(f"Failed to load {model_name}: {e}. Falling back to in-memory mock model.")
        return fallback_factory()

async def load_models():
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml-training/models"))

    for model_name in _MODEL_FALLBACKS:
        _classifiers[model_name] = _load_model(models_dir, model_name)

    print("Models loaded into predictor.")

def _run_prediction_sync(shipment_doc: Shipment, raw_data: dict) -> Tuple[float, bool, Any, bool, List[SHAPFactor]]:
    features = compute_features(raw_data)
    df_features = pd.DataFrame([features])
    
    risk_score = 0.0
    delay_predicted = False
    anomaly_flag = False
    shap_top_factors = []
    
    # XGBoost delay prediction
    model = _classifiers.get('delay_classifier')
    if model:
        try:
            # We enforce exact column order expected by xgboost
            colnames = ['distance_km', 'weather_severity', 'traffic_density', 'driver_fatigue_proxy', 
                        'incidents_on_route', 'warehouse_load_factor', 'historical_delay_rate_for_route', 
                        'time_of_day', 'day_of_week', 'cargo_class_perishable', 'cargo_class_pharmaceutical']
            X = df_features[colnames]
            risk_score = float(model.predict_proba(X)[0][1])
            delay_predicted = bool(risk_score > 0.5)
            
            # SHAP
            explainer = _classifiers.get('shap_explainer')
            if explainer:
                shap_values = explainer(X)
                # Extract top 3 features for instance 0
                vals = shap_values.values[0]
                # Sometimes shape is (features, classes) or just (features,)
                if len(vals.shape) > 1:
                    vals = vals[:, 1]
                
                # Pair with names
                impacts = [(name, float(val)) for name, val in zip(colnames, vals)]
                impacts.sort(key=lambda x: abs(x[1]), reverse=True)
                
                shap_top_factors = [SHAPFactor(feature=f, impact=i) for f, i in impacts[:3]]
                
        except Exception as e:
            print(f"Prediction error: {e}")
            
    # Isolation Forest
    anomaly_model = _classifiers.get('anomaly_detector')
    if anomaly_model:
        try:
            # dummy features for anomaly
            X_anomaly = pd.DataFrame([{'pos_jump_km':0.0, 'stationary_minutes': 0.0}])
            result = anomaly_model.predict(X_anomaly)[0]
            anomaly_flag = result == -1
        except Exception:
            pass

    return risk_score, delay_predicted, None, anomaly_flag, shap_top_factors

async def run_prediction(shipment_doc: Shipment, raw_data: dict):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_prediction_sync, shipment_doc, raw_data)
