"""
AirGuard AI — FastAPI RESTful Backend
Implements the shared forecasting engine, CPCB AQI calculation, SHAP explainability,
and independent decision-support pipelines for government authorities and citizens.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd

from fastapi import FastAPI, HTTPException, Query, Body, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.database.db import (
    init_db,
    seed_stations,
    get_all_stations,
    get_authority_actions,
    create_or_update_action,
    get_active_alerts,
    get_connection
)
from src.data.generate_dataset import STATIONS
from src.aqi.cpcb_calculator import calculate_composite_aqi, calculate_sub_index, CATEGORIES
from src.recommendations.authority_rules import generate_authority_recommendations
from src.recommendations.citizen_rules import generate_citizen_advisory, VULNERABILITY_PROFILES
from src.api.forecast_engine import get_forecast_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("airguard")

app = FastAPI(
    title="AirGuard AI — Explainable Air Quality Forecasting & Decision Support API",
    description=(
        "Dual-stakeholder decision support framework powered by Random Forest multi-horizon forecasting, "
        "official Indian National AQI (CPCB) breakpoint formulations, and SHAP explainability."
    ),
    version="1.0.0"
)

# CORS middleware for local frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Data models ───────────────────────────────────────────────────────────────
class AuthorityActionCreate(BaseModel):
    id: Optional[str] = Field(None, description="Optional ID for existing action update")
    station_id: str
    station_name: str
    pollutant: str
    action_title: str
    action_type: str
    department: str
    priority: str
    severity: str
    status: str = Field("Pending", description="Pending | In Progress | Completed")
    action_notes: Optional[str] = ""
    action_date: Optional[str] = None
    completed_date: Optional[str] = None
    pre_intervention_aqi: Optional[float] = None
    post_intervention_aqi: Optional[float] = None
    evaluation_notes: Optional[str] = ""

# ── Pre-seed sample historical authority actions ──────────────────────────────
def seed_initial_actions_and_alerts():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if actions table has entries
    cursor.execute("SELECT COUNT(*) FROM authority_actions")
    if cursor.fetchone()[0] == 0:
        logger.info("Seeding realistic authority intervention records...")
        sample_actions = [
            (
                "ACT-2026-DEL-01", "DEL_AV_01", "Anand Vihar", "PM10",
                "Mechanized Anti-Smog Gun & Water Sprinkling Operation",
                "Fugitive Dust Suppression", "Municipal Corporation (MCD) & PWD",
                "High", "Critical", "Completed",
                "Continuous misting deployed along Gazipur border and ISBT terminal over 48 hours.",
                (datetime.now() - timedelta(days=2)).isoformat(),
                (datetime.now() - timedelta(days=1)).isoformat(),
                385.0, 310.0,
                "Observed 19.5% reduction in localized PM10 sub-index within 1.5km sensor radius post-operation."
            ),
            (
                "ACT-2026-DEL-02", "DEL_PB_02", "Punjabi Bagh", "NO2",
                "Ring Road Commercial Freight Diversion & Signal Synchronization",
                "Traffic Demand Management", "Delhi Traffic Police",
                "High", "Elevated", "In Progress",
                "Diverted non-destined medium and heavy freight vehicles via Western Peripheral Expressway.",
                (datetime.now() - timedelta(hours=14)).isoformat(),
                None,
                142.0, None,
                "Intervention active. Evaluating evening rush-hour NO2 attenuation."
            ),
            (
                "ACT-2026-DEL-03", "DEL_JHP_08", "Jahangirpuri", "PM2.5",
                "Night Patrol Inspection for Open Solid Waste Burning",
                "Combustion Surveillance", "DPCC Enforcement Wing",
                "Immediate", "Critical", "Pending",
                "Night team assigned to inspect Badli and Jahangirpuri scrap sorting clusters.",
                (datetime.now() - timedelta(hours=3)).isoformat(),
                None,
                295.0, None,
                "Action dispatched to local sub-divisional magistrate (SDM) team."
            )
        ]
        cursor.executemany("""
        INSERT INTO authority_actions (
            id, station_id, station_name, pollutant, action_title, action_type,
            department, priority, severity, status, action_notes, action_date,
            completed_date, pre_intervention_aqi, post_intervention_aqi, evaluation_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_actions)
        
    # Check if alerts exist
    cursor.execute("SELECT COUNT(*) FROM alerts")
    if cursor.fetchone()[0] == 0:
        sample_alerts = [
            (
                "ALT-01", "DEL_AV_01", "Anand Vihar", "Severe Forecast Warning",
                "Critical", "PM2.5",
                "Forecasted PM2.5 expected to breach 240 ug/m3 in next 12 hours due to calm surface winds (<1.2 m/s).",
                12, 248.0, 120.0, 1, datetime.now().isoformat()
            ),
            (
                "ALT-02", "DEL_PB_02", "Punjabi Bagh", "Rapid Surge Alert",
                "High", "NO2",
                "Evening commute congestion projected to produce high NO2 surge exceeding 125 ug/m3.",
                6, 128.0, 80.0, 1, (datetime.now() - timedelta(hours=1)).isoformat()
            ),
            (
                "ALT-03", "DEL_JHP_08", "Jahangirpuri", "High Risk Location",
                "Elevated", "PM10",
                "Persistent dry winds and loose soil conditions forecast to elevate PM10 above 360 ug/m3.",
                24, 375.0, 250.0, 1, (datetime.now() - timedelta(hours=2)).isoformat()
            )
        ]
        cursor.executemany("""
        INSERT INTO alerts (
            id, station_id, station_name, alert_type, severity, pollutant,
            message, forecast_horizon, predicted_value, threshold_value, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_alerts)

    conn.commit()
    conn.close()

# Ensure DB is seeded on module import
init_db()
seed_stations(STATIONS)
seed_initial_actions_and_alerts()

# ── Startup event ─────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    init_db()
    seed_stations(STATIONS)
    seed_initial_actions_and_alerts()
    # Warm up forecast engine
    get_forecast_engine()
    logger.info("AirGuard AI Backend initialized successfully.")

# ── Helper to retrieve latest observations from CSV / DB ──────────────────────
def get_station_latest_observation(station_id: str) -> Dict[str, Any]:
    csv_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cpcb_delhi_air_quality.csv")
    if os.path.exists(csv_file):
        try:
            df = pd.read_csv(csv_file)
            station_rows = df[df["station_id"] == station_id]
            if not station_rows.empty:
                last_row = station_rows.iloc[-1].to_dict()
                return last_row
        except Exception as e:
            logger.error(f"Error reading latest observation: {e}")
            
    # Default physics baseline if CSV is reading
    st = next((s for s in STATIONS if s["station_id"] == station_id), STATIONS[0])
    return {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:00:00"),
        "station_id": st["station_id"],
        "station_name": st["name"],
        "latitude": st["lat"],
        "longitude": st["lon"],
        "station_type": st["type"],
        "pm25": round(75.0 * st.get("pm25_bias", 1.0), 1),
        "pm10": round(140.0 * st.get("pm10_bias", 1.0), 1),
        "no2": round(42.0 * st.get("no2_bias", 1.0), 1),
        "so2": 16.5,
        "co": 1.35,
        "o3": 38.0,
        "temperature": 25.5,
        "humidity": 58.0,
        "wind_speed": 2.1,
        "wind_direction": 280.0,
        "rainfall": 0.0
    }

# ── API Endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    engine = get_forecast_engine()
    models_loaded = sum(len(v) for v in engine.models.values())
    return {
        "status": "healthy",
        "service": "AirGuard AI Decision Support Framework",
        "timestamp": datetime.now().isoformat(),
        "models_loaded_count": models_loaded,
        "explainer_ready": engine.shap_explainer is not None,
        "aqi_standard": "CPCB Indian National Air Quality Index (NAQI)"
    }

@app.get("/api/locations")
def list_locations():
    """Returns all active monitoring stations with geographic and environmental metadata."""
    stations = get_all_stations()
    if not stations:
        return STATIONS
    return stations

@app.get("/api/air-quality/current")
def get_current_air_quality(station_id: Optional[str] = None):
    """
    Returns latest observed criteria pollutant concentrations, meteorological readings,
    and official CPCB composite AQI for a single station or all stations.
    """
    stations_to_query = [station_id] if station_id else [s["station_id"] for s in STATIONS]
    results = []
    
    for sid in stations_to_query:
        obs = get_station_latest_observation(sid)
        concentrations = {
            "pm25": obs.get("pm25"),
            "pm10": obs.get("pm10"),
            "no2": obs.get("no2"),
            "so2": obs.get("so2"),
            "co": obs.get("co"),
            "o3": obs.get("o3")
        }
        aqi_data = calculate_composite_aqi(concentrations)
        
        st_info = next((s for s in STATIONS if s["station_id"] == sid), {})
        
        results.append({
            "station_id": sid,
            "station_name": obs.get("station_name", st_info.get("name", sid)),
            "latitude": obs.get("latitude", st_info.get("lat")),
            "longitude": obs.get("longitude", st_info.get("lon")),
            "station_type": obs.get("station_type", st_info.get("type")),
            "timestamp": obs.get("timestamp"),
            "observed_pollutants": concentrations,
            "meteorology": {
                "temperature": obs.get("temperature"),
                "humidity": obs.get("humidity"),
                "wind_speed": obs.get("wind_speed"),
                "wind_direction": obs.get("wind_direction"),
                "rainfall": obs.get("rainfall")
            },
            "aqi": aqi_data["aqi"],
            "category": aqi_data["category"],
            "category_code": aqi_data["category_code"],
            "color": aqi_data["color"],
            "health_impact": aqi_data["health_impact"],
            "dominant_pollutant": aqi_data["dominant_pollutant"],
            "sub_indices": aqi_data["sub_indices"],
            "is_valid_cpcb": aqi_data["valid_cpcb"],
            "data_mode": "CPCB Delhi Observation"
        })
        
    return results[0] if (station_id and len(results) == 1) else results

@app.get("/api/air-quality/history")
def get_air_quality_history(station_id: str = "DEL_AV_01", limit: int = 48):
    """Returns chronological recent hourly observations for time-series charts."""
    csv_file = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cpcb_delhi_air_quality.csv")
    if os.path.exists(csv_file):
        try:
            df = pd.read_csv(csv_file)
            station_df = df[df["station_id"] == station_id].tail(limit)
            records = []
            for _, row in station_df.iterrows():
                concs = {
                    "pm25": row.get("pm25"), "pm10": row.get("pm10"),
                    "no2": row.get("no2"), "so2": row.get("so2"),
                    "co": row.get("co"), "o3": row.get("o3")
                }
                aqi_calc = calculate_composite_aqi(concs)
                rec = row.to_dict()
                rec["aqi"] = aqi_calc["aqi"]
                rec["category"] = aqi_calc["category"]
                rec["dominant_pollutant"] = aqi_calc["dominant_pollutant"]
                records.append(rec)
            return records
        except Exception as e:
            logger.error(f"Error reading history: {e}")
            
    # Mock fallback
    return []

@app.get("/api/predictions/aqi")
def get_aqi_predictions(station_id: str = "DEL_AV_01"):
    """
    Returns multi-horizon predictions (6h, 12h, 24h) for composite AQI and criteria pollutants
    generated by the shared Random Forest forecasting engine.
    """
    obs = get_station_latest_observation(station_id)
    engine = get_forecast_engine()
    predictions = engine.predict_multi_horizon(obs)
    
    current_concs = {
        "pm25": obs.get("pm25"), "pm10": obs.get("pm10"), "no2": obs.get("no2"),
        "so2": obs.get("so2"), "co": obs.get("co"), "o3": obs.get("o3")
    }
    current_aqi = calculate_composite_aqi(current_concs)
    
    st_info = next((s for s in STATIONS if s["station_id"] == station_id), {})
    
    return {
        "station_id": station_id,
        "station_name": obs.get("station_name", st_info.get("name", station_id)),
        "current_observation": {
            "timestamp": obs.get("timestamp"),
            "aqi": current_aqi["aqi"],
            "category": current_aqi["category"],
            "dominant_pollutant": current_aqi["dominant_pollutant"],
            "concentrations": current_concs
        },
        "forecasts": predictions,
        "model_architecture": "Direct Horizon Random Forest Regressors (6h, 12h, 24h)",
        "prediction_engine": "Shared ML Engine (AirGuard Core)"
    }

@app.get("/api/predictions/pollutants")
def get_pollutant_predictions(station_id: str = "DEL_AV_01", horizon: int = 6):
    """Returns detailed pollutant breakdown for a specific forecast horizon."""
    if horizon not in [6, 12, 24]:
        raise HTTPException(status_code=400, detail="Horizon must be 6, 12, or 24 hours.")
        
    obs = get_station_latest_observation(station_id)
    engine = get_forecast_engine()
    preds = engine.predict_multi_horizon(obs)
    
    h_data = preds.get(f"h{horizon}")
    return {
        "station_id": station_id,
        "horizon_hours": horizon,
        "target_timestamp": h_data["target_timestamp"],
        "concentrations": h_data["concentrations"],
        "sub_indices": h_data["sub_indices"],
        "aqi": h_data["aqi"],
        "category": h_data["category"],
        "dominant_pollutant": h_data["dominant_pollutant"]
    }

@app.get("/api/predictions/explanations")
def get_prediction_explanations(station_id: str = "DEL_AV_01", pollutant: str = "pm25"):
    """
    Returns SHAP explainability attributions showing the exact meteorological,
    persistence, and temporal features driving the forecasted change.
    """
    obs = get_station_latest_observation(station_id)
    engine = get_forecast_engine()
    explanation = engine.explain_prediction(obs, target_pollutant=pollutant.lower())
    
    return {
        "station_id": station_id,
        "target_pollutant": pollutant.upper(),
        "explainability_framework": "SHAP (SHapley Additive exPlanations) TreeExplainer",
        "scientific_disclaimer": "Attributions represent model feature dependencies, not confirmed causal interventions.",
        "explanation": explanation
    }

@app.get("/api/recommendations/authority")
def get_authority_decision_support(station_id: str = "DEL_AV_01"):
    """
    Decision-support recommendations for government authorities and pollution control boards.
    Provides rule-based actionable interventions categorized by priority, pollutant, and department.
    """
    obs = get_station_latest_observation(station_id)
    engine = get_forecast_engine()
    preds = engine.predict_multi_horizon(obs)
    
    h6 = preds.get("h6", {})
    h24 = preds.get("h24", {})
    
    current_aqi_calc = calculate_composite_aqi({
        "pm25": obs.get("pm25"), "pm10": obs.get("pm10"), "no2": obs.get("no2"),
        "so2": obs.get("so2"), "co": obs.get("co"), "o3": obs.get("o3")
    })
    
    st_info = next((s for s in STATIONS if s["station_id"] == station_id), {})
    
    recommendations = generate_authority_recommendations(
        station_id=station_id,
        station_name=obs.get("station_name", st_info.get("name", station_id)),
        station_type=obs.get("station_type", st_info.get("type", "Urban")),
        current_aqi=current_aqi_calc.get("aqi", 150.0),
        predicted_aqi_6h=h6.get("aqi", 160.0),
        predicted_aqi_24h=h24.get("aqi", 155.0),
        predicted_pollutants=h6.get("concentrations", {}),
        dominant_pollutant=h6.get("dominant_pollutant", "PM25")
    )
    
    return {
        "station_id": station_id,
        "station_name": obs.get("station_name", st_info.get("name", station_id)),
        "current_aqi": current_aqi_calc.get("aqi"),
        "predicted_aqi_6h": h6.get("aqi"),
        "predicted_aqi_24h": h24.get("aqi"),
        "dominant_pollutant": h6.get("dominant_pollutant"),
        "warning_level": h6.get("category"),
        "total_recommendations": len(recommendations),
        "recommendations": recommendations,
        "policy_framework": "Graded Response Action Plan (GRAP) & National Clean Air Programme (NCAP) Alignment",
        "disclaimer": "These suggestions are decision-support insights derived from ML forecasts. They do not constitute statutory executive orders."
    }

@app.get("/api/recommendations/citizen")
def get_citizen_health_advisory(
    station_id: str = "DEL_AV_01",
    profile: str = Query("general", description="general | children | elderly | respiratory")
):
    """
    Plain-language, actionable health advisory customized for citizen vulnerability profiles.
    """
    valid_profiles = [p["id"] for p in VULNERABILITY_PROFILES]
    if profile not in valid_profiles:
        profile = "general"
        
    obs = get_station_latest_observation(station_id)
    engine = get_forecast_engine()
    preds = engine.predict_multi_horizon(obs)
    
    h6 = preds.get("h6", {})
    h24 = preds.get("h24", {})
    
    current_aqi_calc = calculate_composite_aqi({
        "pm25": obs.get("pm25"), "pm10": obs.get("pm10"), "no2": obs.get("no2"),
        "so2": obs.get("so2"), "co": obs.get("co"), "o3": obs.get("o3")
    })
    
    advisory = generate_citizen_advisory(
        profile_id=profile,
        aqi=current_aqi_calc.get("aqi", 120.0),
        category=current_aqi_calc.get("category", "Moderate"),
        dominant_pollutant=current_aqi_calc.get("dominant_pollutant", "PM25"),
        forecast_aqi_6h=h6.get("aqi"),
        forecast_aqi_24h=h24.get("aqi"),
        pollutants=h6.get("concentrations", {})
    )
    
    advisory["available_profiles"] = VULNERABILITY_PROFILES
    return advisory

@app.get("/api/alerts")
def get_alerts(station_id: Optional[str] = None):
    """Returns active forecast warnings and pollution surge alerts."""
    all_alerts = get_active_alerts()
    if station_id:
        all_alerts = [a for a in all_alerts if a["station_id"] == station_id]
    return all_alerts

@app.get("/api/model/metrics")
def get_model_metrics():
    """Returns genuine evaluation metrics (MAE, RMSE, R²) and cross-model comparisons."""
    engine = get_forecast_engine()
    return engine.metadata

@app.get("/api/model/feature-importance")
def get_feature_importance(pollutant: str = "pm25"):
    """Returns feature importance ranking for the chosen pollutant baseline model."""
    engine = get_forecast_engine()
    fi = engine.metadata.get("feature_importances", {}).get(pollutant.lower(), [])
    return {
        "pollutant": pollutant.upper(),
        "feature_importances": fi
    }

@app.get("/api/authority/actions")
def list_authority_actions():
    """Returns all tracked authority actions and interventions."""
    return get_authority_actions()

@app.post("/api/authority/actions")
def update_authority_action(action: AuthorityActionCreate):
    """Records or updates an authority intervention action."""
    action_dict = action.dict()
    if not action_dict.get("id"):
        action_dict["id"] = f"ACT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    res = create_or_update_action(action_dict)
    return {
        "message": "Action record saved successfully",
        "action": res
    }

# ── Serve Built Frontend SPA (Unified Single-Port Deployment) ─────────────────
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "dist"))
ASSETS_DIR = os.path.join(DIST_DIR, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "AirGuard AI API running. Frontend dist not found."}

