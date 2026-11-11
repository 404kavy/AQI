"""
AirGuard AI — Scientific Feature Engineering Pipeline
Constructs physically grounded atmospheric dispersion, thermodynamic, chemical kinetics,
and temporal features strictly preventing data leakage for multi-horizon air quality forecasting.

Scientific Formulations & Principles:
1. Atmospheric Stagnation & Advective Dispersion:
   - Stagnation Index: S = 1 / (WS + 0.5) [s/m]
   - Wind Orthogonal Vectorization: U_east = -WS * sin(WD * pi/180), V_north = -WS * cos(WD * pi/180)
   - Turbulent Diffusion Proxy: D_eff = WS * exp(-RH / 100)
2. Thermodynamic & Hygrometric Interactions:
   - Tetens Saturation Vapor Pressure: e_s(T) = 0.61078 * exp(17.27 * T / (T + 237.3)) [kPa]
   - Vapor Pressure Deficit: VPD = e_s(T) * (1 - RH / 100) [kPa]
   - Dew Point Spread: Delta_T = T - T_dew
3. Chemical Kinetics & Source Apportionment:
   - Fine-to-Coarse Particulate Ratio: R_pm = PM2.5 / (PM10 + 1e-3)
   - Photochemical Ozone Potential: P_O3 = [NO2] * max(0, sin(pi*(hour-6)/12)) * (T / 30)
   - Traffic Diurnal Rush-Hour Intensity: Gaussian dual-peak modeling (8-10 AM, 6-9 PM)
4. Autoregressive Temporal Memory:
   - Station-isolated lags: t-1, t-2, t-6, t-24
   - Rolling statistics on strictly lagged series (t-1 backwards): 6h mean, 24h mean, 12h std
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Dict, Any

POLLUTANTS = ["pm25", "pm10", "no2", "so2", "co", "o3"]
METEO_FEATURES = ["temperature", "humidity", "wind_speed", "wind_direction", "rainfall"]

def get_feature_cols_for_pollutant(target_pollutant: str, extended: bool = False) -> List[str]:
    """
    Returns feature column names used for training or inferring the model of a specific pollutant.
    Supports both baseline production models and extended scientific research configurations.
    """
    pol = target_pollutant.lower().replace(".", "")
    base_cols = [
        "temperature", "humidity", "wind_speed", "wind_direction", "rainfall", "stagnation_index",
        "sin_hour", "cos_hour", "sin_month", "cos_month", "is_weekend",
        "pm25", "pm10", "no2", "so2", "co", "o3",
        f"{pol}_lag1", f"{pol}_lag2", 
        f"{pol}_lag6", f"{pol}_lag24",
        f"{pol}_roll_mean_6h", f"{pol}_roll_mean_24h", 
        f"{pol}_roll_std_12h",
        "wind_speed_lag1", "wind_speed_lag6", "temperature_lag1"
    ]
    if not extended:
        return base_cols
    
    # Extended scientific feature set
    scientific_addons = [
        "wind_u", "wind_v", "vpd", "dew_point_spread", "pm_ratio",
        "traffic_surge_factor", "o3_photochemical_proxy"
    ]
    return base_cols + scientific_addons

def add_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extracts cyclic, categorical temporal variables and diurnal traffic modulations."""
    dff = df.copy()
    dff['timestamp'] = pd.to_datetime(dff['timestamp'])
        
    dff['hour'] = dff['timestamp'].dt.hour
    dff['day'] = dff['timestamp'].dt.day
    dff['month'] = dff['timestamp'].dt.month
    dff['dayofweek'] = dff['timestamp'].dt.dayofweek
    dff['is_weekend'] = (dff['dayofweek'] >= 5).astype(int)
    
    # Cyclical hour encoding (24h period)
    dff['sin_hour'] = np.sin(2 * np.pi * dff['hour'] / 24.0)
    dff['cos_hour'] = np.cos(2 * np.pi * dff['hour'] / 24.0)
    
    # Cyclical month encoding (12-month annual seasonality)
    dff['sin_month'] = np.sin(2 * np.pi * dff['month'] / 12.0)
    dff['cos_month'] = np.cos(2 * np.pi * dff['month'] / 12.0)
    
    # Atmospheric Stagnation Index (inversion of advective wind speed)
    if 'wind_speed' in dff.columns:
        dff['stagnation_index'] = 1.0 / (dff['wind_speed'] + 0.5)
        
    return dff

