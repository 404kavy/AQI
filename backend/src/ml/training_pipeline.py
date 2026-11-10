"""
AirGuard AI — Machine Learning Forecasting & Evaluation Pipeline
Trains Random Forest Regressors and Gradient Boosting Regressors for multi-horizon
pollutant prediction (6h, 12h, 24h) using chronological splitting and SHAP explainability.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import List, Dict, Any, Tuple
import shap

from src.ml.feature_engineering import (
    POLLUTANTS,
    METEO_FEATURES,
    add_temporal_features,
    create_lags_and_rolling,
    build_direct_horizon_targets
)

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))

def prepare_feature_matrix(df: pd.DataFrame, target_pollutant: str, horizon: int) -> Tuple[pd.DataFrame, pd.Series, pd.Series, pd.Series, List[str]]:
    """Prepares feature matrix X and target y for a specific pollutant and horizon."""
    target_col = f"{target_pollutant}_target_h{horizon}"
    
    # Feature columns for predicting target_pollutant
    feature_cols = [
        # Current meteorology
        "temperature", "humidity", "wind_speed", "wind_direction", "rainfall", "stagnation_index",
        # Temporal cyclic
        "sin_hour", "cos_hour", "sin_month", "cos_month", "is_weekend",
        # Current pollutant states
        "pm25", "pm10", "no2", "so2", "co", "o3",
        # Specific pollutant lags & rolling stats
        f"{target_pollutant}_lag1", f"{target_pollutant}_lag2", 
        f"{target_pollutant}_lag6", f"{target_pollutant}_lag24",
        f"{target_pollutant}_roll_mean_6h", f"{target_pollutant}_roll_mean_24h", 
        f"{target_pollutant}_roll_std_12h",
        # Key cross-pollutant & meteo lags
        "wind_speed_lag1", "wind_speed_lag6", "temperature_lag1"
    ]
    
    # Drop rows with NaN from shifting
    valid_data = df.dropna(subset=feature_cols + [target_col]).copy()
    
    X = valid_data[feature_cols]
    y = valid_data[target_col]
    timestamps = valid_data['timestamp']
    stations = valid_data['station_id']
    
    return X, y, timestamps, stations, feature_cols

def train_and_evaluate(data_path: str, quick_mode: bool = False):
    """
    Executes end-to-end model training, evaluation, and SHAP explanation generation.
    Chronological train/test split (80% train, 20% test).
    """
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"Loading dataset from {data_path}...")
    raw_df = pd.read_csv(data_path)
    
    print("Executing feature engineering pipeline...")
    df = add_temporal_features(raw_df)
    df = create_lags_and_rolling(df)
    df = build_direct_horizon_targets(df, horizons=[6, 12, 24])
    
    metadata = {
        "training_timestamp": datetime.now().isoformat(),
        "total_records": len(df),
        "horizons": [6, 12, 24],
        "pollutants": POLLUTANTS,
        "evaluation_metrics": {},
        "model_comparison": {},
        "feature_importances": {},
        "shap_summary": {}
    }
    
    n_estimators = 30
    
    # Focus detailed training on criteria pollutants
    primary_pollutants = ["pm25", "pm10", "no2"]
    secondary_pollutants = ["so2", "co", "o3"]
    all_target_pollutants = primary_pollutants + secondary_pollutants
    
    for pol in all_target_pollutants:
        metadata["evaluation_metrics"][pol] = {}
        for h in [6, 12, 24]:
            print(f"\n--- Training Models for {pol.upper()} Horizon {h}h ---")
            X, y, timestamps, stations, feature_names = prepare_feature_matrix(df, pol, h)
            
            # Chronological 80/20 train/test split
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
            y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
            
            # 1. Random Forest Regressor (Primary Baseline Model)
            rf_model = RandomForestRegressor(
                n_estimators=n_estimators,
                max_depth=16,
                min_samples_split=4,
                n_jobs=-1,
                random_state=42
            )
            rf_model.fit(X_train, y_train)
            
            # Predictions
            y_pred_rf = rf_model.predict(X_test)
            mae_rf = float(mean_absolute_error(y_test, y_pred_rf))
            rmse_rf = float(np.sqrt(mean_squared_error(y_test, y_pred_rf)))
            r2_rf = float(r2_score(y_test, y_pred_rf))
            
            # Save RF model
            rf_model_filename = f"rf_{pol}_h{h}.joblib"
            joblib.dump(rf_model, os.path.join(MODELS_DIR, rf_model_filename))
            
            metadata["evaluation_metrics"][pol][f"h{h}"] = {
                "mae": round(mae_rf, 2),
                "rmse": round(rmse_rf, 2),
                "r2": round(r2_rf, 3),
                "model_type": "RandomForestRegressor",
                "features_count": len(feature_names),
                "train_samples": len(X_train),
                "test_samples": len(X_test)
            }
            
            print(f"  RF h{h}: MAE={mae_rf:.2f}, RMSE={rmse_rf:.2f}, R2={r2_rf:.3f}")
            
            # Evaluate Gradient Boosting on h6 for primary pollutants for research comparison
            if h == 6 and pol in primary_pollutants:
                gb_model = GradientBoostingRegressor(
                    n_estimators=60,
                    max_depth=5,
                    learning_rate=0.1,
                    random_state=42
                )
                gb_model.fit(X_train, y_train)
                y_pred_gb = gb_model.predict(X_test)
                mae_gb = float(mean_absolute_error(y_test, y_pred_gb))
                rmse_gb = float(np.sqrt(mean_squared_error(y_test, y_pred_gb)))
                r2_gb = float(r2_score(y_test, y_pred_gb))
                
                metadata["model_comparison"][f"{pol}_h6"] = {
                    "random_forest": {"mae": round(mae_rf, 2), "rmse": round(rmse_rf, 2), "r2": round(r2_rf, 3)},
                    "gradient_boosting": {"mae": round(mae_gb, 2), "rmse": round(rmse_gb, 2), "r2": round(r2_gb, 3)}
                }
                print(f"  GB comparison h6: MAE={mae_gb:.2f}, RMSE={rmse_gb:.2f}, R2={r2_gb:.3f}")
            
            # Feature importance for horizon 6
            if h == 6:
                importances = dict(zip(feature_names, [float(x) for x in rf_model.feature_importances_]))
                sorted_imp = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:10]
                metadata["feature_importances"][pol] = [{"feature": k, "importance": round(v, 4)} for k, v in sorted_imp]
            
            # SHAP Explainability for PM2.5 horizon 6 (most critical)
            if pol == "pm25" and h == 6:
                print("  Computing SHAP TreeExplainer attributions for PM2.5...")
                try:
                    # Sample 150 instances for fast representative SHAP computation
                    sample_X = X_test.sample(n=min(150, len(X_test)), random_state=42)
                    explainer = shap.TreeExplainer(rf_model)
                    shap_values = explainer.shap_values(sample_X)
                    
                    mean_abs_shap = np.abs(shap_values).mean(axis=0)
                    shap_rankings = sorted(zip(feature_names, mean_abs_shap), key=lambda x: x[1], reverse=True)[:8]
                    
                    metadata["shap_summary"]["pm25_h6"] = {
                        "expected_value": float(explainer.expected_value[0] if isinstance(explainer.expected_value, np.ndarray) else explainer.expected_value),
                        "top_factors": [{"factor": f, "mean_shap_value": round(float(v), 3)} for f, v in shap_rankings]
                    }
                    
                    # Persist explainer for runtime local explanations
                    joblib.dump(explainer, os.path.join(MODELS_DIR, "shap_explainer_pm25_h6.joblib"))
                    print("  SHAP Explainer successfully persisted.")
                except Exception as e:
                    print(f"  Warning during SHAP computation: {e}")
    
    # Save feature names list
    with open(os.path.join(MODELS_DIR, "feature_names.json"), "w") as f:
        json.dump(feature_names, f, indent=2)
        
    # Save metadata JSON
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\nAll models and metadata saved successfully to {MODELS_DIR}")
    return metadata

if __name__ == "__main__":
    csv_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cpcb_delhi_air_quality.csv")
    train_and_evaluate(csv_file, quick_mode=False)
