import joblib
import os
import sys
import numpy as np

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(REPO_ROOT, "backend")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.ml.mock_models import (  # noqa: E402
    MockDelayClassifier,
    MockIsolationForest,
    MockProphet,
    MockShapExplainer,
)


def main():
    os.makedirs(MODELS_DIR, exist_ok=True)

    # Ensure NumPy is imported when the mock module is loaded during serialization.
    _ = np.__version__

    joblib.dump(MockDelayClassifier(), os.path.join(MODELS_DIR, 'delay_classifier.joblib'))
    joblib.dump(MockProphet(), os.path.join(MODELS_DIR, 'eta_forecaster.joblib'))
    joblib.dump(MockIsolationForest(), os.path.join(MODELS_DIR, 'anomaly_detector.joblib'))
    joblib.dump(MockShapExplainer(), os.path.join(MODELS_DIR, 'shap_explainer.joblib'))

    print("Mock models generated successfully with importable backend classes.")


if __name__ == "__main__":
    main()
