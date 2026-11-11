/**
 * AirGuard AI — API Client Service
 * Features automatic dual-tier live ingestion:
 * Tier 1: FastAPI Python ML Backend (when running locally or on cloud server)
 * Tier 2: Direct Open-Meteo CAAQMS Live Ingestion (browser-direct real-time fallback)
 * Tier 3: CPCB Demo Simulation (offline defensive fallback)
 */

import {
  DEMO_STATIONS,
  getDemoPredictions,
  getDemoExplanations,
  getDemoAuthorityRecommendations,
  getDemoCitizenAdvisory,
  DEMO_ALERTS,
  DEMO_ACTIONS,
  DEMO_METRICS
} from "./mockData";
import {
  fetchLiveDirectStations,
  fetchLiveDirectHistory
} from "./realtimeDirect";

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : "/api";

let _liveMode = null; // 'backend' | 'direct' | false

export function isBackendLive() {
  return _liveMode === 'backend' || _liveMode === 'direct';
}

export function getLiveMode() {
  return _liveMode;
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Health check failed");
    const data = await res.json();
    _liveMode = 'backend';
    return { ...data, is_live: true, live_type: "backend" };
  } catch (err) {
    // Backend offline: check direct real-time client ingestion
    try {
      const live = await fetchLiveDirectStations();
      if (live && live.length > 0) {
        _liveMode = 'direct';
        return {
          status: "live_direct",
          service: "AirGuard AI CAAQMS Real-Time Engine",
          is_live: true,
          live_type: "direct",
          models_loaded_count: 18,
          explainer_ready: true,
          aqi_standard: "CPCB Indian National Air Quality Index (NAQI) — Live Open-Meteo Feed"
        };
      }
    } catch (directErr) {
      console.warn("Direct live feed check error:", directErr);
    }

    _liveMode = false;
    return {
      status: "demo_simulation",
      service: "AirGuard AI Decision Support Framework",
      is_live: false,
      live_type: "demo",
      models_loaded_count: 18,
      explainer_ready: true,
      aqi_standard: "CPCB Indian National Air Quality Index (NAQI) — Demo Mode"
    };
  }
}

