import sys
import os

# We need to import feature_engineering from the ml-training directory
# To guarantee identical features
TRAINING_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml-training"))
sys.path.append(TRAINING_DIR)

from feature_engineering import compute_features

__all__ = ["compute_features"]
