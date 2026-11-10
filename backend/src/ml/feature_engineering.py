"""
AirGuard AI — Feature Engineering Pipeline
Constructs temporally consistent lag, rolling, cyclical temporal, and meteorological features
strictly preventing data leakage for multi-horizon air quality forecasting.
"""

import pandas as pd
import numpy as np
from typing import List, Tuple, Dict, Any

POLLUTANTS = ["pm25", "pm10", "no2", "so2", "co", "o3"]
METEO_FEATURES = ["temperature", "humidity", "wind_speed", "wind_direction", "rainfall"]

def get_feature_cols_for_pollutant(target_pollutant: str) -> List[str]:
    """Returns exact feature column names used for training the model of a specific pollutant."""
    pol = target_pollutant.lower().replace(".", "")
    return [
        "temperature", "humidity", "wind_speed", "wind_direction", "rainfall", "stagnation_index",
        "sin_hour", "cos_hour", "sin_month", "cos_month", "is_weekend",
        "pm25", "pm10", "no2", "so2", "co", "o3",
        f"{pol}_lag1", f"{pol}_lag2", 
        f"{pol}_lag6", f"{pol}_lag24",
        f"{pol}_roll_mean_6h", f"{pol}_roll_mean_24h", 
        f"{pol}_roll_std_12h",
        "wind_speed_lag1", "wind_speed_lag6", "temperature_lag1"
    ]

def add_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extracts cyclic and categorical temporal variables."""
    dff = df.copy()
    dff['timestamp'] = pd.to_datetime(dff['timestamp'])
        
    dff['hour'] = dff['timestamp'].dt.hour
    dff['day'] = dff['timestamp'].dt.day
    dff['month'] = dff['timestamp'].dt.month
    dff['dayofweek'] = dff['timestamp'].dt.dayofweek
    dff['is_weekend'] = (dff['dayofweek'] >= 5).astype(int)
    
    # Cyclical hour encoding
    dff['sin_hour'] = np.sin(2 * np.pi * dff['hour'] / 24.0)
    dff['cos_hour'] = np.cos(2 * np.pi * dff['hour'] / 24.0)
    
    # Cyclical month encoding (seasonality)
    dff['sin_month'] = np.sin(2 * np.pi * dff['month'] / 12.0)
    dff['cos_month'] = np.cos(2 * np.pi * dff['month'] / 12.0)
    
    # Meteorological interaction: stagnation index (approx. 1 / (ws + 0.1))
    if 'wind_speed' in dff.columns:
        dff['stagnation_index'] = 1.0 / (dff['wind_speed'] + 0.5)
        
    return dff

def create_lags_and_rolling(df: pd.DataFrame, station_col: str = "station_id") -> pd.DataFrame:
    """
    Builds lag and rolling statistics on a per-station basis to prevent cross-contamination.
    Lags: 1h, 2h, 6h, 12h, 24h
    Rolling: 6h mean, 12h mean, 24h mean, 12h std
    """
    dff = df.copy()
    dff = dff.sort_values(by=[station_col, 'timestamp']).reset_index(drop=True)
    
    for pol in POLLUTANTS:
        if pol in dff.columns:
            # Per station lags
            dff[f'{pol}_lag1'] = dff.groupby(station_col)[pol].shift(1)
            dff[f'{pol}_lag2'] = dff.groupby(station_col)[pol].shift(2)
            dff[f'{pol}_lag6'] = dff.groupby(station_col)[pol].shift(6)
            dff[f'{pol}_lag24'] = dff.groupby(station_col)[pol].shift(24)
            
            # Rolling features on shifted series (strictly preventing current-value leakage)
            shifted = dff.groupby(station_col)[pol].shift(1)
            dff[f'{pol}_roll_mean_6h'] = shifted.groupby(dff[station_col]).rolling(6, min_periods=3).mean().reset_index(level=0, drop=True)
            dff[f'{pol}_roll_mean_24h'] = shifted.groupby(dff[station_col]).rolling(24, min_periods=12).mean().reset_index(level=0, drop=True)
            dff[f'{pol}_roll_std_12h'] = shifted.groupby(dff[station_col]).rolling(12, min_periods=6).std().reset_index(level=0, drop=True)
            
    # Also lag wind speed and temp
    for meteo in ['wind_speed', 'temperature', 'humidity']:
        if meteo in dff.columns:
            dff[f'{meteo}_lag1'] = dff.groupby(station_col)[meteo].shift(1)
            dff[f'{meteo}_lag6'] = dff.groupby(station_col)[meteo].shift(6)
            
    return dff

def build_direct_horizon_targets(df: pd.DataFrame, horizons: List[int] = [6, 12, 24], station_col: str = "station_id") -> pd.DataFrame:
    """
    Creates target columns for direct multi-horizon forecasting (e.g. pm25_h6, pm25_h12, pm25_h24).
    Each model predicts directly target at t + h using features strictly known at t.
    """
    dff = df.copy()
    for h in horizons:
        for pol in POLLUTANTS:
            if pol in dff.columns:
                dff[f'{pol}_target_h{h}'] = dff.groupby(station_col)[pol].shift(-h)
    return dff
