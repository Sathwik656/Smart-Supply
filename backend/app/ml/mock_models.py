from __future__ import annotations

import numpy as np


FEATURE_NAMES = [
    "distance_km",
    "weather_severity",
    "traffic_density",
    "driver_fatigue_proxy",
    "incidents_on_route",
    "warehouse_load_factor",
    "historical_delay_rate_for_route",
    "time_of_day",
    "day_of_week",
    "cargo_class_perishable",
    "cargo_class_pharmaceutical",
]


class MockDelayClassifier:
    def predict(self, X):
        return np.zeros(len(X))

    def predict_proba(self, X):
        probabilities = np.full((len(X), 2), 0.5, dtype=float)
        return probabilities


class MockProphet:
    def make_future_dataframe(self, periods):
        return {"periods": periods}

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
            values = np.zeros((len(X), len(FEATURE_NAMES)), dtype=float)
            feature_names = FEATURE_NAMES

        return ShapValues()
