import joblib
import os
import numpy as np

os.makedirs('models', exist_ok=True)

class MockDelayClassifier:
    def predict(self, X):
        return np.zeros(len(X))
    def predict_proba(self, X):
        return np.ones((len(X), 2)) * 0.5

class MockProphet:
    def make_future_dataframe(self, periods):
        class DfMock:
            pass
        return DfMock()
    def predict(self, df):
        class ResultMock:
            yhat = np.array([45.0])
        return ResultMock()

class MockIsolationForest:
    def predict(self, X):
        return np.ones(len(X))

class MockShapExplainer:
    def __call__(self, X):
        class ShapValues:
            values = np.random.rand(len(X), 10)
            feature_names = ['distance_km', 'weather_severity', 'traffic_density', 'driver_fatigue_proxy', 'incidents_on_route', 'warehouse_load_factor', 'historical_delay_rate_for_route', 'time_of_day', 'day_of_week', 'cargo_class_perishable']
        return ShapValues()

# Save mocks
joblib.dump(MockDelayClassifier(), 'models/delay_classifier.joblib')
joblib.dump(MockProphet(), 'models/eta_forecaster.joblib')
joblib.dump(MockIsolationForest(), 'models/anomaly_detector.joblib')
joblib.dump(MockShapExplainer(), 'models/shap_explainer.joblib')

print("Mock models generated successfully. The backend will use these for demo purposes to avoid complex dependency compilation.")
