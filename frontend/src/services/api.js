/**
 * AirGuard AI — API Client Service
 * Features automatic fallback to structured CPCB demo simulation data
 * whenever the backend server is offline or initializing.
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

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : "/api";

let _isLiveBackend = null;

export function isBackendLive() {
  return _isLiveBackend === true;
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Health check failed");
    const data = await res.json();
    _isLiveBackend = true;
    return { ...data, is_live: true };
  } catch (err) {
    _isLiveBackend = false;
    return {
      status: "demo_simulation",
      service: "AirGuard AI Decision Support Framework",
      is_live: false,
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
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
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
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
    if (stationId) {
      return DEMO_STATIONS.find(s => s.station_id === stationId) || DEMO_STATIONS[0];
    }
    return DEMO_STATIONS;
  }
}

export async function fetchAirQualityHistory(stationId = "DEL_AV_01", limit = 48) {
  try {
    const res = await fetch(`${API_BASE}/air-quality/history?station_id=${stationId}&limit=${limit}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch air quality history");
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
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
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
    return getDemoPredictions(stationId);
  }
}

export async function fetchPollutantPredictions(stationId = "DEL_AV_01", horizon = 6) {
  try {
    const res = await fetch(`${API_BASE}/predictions/pollutants?station_id=${stationId}&horizon=${horizon}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch pollutant predictions");
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
    const preds = getDemoPredictions(stationId);
    return preds.forecasts[`h${horizon}`];
  }
}

export async function fetchExplanations(stationId = "DEL_AV_01", pollutant = "pm25") {
  try {
    const res = await fetch(`${API_BASE}/predictions/explanations?station_id=${stationId}&pollutant=${pollutant}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch forecast explanations");
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
    return getDemoExplanations(stationId, pollutant);
  }
}

export async function fetchAuthorityRecommendations(stationId = "DEL_AV_01") {
  try {
    const res = await fetch(`${API_BASE}/recommendations/authority?station_id=${stationId}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch authority recommendations");
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
    return getDemoAuthorityRecommendations(stationId);
  }
}

export async function fetchCitizenAdvisory(stationId = "DEL_AV_01", profile = "general") {
  try {
    const res = await fetch(`${API_BASE}/recommendations/citizen?station_id=${stationId}&profile=${profile}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch citizen advisory");
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
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
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
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
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
    return DEMO_METRICS;
  }
}

export async function fetchFeatureImportance(pollutant = "pm25") {
  try {
    const res = await fetch(`${API_BASE}/model/feature-importance?pollutant=${pollutant}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Failed to fetch feature importances");
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
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
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
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
    _isLiveBackend = true;
    return res.json();
  } catch (err) {
    _isLiveBackend = false;
    // Update locally in demo mode
    return { message: "Saved in local demo mode", action: actionData };
  }
}
