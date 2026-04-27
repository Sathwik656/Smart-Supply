import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import mlflow
import mlflow.xgboost
import shap
import optuna
import joblib
import os
from feature_engineering import preprocess_dataframe

# Make sure models dir exists
os.makedirs('models', exist_ok=True)

def train():
    print("Loading data...")
    df = pd.read_csv('data/synthetic_shipments.csv')
    df = preprocess_dataframe(df)
    
    features = [
        'distance_km', 'weather_severity', 'traffic_density', 
        'driver_fatigue_proxy', 'incidents_on_route', 'warehouse_load_factor', 
        'historical_delay_rate_for_route', 'time_of_day', 'day_of_week',
        'cargo_class_perishable', 'cargo_class_pharmaceutical'
    ]
    
    X = df[features]
    y = df['delayed']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Simple Optuna tuning
    def objective(trial):
        params = {
            'max_depth': trial.suggest_int('max_depth', 3, 9),
            'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
            'n_estimators': trial.suggest_int('n_estimators', 50, 300),
            'subsample': trial.suggest_float('subsample', 0.6, 1.0),
            'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0)
        }
        model = xgb.XGBClassifier(**params, random_state=42, eval_metric='logloss')
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        return accuracy_score(y_test, preds)

    print("Starting Optuna studies...")
    study = optuna.create_study(direction='maximize')
    study.optimize(objective, n_trials=10)
    
    best_params = study.best_params
    print(f"Best params: {best_params}")
    
    mlflow.set_tracking_uri(os.getenv('MLFLOW_TRACKING_URI', 'sqlite:///mlflow.db'))
    mlflow.set_experiment('Delay_Classifier')
    
    with mlflow.start_run():
        model = xgb.XGBClassifier(**best_params, random_state=42, eval_metric='logloss')
        model.fit(X_train, y_train)
        
        preds = model.predict(X_test)
        probs = model.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, probs)
        
        print(f"Metrics: Acc: {acc:.4f}, Prec: {prec:.4f}, Rec: {rec:.4f}, F1: {f1:.4f}, AUC: {auc:.4f}")
        
        # Log to MLflow
        mlflow.log_params(best_params)
        mlflow.log_metrics({
            'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1, 'auc': auc
        })
        mlflow.xgboost.log_model(model, "xgboost_model")
        
        # We also save the model using joblib for simple loading in the FastAPI app
        # without needing MLflow connected in dev mode
        joblib.dump(model, 'models/delay_classifier.joblib')
        
        # SHAP explainer
        explainer = shap.TreeExplainer(model)
        joblib.dump(explainer, 'models/shap_explainer.joblib')
        
        print("Model and explainer saved to models/")

if __name__ == "__main__":
    train()
