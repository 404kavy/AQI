"""
AirGuard AI — CPCB Delhi Air Quality Data Ingestion & Generation Engine
Generates and structures realistic multi-station hourly air quality and meteorological observations
grounded in official CPCB Delhi NCR seasonal patterns, diurnal dynamics, and atmospheric physics.
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

STATIONS = [
    {
        "station_id": "DEL_AV_01",
        "name": "Anand Vihar",
        "agency": "DPCC",
        "lat": 28.6468,
        "lon": 77.3160,
        "type": "Industrial / Transport Hub",
        "pm25_bias": 1.35,
        "pm10_bias": 1.45,
        "no2_bias": 1.30,
        "description": "High particulate and traffic load near Anand Vihar ISBT and Gazipur border."
    },
    {
        "station_id": "DEL_PB_02",
        "name": "Punjabi Bagh",
        "agency": "DPCC",
        "lat": 28.6683,
        "lon": 77.1167,
        "type": "Urban / High Traffic",
        "pm25_bias": 1.15,
        "pm10_bias": 1.20,
        "no2_bias": 1.25,
        "description": "West Delhi transit corridor with dense commercial vehicular traffic."
    },
    {
        "station_id": "DEL_ITO_03",
        "name": "ITO",
        "agency": "CPCB",
        "lat": 28.6318,
        "lon": 77.2410,
        "type": "Commercial / Major Junction",
        "pm25_bias": 1.10,
        "pm10_bias": 1.10,
        "no2_bias": 1.40,
        "description": "Central commercial arterial junction with high peak-hour NO2."
    },
    {
        "station_id": "DEL_RKP_04",
        "name": "RK Puram",
        "agency": "DPCC",
        "lat": 28.5632,
        "lon": 77.1869,
        "type": "Residential / Arterial",
        "pm25_bias": 1.00,
        "pm10_bias": 1.05,
        "no2_bias": 1.05,
        "description": "South Delhi institutional and residential area with moderate tree canopy."
    },
    {
        "station_id": "DEL_LR_05",
        "name": "Lodhi Road",
        "agency": "IMD",
        "lat": 28.5918,
        "lon": 77.2273,
        "type": "Urban Forest / IMD Reference",
        "pm25_bias": 0.85,
        "pm10_bias": 0.80,
        "no2_bias": 0.85,
        "description": "Central Delhi IMD headquarters observatory surrounded by Lodhi Gardens."
    },
    {
        "station_id": "DEL_IGI_06",
        "name": "IGI Airport T3",
        "agency": "IMD",
        "lat": 28.5629,
        "lon": 77.0814,
        "type": "Airport / Southwest Suburb",
        "pm25_bias": 0.95,
        "pm10_bias": 1.00,
        "no2_bias": 1.10,
        "description": "Southwest gateway monitoring international airport emissions."
    },
    {
        "station_id": "DEL_DTU_07",
        "name": "Delhi Tech University (DTU)",
        "agency": "CPCB",
        "lat": 28.7501,
        "lon": 77.1177,
        "type": "Institutional / North Industrial",
        "pm25_bias": 1.20,
        "pm10_bias": 1.25,
        "no2_bias": 1.10,
        "description": "North Delhi near Badli industrial area and outer Ring Road."
    },
    {
        "station_id": "DEL_JHP_08",
        "name": "Jahangirpuri",
        "agency": "DPCC",
        "lat": 28.7328,
        "lon": 77.1706,
        "type": "Dense Urban / Industrial",
        "pm25_bias": 1.30,
        "pm10_bias": 1.40,
        "no2_bias": 1.20,
        "description": "North Delhi high-density industrial and residential cluster."
    }
]

def generate_delhi_synthetic_dataset(output_path: str, days: int = 180):
    """
    Generates realistic hourly air quality & meteorological dataset for 8 Delhi stations
    over the given number of days leading up to present day.
    Includes physics-informed diurnal and seasonal variability.
    """
    print(f"Generating realistic CPCB dataset for {len(STATIONS)} stations over {days} days...")
    np.random.seed(42)
    
    end_date = datetime.now().replace(minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days)
    timestamps = pd.date_range(start=start_date, end=end_date, freq='h')
    
    all_records = []
    
    for station in STATIONS:
        # Base random walk states for smooth autocorrelated time-series
        pm25_state = 85.0 * station["pm25_bias"]
        pm10_state = 160.0 * station["pm10_bias"]
        no2_state = 45.0 * station["no2_bias"]
        so2_state = 18.0
        co_state = 1.6
        o3_state = 35.0
        temp_state = 26.0
        rh_state = 62.0
        ws_state = 2.4
        
        for ts in timestamps:
            month = ts.month
            hour = ts.hour
            day_of_week = ts.dayofweek
            is_weekend = 1 if day_of_week in [5, 6] else 0
            
            # Seasonal factors (Delhi winter inversion peak in Nov, Dec, Jan, Feb)
            if month in [11, 12, 1]:
                season_mult = 2.3  # Winter smog & inversion
                temp_base = 14.0
                rh_base = 78.0
                wind_base = 1.4
            elif month in [2, 10]:
                season_mult = 1.5  # Post-monsoon / transition
                temp_base = 22.0
                rh_base = 65.0
                wind_base = 2.0
            elif month in [3, 4, 5]:
                season_mult = 1.1  # Summer dust & high temperatures
                temp_base = 34.0
                rh_base = 38.0
                wind_base = 3.2
            else: # Monsoon Jun, Jul, Aug, Sep
                season_mult = 0.55 # Washout effect
                temp_base = 30.0
                rh_base = 82.0
                wind_base = 2.8
            
            # Meteorological Diurnal Cycles
            # Temperature peaks ~ 2 PM (hour 14), lowest at 5 AM
            temp_diurnal = 7.0 * np.sin((hour - 8) * np.pi / 12)
            temp = float(np.clip(temp_base + temp_diurnal + np.random.normal(0, 1.2), 4.0, 48.0))
            
            # Relative humidity is inverse of temperature
            rh_diurnal = -18.0 * np.sin((hour - 8) * np.pi / 12)
            rh = float(np.clip(rh_base + rh_diurnal + np.random.normal(0, 3.5), 15.0, 99.0))
            
            # Wind speed: higher in afternoon, calm at night
            ws_diurnal = 1.0 * np.sin((hour - 10) * np.pi / 12)
            wind_speed = float(np.clip(wind_base + ws_diurnal + np.random.exponential(0.6), 0.3, 12.0))
            wind_direction = float((np.random.normal(290, 40)) % 360) # Prevailing NW winds in Delhi
            
            # Rainfall: sporadic, mostly in monsoon
            rainfall = 0.0
            if month in [6, 7, 8, 9] and np.random.random() < 0.08:
                rainfall = float(np.random.exponential(4.5))
            
            # Traffic diurnal cycles: double peaks at 8-10 AM and 6-9 PM
            traffic_morning = np.exp(-((hour - 9) ** 2) / 4.0)
            traffic_evening = np.exp(-((hour - 20) ** 2) / 6.0)
            traffic_factor = 0.4 + 0.6 * (traffic_morning + traffic_evening)
            if is_weekend:
                traffic_factor *= 0.8
            
            # Atmospheric dispersion factor (inversion + calm wind traps pollutants)
            dispersion_factor = 1.0 / (wind_speed + 0.5)
            
            # PM2.5 calculation
            pm25_target = (35.0 + 40.0 * traffic_factor) * season_mult * station["pm25_bias"] * (dispersion_factor * 2.2)
            if rainfall > 1.0:
                pm25_target *= 0.4
            pm25_state = 0.82 * pm25_state + 0.18 * pm25_target + np.random.normal(0, 4.0)
            pm25 = float(np.clip(pm25_state, 12.0, 480.0))
            
            # PM10 calculation (correlated with PM2.5 + road dust / construction)
            dust_factor = 1.2 if month in [3, 4, 5] else 1.0
            pm10_target = pm25 * (1.75 * dust_factor) + (25.0 * station["pm10_bias"])
            pm10_state = 0.80 * pm10_state + 0.20 * pm10_target + np.random.normal(0, 6.0)
            pm10 = float(np.clip(pm10_state, pm25 * 1.15, 650.0))
            
            # NO2 calculation (strongly driven by traffic and industrial burning)
            no2_target = (18.0 + 45.0 * traffic_factor) * station["no2_bias"] * (dispersion_factor * 1.8)
            no2_state = 0.78 * no2_state + 0.22 * no2_target + np.random.normal(0, 3.0)
            no2 = float(np.clip(no2_state, 8.0, 240.0))
            
            # SO2 calculation (industrial and diesel fuel combustion)
            so2_target = 14.0 * (1.0 + 0.3 * np.sin(hour * np.pi / 12)) * (dispersion_factor * 1.2)
            so2_state = 0.85 * so2_state + 0.15 * so2_target + np.random.normal(0, 1.5)
            so2 = float(np.clip(so2_state, 4.0, 95.0))
            
            # CO calculation (incomplete vehicular and biomass combustion in mg/m3)
            co_target = (0.7 + 1.6 * traffic_factor) * season_mult * (dispersion_factor * 1.4)
            co_state = 0.82 * co_state + 0.18 * co_target + np.random.normal(0, 0.1)
            co = float(np.clip(co_state, 0.2, 14.5))
            
            # O3 calculation (photochemical secondary pollutant, produced by sunlight, NO2, VOCs)
            # Peaks at 12 PM - 3 PM, lowest at night
            solar_radiation = max(0.0, np.sin((hour - 6) * np.pi / 12))
            o3_target = 12.0 + (70.0 * solar_radiation * (temp / 30.0)) * (0.8 + 0.2 * (no2 / 40.0))
            o3_state = 0.75 * o3_state + 0.25 * o3_target + np.random.normal(0, 2.5)
            o3 = float(np.clip(o3_state, 4.0, 195.0))
            
            all_records.append({
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "station_id": station["station_id"],
                "station_name": station["name"],
                "latitude": station["lat"],
                "longitude": station["lon"],
                "station_type": station["type"],
                "pm25": round(pm25, 1),
                "pm10": round(pm10, 1),
                "no2": round(no2, 1),
                "so2": round(so2, 1),
                "co": round(co, 2),
                "o3": round(o3, 1),
                "temperature": round(temp, 1),
                "humidity": round(rh, 1),
                "wind_speed": round(wind_speed, 2),
                "wind_direction": round(wind_direction, 1),
                "rainfall": round(rainfall, 2)
            })
            
    df = pd.DataFrame(all_records)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df):,} hourly observations saved to {output_path}")
    return df

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cpcb_delhi_air_quality.csv")
    generate_delhi_synthetic_dataset(out_file, days=180)