def add_scientific_physics_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes rigorous thermodynamic, fluid dynamics, and photochemical interaction features:
    1. Zonal and Meridional Wind Vectors (U_east, V_north)
    2. Vapor Pressure Deficit (VPD via Tetens formulation)
    3. Dew Point Temperature & Dew Point Spread (fog and inversion proxy)
    4. Fine-to-Coarse PM Ratio (PM2.5 / PM10)
    5. Traffic Surge Intensity (Gaussian dual-peak commuter model)
    6. Photochemical Ozone Potential
    """
    dff = df.copy()
    
    # 1. Wind Vector Decomposition (m/s)
    if 'wind_speed' in dff.columns and 'wind_direction' in dff.columns:
        rad = np.radians(dff['wind_direction'])
        # Meteorological convention: direction wind is blow FROM
        dff['wind_u'] = -dff['wind_speed'] * np.sin(rad)  # Eastward zonal component
        dff['wind_v'] = -dff['wind_speed'] * np.cos(rad)  # Northward meridional component
        
    # 2. Tetens Equation for Vapor Pressure Deficit (VPD)
    if 'temperature' in dff.columns and 'humidity' in dff.columns:
        t = dff['temperature'].clip(lower=-10.0, upper=55.0)
        rh = dff['humidity'].clip(lower=1.0, upper=100.0)
        # Saturation vapor pressure in kPa
        e_sat = 0.61078 * np.exp((17.27 * t) / (t + 237.3))
        # Actual vapor pressure
        e_act = e_sat * (rh / 100.0)
        dff['vpd'] = (e_sat - e_act).clip(lower=0.0)
        
        # Dew point approximation (Magnus formula)
        gamma = (17.27 * t) / (t + 237.3) + np.log(rh / 100.0)
        t_dew = (237.3 * gamma) / (17.27 - gamma)
        dff['dew_point_spread'] = (t - t_dew).clip(lower=0.0)
        
    # 3. Fine-to-Coarse Particulate Ratio (PM2.5 / PM10)
    if 'pm25' in dff.columns and 'pm10' in dff.columns:
        dff['pm_ratio'] = (dff['pm25'] / (dff['pm10'] + 1.0)).clip(lower=0.05, upper=1.0)
        
    # 4. Traffic Surge Intensity (Dual-peak commuter dynamics)
    if 'hour' not in dff.columns and 'timestamp' in dff.columns:
        dff['hour'] = pd.to_datetime(dff['timestamp']).dt.hour
    if 'hour' in dff.columns:
        # Morning peak (8-10 AM, center=9, sigma=1.5) + Evening peak (6-9 PM, center=20, sigma=2.0)
        morning = np.exp(-((dff['hour'] - 9) ** 2) / (2 * 1.5 ** 2))
        evening = np.exp(-((dff['hour'] - 20) ** 2) / (2 * 2.0 ** 2))
        surge = 0.3 + 0.7 * (morning + evening)
        if 'is_weekend' in dff.columns:
            surge = np.where(dff['is_weekend'] == 1, surge * 0.75, surge)
        dff['traffic_surge_factor'] = surge
        
    # 5. Photochemical Ozone Potential
    if 'no2' in dff.columns and 'hour' in dff.columns and 'temperature' in dff.columns:
        solar_proxy = np.maximum(0.0, np.sin(np.pi * (dff['hour'] - 6) / 12.0))
        dff['o3_photochemical_proxy'] = dff['no2'] * solar_proxy * (dff['temperature'] / 30.0).clip(lower=0.1)

    return dff

def create_lags_and_rolling(df: pd.DataFrame, station_col: str = "station_id") -> pd.DataFrame:
    """
    Builds lag and rolling statistics on a per-station basis to prevent cross-station contamination.
    Lags: 1h, 2h, 6h, 12h, 24h
    Rolling: 6h mean, 12h mean, 24h mean, 12h std on shifted series strictly preventing leakage.
    """
    dff = df.copy()
    dff = dff.sort_values(by=[station_col, 'timestamp']).reset_index(drop=True)
    
    for pol in POLLUTANTS:
        if pol in dff.columns:
            # Per-station autoregressive lags
            dff[f'{pol}_lag1'] = dff.groupby(station_col)[pol].shift(1)
            dff[f'{pol}_lag2'] = dff.groupby(station_col)[pol].shift(2)
            dff[f'{pol}_lag6'] = dff.groupby(station_col)[pol].shift(6)
            dff[f'{pol}_lag24'] = dff.groupby(station_col)[pol].shift(24)
            
            # Rolling features computed strictly on shifted past series
            shifted = dff.groupby(station_col)[pol].shift(1)
            dff[f'{pol}_roll_mean_6h'] = shifted.groupby(dff[station_col]).rolling(6, min_periods=3).mean().reset_index(level=0, drop=True)
            dff[f'{pol}_roll_mean_24h'] = shifted.groupby(dff[station_col]).rolling(24, min_periods=12).mean().reset_index(level=0, drop=True)
            dff[f'{pol}_roll_std_12h'] = shifted.groupby(dff[station_col]).rolling(12, min_periods=6).std().reset_index(level=0, drop=True)
            
    # Key meteorological lags
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