export async function fetchLocations() {
  try {
    const res = await fetch(`${API_BASE}/locations`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch locations");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    const live = await fetchLiveDirectStations();
    if (live && live.length > 0) {
      _liveMode = 'direct';
      return live;
    }
    _liveMode = false;
    return DEMO_STATIONS;
  }
}

export async function fetchCurrentAirQuality(stationId = null) {
  try {
    const url = stationId 
      ? `${API_BASE}/air-quality/current?station_id=${stationId}`
      : `${API_BASE}/air-quality/current`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch current air quality");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    const live = await fetchLiveDirectStations();
    const pool = live && live.length > 0 ? live : DEMO_STATIONS;
    if (live && live.length > 0) _liveMode = 'direct';
    
    if (stationId) {
      return pool.find(s => s.station_id === stationId) || pool[0];
    }
    return pool;
  }
}

export async function fetchAirQualityHistory(stationId = "DEL_AV_01", limit = 48) {
  try {
    const res = await fetch(`${API_BASE}/air-quality/history?station_id=${stationId}&limit=${limit}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch air quality history");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    const directHistory = await fetchLiveDirectHistory(stationId, limit);
    if (directHistory && directHistory.length > 0) {
      _liveMode = 'direct';
      return directHistory;
    }

    _liveMode = false;
    // Generate synthetic past 12h trend
    const station = DEMO_STATIONS.find(s => s.station_id === stationId) || DEMO_STATIONS[0];
    const now = Date.now();
    return Array.from({ length: 8 }, (_, i) => {
      const ts = new Date(now - (8 - i) * 3600000);
      return {
        timestamp: ts.toISOString(),
        station_id: stationId,
        station_name: station.station_name,
        aqi: Math.round(station.aqi * (0.85 + 0.03 * i)),
        pm25: Math.round(station.observed_pollutants.pm25 * (0.85 + 0.03 * i)),
        dominant_pollutant: station.dominant_pollutant
      };
    });
  }
}

export async function fetchAqiPredictions(stationId = "DEL_AV_01") {
  try {
    const res = await fetch(`${API_BASE}/predictions/aqi?station_id=${stationId}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch AQI predictions");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    // Generate scaled predictions based on current live station AQI if available
    const live = await fetchLiveDirectStations();
    const current = live.find(s => s.station_id === stationId);
    const demo = getDemoPredictions(stationId);
    if (current && current.aqi) {
      const scale = current.aqi / demo.current_aqi;
      return {
        ...demo,
        current_aqi: current.aqi,
        forecasts: {
          h6: {
            predicted_aqi: Math.round(demo.forecasts.h6.predicted_aqi * scale),
            pm25: Math.round(demo.forecasts.h6.pm25 * scale),
            pm10: Math.round(demo.forecasts.h6.pm10 * scale),
            no2: Math.round(demo.forecasts.h6.no2 * scale),
            dominant_pollutant: current.dominant_pollutant,
            confidence_interval: {
              lower: Math.round(demo.forecasts.h6.confidence_interval.lower * scale),
              upper: Math.round(demo.forecasts.h6.confidence_interval.upper * scale)
            }
          },
          h12: {
            predicted_aqi: Math.round(demo.forecasts.h12.predicted_aqi * scale),
            pm25: Math.round(demo.forecasts.h12.pm25 * scale),
            pm10: Math.round(demo.forecasts.h12.pm10 * scale),
            no2: Math.round(demo.forecasts.h12.no2 * scale),
            dominant_pollutant: current.dominant_pollutant,
            confidence_interval: {
              lower: Math.round(demo.forecasts.h12.confidence_interval.lower * scale),
              upper: Math.round(demo.forecasts.h12.confidence_interval.upper * scale)
            }
          },
          h24: {
            predicted_aqi: Math.round(demo.forecasts.h24.predicted_aqi * scale),
            pm25: Math.round(demo.forecasts.h24.pm25 * scale),
            pm10: Math.round(demo.forecasts.h24.pm10 * scale),
            no2: Math.round(demo.forecasts.h24.no2 * scale),
            dominant_pollutant: current.dominant_pollutant,
            confidence_interval: {
              lower: Math.round(demo.forecasts.h24.confidence_interval.lower * scale),
              upper: Math.round(demo.forecasts.h24.confidence_interval.upper * scale)
            }
          }
        }
      };
    }
    return demo;
  }
}

export async function fetchPollutantPredictions(stationId = "DEL_AV_01", horizon = 6) {
  try {
    const res = await fetch(`${API_BASE}/predictions/pollutants?station_id=${stationId}&horizon=${horizon}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch pollutant predictions");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    const preds = await fetchAqiPredictions(stationId);
    return preds.forecasts[`h${horizon}`];
  }
}

export async function fetchExplanations(stationId = "DEL_AV_01", pollutant = "pm25") {
  try {
    const res = await fetch(`${API_BASE}/predictions/explanations?station_id=${stationId}&pollutant=${pollutant}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch forecast explanations");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    return getDemoExplanations(stationId, pollutant);
  }
}

export async function fetchAuthorityRecommendations(stationId = "DEL_AV_01") {
  try {
    const res = await fetch(`${API_BASE}/recommendations/authority?station_id=${stationId}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch authority recommendations");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    return getDemoAuthorityRecommendations(stationId);
  }
}

export async function fetchCitizenAdvisory(stationId = "DEL_AV_01", profile = "general") {
  try {
    const res = await fetch(`${API_BASE}/recommendations/citizen?station_id=${stationId}&profile=${profile}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch citizen advisory");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    return getDemoCitizenAdvisory(stationId, profile);
  }
}

export async function fetchAlerts(stationId = null) {
  try {
    const url = stationId 
      ? `${API_BASE}/alerts?station_id=${stationId}`
      : `${API_BASE}/alerts`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch alerts");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    if (stationId) {
      return DEMO_ALERTS.filter(a => a.station_id === stationId);
    }
    return DEMO_ALERTS;
  }
}

export async function fetchModelMetrics() {
  try {
    const res = await fetch(`${API_BASE}/model/metrics`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch model metrics");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    return DEMO_METRICS;
  }
}

export async function fetchFeatureImportance(pollutant = "pm25") {
  try {
    const res = await fetch(`${API_BASE}/model/feature-importance?pollutant=${pollutant}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch feature importances");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    return {
      pollutant: pollutant.toUpperCase(),
      feature_importances: [
        { feature: `${pollutant}_roll_mean_24h`, importance: 0.384 },
        { feature: `${pollutant}_lag1`, importance: 0.215 },
        { feature: "stagnation_index", importance: 0.142 },
        { feature: "wind_speed", importance: 0.089 },
        { feature: "humidity", importance: 0.062 },
        { feature: "temperature", importance: 0.045 },
        { feature: "cos_hour", importance: 0.038 }
      ]
    };
  }
}

export async function fetchAuthorityActions() {
  try {
    const res = await fetch(`${API_BASE}/authority/actions`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch authority actions");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    return DEMO_ACTIONS;
  }
}

export async function saveAuthorityAction(actionData) {
  try {
    const res = await fetch(`${API_BASE}/authority/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actionData),
    });
    if (!res.ok) throw new Error("Failed to save authority action");
    _liveMode = 'backend';
    return res.json();
  } catch (err) {
    return { message: "Saved in local demo mode", action: actionData };
  }
}
