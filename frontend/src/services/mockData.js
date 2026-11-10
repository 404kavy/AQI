/**
 * AirGuard AI — Resilient Demo Fallback Data
 * Formulated according to official CPCB Delhi NCR CAAQMS observations and Indian NAQI standards.
 * Used when the backend server is offline or initializing.
 */

export const DEMO_STATIONS = [
  {
    station_id: "DEL_AV_01",
    station_name: "Anand Vihar",
    name: "Anand Vihar",
    agency: "DPCC",
    latitude: 28.6468,
    longitude: 77.3160,
    station_type: "Industrial / Transport Hub",
    aqi: 342,
    category: "Very Poor",
    category_code: "verypoor",
    dominant_pollutant: "PM2.5",
    observed_pollutants: { pm25: 192.4, pm10: 310.2, no2: 68.5, so2: 18.2, co: 2.45, o3: 28.0 },
    sub_indices: { pm25: 342, pm10: 260, no2: 86, so2: 23, co: 122, o3: 28 },
    meteorology: { temperature: 23.4, humidity: 68, wind_speed: 1.4, wind_direction: 295, rainfall: 0.0 }
  },
  {
    station_id: "DEL_PB_02",
    station_name: "Punjabi Bagh",
    name: "Punjabi Bagh",
    agency: "DPCC",
    latitude: 28.6683,
    longitude: 77.1167,
    station_type: "Urban / High Traffic Corridor",
    aqi: 278,
    category: "Poor",
    category_code: "poor",
    dominant_pollutant: "PM10",
    observed_pollutants: { pm25: 114.2, pm10: 285.0, no2: 74.1, so2: 16.0, co: 1.85, o3: 34.0 },
    sub_indices: { pm25: 280, pm10: 278, no2: 93, so2: 20, co: 92, o3: 34 },
    meteorology: { temperature: 24.1, humidity: 62, wind_speed: 1.8, wind_direction: 280, rainfall: 0.0 }
  },
  {
    station_id: "DEL_ITO_03",
    station_name: "ITO",
    name: "ITO",
    agency: "CPCB",
    latitude: 28.6318,
    longitude: 77.2410,
    station_type: "Commercial / Major Junction",
    aqi: 265,
    category: "Poor",
    category_code: "poor",
    dominant_pollutant: "NO2",
    observed_pollutants: { pm25: 105.0, pm10: 220.4, no2: 112.5, so2: 19.4, co: 2.10, o3: 42.0 },
    sub_indices: { pm25: 250, pm10: 180, no2: 265, so2: 24, co: 105, o3: 42 },
    meteorology: { temperature: 25.0, humidity: 59, wind_speed: 2.0, wind_direction: 270, rainfall: 0.0 }
  },
  {
    station_id: "DEL_RKP_04",
    station_name: "RK Puram",
    name: "RK Puram",
    agency: "DPCC",
    latitude: 28.5632,
    longitude: 77.1869,
    station_type: "Residential / Arterial",
    aqi: 215,
    category: "Poor",
    category_code: "poor",
    dominant_pollutant: "PM2.5",
    observed_pollutants: { pm25: 95.8, pm10: 192.0, no2: 52.0, so2: 14.1, co: 1.40, o3: 38.5 },
    sub_indices: { pm25: 215, pm10: 161, no2: 65, so2: 18, co: 70, o3: 38 },
    meteorology: { temperature: 25.2, humidity: 55, wind_speed: 2.3, wind_direction: 285, rainfall: 0.0 }
  },
  {
    station_id: "DEL_LR_05",
    station_name: "Lodhi Road",
    name: "Lodhi Road",
    agency: "IMD",
    latitude: 28.5918,
    longitude: 77.2273,
    station_type: "Urban Forest / IMD Reference",
    aqi: 168,
    category: "Moderate",
    category_code: "moderate",
    dominant_pollutant: "PM2.5",
    observed_pollutants: { pm25: 80.4, pm10: 145.0, no2: 41.2, so2: 11.5, co: 1.10, o3: 45.0 },
    sub_indices: { pm25: 168, pm10: 130, no2: 52, so2: 14, co: 55, o3: 45 },
    meteorology: { temperature: 25.8, humidity: 52, wind_speed: 2.7, wind_direction: 290, rainfall: 0.0 }
  },
  {
    station_id: "DEL_IGI_06",
    station_name: "IGI Airport T3",
    name: "IGI Airport T3",
    agency: "IMD",
    latitude: 28.5629,
    longitude: 77.0814,
    station_type: "Airport / Southwest Suburb",
    aqi: 195,
    category: "Moderate",
    category_code: "moderate",
    dominant_pollutant: "PM10",
    observed_pollutants: { pm25: 88.0, pm10: 190.5, no2: 48.0, so2: 13.0, co: 1.25, o3: 40.0 },
    sub_indices: { pm25: 193, pm10: 195, no2: 60, so2: 16, co: 62, o3: 40 },
    meteorology: { temperature: 26.1, humidity: 48, wind_speed: 3.1, wind_direction: 260, rainfall: 0.0 }
  },
  {
    station_id: "DEL_DTU_07",
    station_name: "Delhi Tech University (DTU)",
    name: "Delhi Tech University (DTU)",
    agency: "CPCB",
    latitude: 28.7501,
    longitude: 77.1177,
    station_type: "Institutional / North Industrial",
    aqi: 285,
    category: "Poor",
    category_code: "poor",
    dominant_pollutant: "PM2.5",
    observed_pollutants: { pm25: 116.5, pm10: 245.0, no2: 58.2, so2: 17.0, co: 1.60, o3: 31.0 },
    sub_indices: { pm25: 285, pm10: 197, no2: 73, so2: 21, co: 80, o3: 31 },
    meteorology: { temperature: 24.3, humidity: 64, wind_speed: 1.9, wind_direction: 300, rainfall: 0.0 }
  },
  {
    station_id: "DEL_JHP_08",
    station_name: "Jahangirpuri",
    name: "Jahangirpuri",
    agency: "DPCC",
    latitude: 28.7328,
    longitude: 77.1706,
    station_type: "Dense Urban / Industrial",
    aqi: 358,
    category: "Very Poor",
    category_code: "verypoor",
    dominant_pollutant: "PM2.5",
    observed_pollutants: { pm25: 205.1, pm10: 340.8, no2: 72.0, so2: 21.0, co: 2.60, o3: 25.0 },
    sub_indices: { pm25: 358, pm10: 290, no2: 90, so2: 26, co: 130, o3: 25 },
    meteorology: { temperature: 23.8, humidity: 70, wind_speed: 1.2, wind_direction: 310, rainfall: 0.0 }
  }
];

export function getDemoPredictions(stationId = "DEL_AV_01") {
  const station = DEMO_STATIONS.find(s => s.station_id === stationId) || DEMO_STATIONS[0];
  const baseAqi = station.aqi;
  const basePm25 = station.observed_pollutants.pm25;

  return {
    station_id: station.station_id,
    station_name: station.station_name,
    current_observation: {
      timestamp: new Date().toISOString(),
      aqi: baseAqi,
      category: station.category,
      dominant_pollutant: station.dominant_pollutant,
      concentrations: station.observed_pollutants
    },
    forecasts: {
      h6: {
        horizon_hours: 6,
        target_timestamp: new Date(Date.now() + 6 * 3600000).toISOString(),
        aqi: Math.min(500, Math.round(baseAqi * 1.08)),
        category: baseAqi * 1.08 > 300 ? "Very Poor" : "Poor",
        category_code: baseAqi * 1.08 > 300 ? "verypoor" : "poor",
        dominant_pollutant: station.dominant_pollutant,
        concentrations: {
          pm25: Math.round(basePm25 * 1.09),
          pm10: Math.round(station.observed_pollutants.pm10 * 1.06),
          no2: Math.round(station.observed_pollutants.no2 * 1.15),
          so2: station.observed_pollutants.so2,
          co: station.observed_pollutants.co,
          o3: station.observed_pollutants.o3
        }
      },
      h12: {
        horizon_hours: 12,
        target_timestamp: new Date(Date.now() + 12 * 3600000).toISOString(),
        aqi: Math.min(500, Math.round(baseAqi * 1.15)),
        category: baseAqi * 1.15 > 300 ? "Very Poor" : (baseAqi * 1.15 > 200 ? "Poor" : "Moderate"),
        category_code: baseAqi * 1.15 > 300 ? "verypoor" : (baseAqi * 1.15 > 200 ? "poor" : "moderate"),
        dominant_pollutant: station.dominant_pollutant,
        concentrations: {
          pm25: Math.round(basePm25 * 1.16),
          pm10: Math.round(station.observed_pollutants.pm10 * 1.12),
          no2: Math.round(station.observed_pollutants.no2 * 1.05),
          so2: station.observed_pollutants.so2,
          co: station.observed_pollutants.co,
          o3: station.observed_pollutants.o3
        }
      },
      h24: {
        horizon_hours: 24,
        target_timestamp: new Date(Date.now() + 24 * 3600000).toISOString(),
        aqi: Math.min(500, Math.round(baseAqi * 0.96)),
        category: station.category,
        category_code: station.category_code,
        dominant_pollutant: station.dominant_pollutant,
        concentrations: {
          pm25: Math.round(basePm25 * 0.95),
          pm10: Math.round(station.observed_pollutants.pm10 * 0.95),
          no2: Math.round(station.observed_pollutants.no2 * 0.92),
          so2: station.observed_pollutants.so2,
          co: station.observed_pollutants.co,
          o3: station.observed_pollutants.o3
        }
      }
    },
    model_architecture: "Direct Horizon Random Forest Regressors (6h, 12h, 24h)",
    prediction_engine: "Shared ML Engine (AirGuard Core)"
  };
}

export function getDemoExplanations(stationId = "DEL_AV_01", pollutant = "pm25") {
  return {
    station_id: stationId,
    target_pollutant: pollutant.toUpperCase(),
    explainability_framework: "SHAP (SHapley Additive exPlanations) TreeExplainer",
    explanation: {
      base_value: 78.4,
      summary: "The forecast is primarily driven upward by 24-Hour Regional Background Persistence and Atmospheric Stagnation (Inversion Trap). Partial horizontal dispersion is provided by Boundary Layer Wind Velocity.",
      factors: [
        {
          feature_name: "pm25_roll_mean_24h",
          display_name: "24-Hour Regional Background Persistence",
          shap_value: 68.42,
          direction: "Pushes AQI Higher",
          impact_magnitude: 68.42,
          current_val: 184.2
        },
        {
          feature_name: "stagnation_index",
          display_name: "Atmospheric Stagnation (Inversion Trap)",
          shap_value: 24.15,
          direction: "Pushes AQI Higher",
          impact_magnitude: 24.15,
          current_val: 0.52
        },
        {
          feature_name: "cos_hour",
          display_name: "Night-time Inversion Window",
          shap_value: 14.80,
          direction: "Pushes AQI Higher",
          impact_magnitude: 14.80,
          current_val: -0.86
        },
        {
          feature_name: "wind_speed",
          display_name: "Wind Speed (Horizontal Dispersion)",
          shap_value: -12.30,
          direction: "Lowers AQI (Dispersive)",
          impact_magnitude: 12.30,
          current_val: 1.4
        },
        {
          feature_name: "humidity",
          display_name: "Relative Humidity (Secondary Aerosol Growth)",
          shap_value: 9.60,
          direction: "Pushes AQI Higher",
          impact_magnitude: 9.60,
          current_val: 68.0
        },
        {
          feature_name: "no2",
          display_name: "Nitrogen Dioxide Precursor Loading",
          shap_value: 6.25,
          direction: "Pushes AQI Higher",
          impact_magnitude: 6.25,
          current_val: 68.5
        }
      ]
    }
  };
}

export function getDemoAuthorityRecommendations(stationId = "DEL_AV_01") {
  const station = DEMO_STATIONS.find(s => s.station_id === stationId) || DEMO_STATIONS[0];

  return {
    station_id: station.station_id,
    station_name: station.station_name,
    current_aqi: station.aqi,
    predicted_aqi_6h: Math.round(station.aqi * 1.08),
    predicted_aqi_24h: Math.round(station.aqi * 0.96),
    dominant_pollutant: station.dominant_pollutant,
    warning_level: station.category,
    total_recommendations: 2,
    recommendations: [
      {
        id: `AUTH-PM25-${station.station_id}-01`,
        pollutant: "PM2.5",
        title: "Industrial Combustion & Open-Burning Night Surveillance Taskforce",
        department: "Delhi Pollution Control Committee (DPCC Enforcement Wing)",
        priority: "Immediate",
        severity: "Critical",
        affected_location: station.station_name,
        action_type: "Combustion & Biomass Surveillance",
        description: `Deploy night inspection patrols across micro-clusters surrounding ${station.station_name}. Inspect fuel compliance at nearby industrial units, stop unauthorized scrap burning, and ensure complete prohibition of unapproved DG sets.`,
        scientific_rationale: `Predicted PM2.5 level (${Math.round(station.observed_pollutants.pm25 * 1.09)} ug/m3) exceeds the 24-hr threshold by over 300%. Calm surface wind conditions (<1.5 m/s) prevent horizontal dispersion.`,
        suggested_actions: [
          "Deploy drone surveillance targeting open solid waste burning",
          "Conduct random stack emission checks on operational industrial boilers",
          "Deploy continuous anti-smog guns along major arterial roads within 3km",
          "Enforce Graded Response Action Plan (GRAP) Stage-IV restrictions"
        ]
      },
      {
        id: `AUTH-PM10-${station.station_id}-02`,
        pollutant: "PM10",
        title: "Mechanized Road Dust Sweeping & Construction Site Audit",
        department: "Municipal Corporation of Delhi (MCD) & PWD",
        priority: "High",
        severity: "High",
        affected_location: station.station_name,
        action_type: "Fugitive Dust Suppression",
        description: `Intensify continuous vacuum sweeping and treated water sprinkling along transit corridors surrounding ${station.station_name}. Inspect active construction and demolition (C&D) sites for mandatory green net shielding.`,
        scientific_rationale: `Forecasted PM10 concentration indicates heavy mechanical resuspension of road silt under dry surface conditions.`,
        suggested_actions: [
          "Mandate continuous misting cannons at registered demolition projects",
          "Prohibit transport of uncovered sand, gravel, and construction debris",
          "Apply chemical dust suppressants on unpaved roadway shoulders"
        ]
      }
    ]
  };
}

export function getDemoCitizenAdvisory(stationId = "DEL_AV_01", profile = "general") {
  const station = DEMO_STATIONS.find(s => s.station_id === stationId) || DEMO_STATIONS[0];
  const aqi = station.aqi;

  return {
    profile_id: profile,
    aqi: aqi,
    category: station.category,
    dominant_pollutant: station.dominant_pollutant,
    pollutant_details: {
      title: "PM2.5 (Fine Particulate Matter)",
      plain_explanation: "Microscopic toxic particles over 30 times finer than human hair. They penetrate past upper airway filters directly into lung alveoli and the bloodstream.",
      primary_symptoms: ["Throat irritation", "Persistent dry cough", "Eye stinging", "Headache", "Fatigue"],
      protection_tip: "Standard cloth masks cannot filter PM2.5. Always wear a certified, airtight N95 / FFP2 respirator when stepping outdoors."
    },
    outdoor_status: aqi > 300 ? "Avoid Outdoor Exertion" : (aqi > 200 ? "Limit Outdoor Activity" : "Exercise Caution"),
    outdoor_class: aqi > 300 ? "danger" : (aqi > 200 ? "warning" : "caution"),
    outdoor_advice: aqi > 300 
      ? "Health Alert: High pollutant accumulation. Avoid all non-essential outdoor exercise and shift physical activity indoors into air-filtered spaces."
      : "Cut back prolonged outdoor workouts. Reschedule jogs to midday when solar heating helps disperse ground-level smog.",
    mask_required: true,
    mask_text: "Mandatory certified N95 or KN95 respirator outdoors. Ensure an airtight nose bridge seal.",
    ventilation_advice: "Keep windows and balconies closed during morning and evening stagnation peaks. Use indoor HEPA purifiers if available.",
    school_sports: aqi > 300 ? "Outdoor school sports and assemblies should be suspended." : "Limit high-intensity cardio sports outdoors.",
    profile_notes: profile === "children" 
      ? ["Children breathe faster and absorb higher pollutant volume relative to body mass.", "Ensure child-sized N95 masks that form an actual seal.", "Encourage quiet indoor board games rather than outdoor running."]
      : (profile === "respiratory" 
        ? ["Keep rescue inhalers (Salbutamol / Budesonide) immediately accessible.", "Monitor resting peak flow if advised by your pulmonologist.", "Seek emergency medical care if experiencing wheezing or severe breathlessness."]
        : ["Stay well hydrated with warm fluids to support respiratory mucosal clearance.", "Avoid lighting incense or candles in enclosed indoor rooms."]),
    forecast_comparison: {
      current: aqi,
      next_6h: Math.round(aqi * 1.08),
      next_24h: Math.round(aqi * 0.96),
      trend: "deteriorating"
    },
    disclaimer: "AirGuard AI provides evidence-based public health precautions based on air quality forecasts. These guidelines do not substitute for individual clinical diagnosis or physician treatment plans."
  };
}

export const DEMO_ALERTS = [
  {
    id: "ALT-01",
    station_id: "DEL_AV_01",
    station_name: "Anand Vihar",
    alert_type: "Severe Forecast Warning",
    severity: "Critical",
    pollutant: "PM2.5",
    message: "Forecasted PM2.5 expected to breach 240 ug/m3 in next 12 hours due to calm surface winds (<1.2 m/s).",
    forecast_horizon: 12,
    predicted_value: 248.0,
    threshold_value: 120.0
  },
  {
    id: "ALT-02",
    station_id: "DEL_PB_02",
    station_name: "Punjabi Bagh",
    alert_type: "Rapid Surge Alert",
    severity: "High",
    pollutant: "NO2",
    message: "Evening commute congestion projected to produce high NO2 surge exceeding 125 ug/m3.",
    forecast_horizon: 6,
    predicted_value: 128.0,
    threshold_value: 80.0
  },
  {
    id: "ALT-03",
    station_id: "DEL_JHP_08",
    station_name: "Jahangirpuri",
    alert_type: "High Risk Location",
    severity: "Elevated",
    pollutant: "PM10",
    message: "Persistent dry winds and loose soil conditions forecast to elevate PM10 above 360 ug/m3.",
    forecast_horizon: 24,
    predicted_value: 375.0,
    threshold_value: 250.0
  }
];

export const DEMO_ACTIONS = [
  {
    id: "ACT-2026-DEL-01",
    station_id: "DEL_AV_01",
    station_name: "Anand Vihar",
    pollutant: "PM10",
    action_title: "Mechanized Anti-Smog Gun & Water Sprinkling Operation",
    action_type: "Fugitive Dust Suppression",
    department: "Municipal Corporation (MCD) & PWD",
    priority: "High",
    severity: "Critical",
    status: "Completed",
    action_notes: "Continuous misting deployed along Gazipur border and ISBT terminal over 48 hours.",
    action_date: new Date(Date.now() - 48 * 3600000).toISOString(),
    completed_date: new Date(Date.now() - 24 * 3600000).toISOString(),
    pre_intervention_aqi: 385.0,
    post_intervention_aqi: 310.0,
    evaluation_notes: "Observed 19.5% reduction in localized PM10 sub-index within 1.5km sensor radius post-operation."
  },
  {
    id: "ACT-2026-DEL-02",
    station_id: "DEL_PB_02",
    station_name: "Punjabi Bagh",
    pollutant: "NO2",
    action_title: "Ring Road Commercial Freight Diversion & Signal Synchronization",
    action_type: "Traffic Demand Management",
    department: "Delhi Traffic Police",
    priority: "High",
    severity: "Elevated",
    status: "In Progress",
    action_notes: "Diverted non-destined medium and heavy freight vehicles via Western Peripheral Expressway.",
    action_date: new Date(Date.now() - 14 * 3600000).toISOString(),
    pre_intervention_aqi: 142.0,
    evaluation_notes: "Intervention active. Evaluating evening rush-hour NO2 attenuation."
  },
  {
    id: "ACT-2026-DEL-03",
    station_id: "DEL_JHP_08",
    station_name: "Jahangirpuri",
    pollutant: "PM2.5",
    action_title: "Night Patrol Inspection for Open Solid Waste Burning",
    action_type: "Combustion Surveillance",
    department: "DPCC Enforcement Wing",
    priority: "Immediate",
    severity: "Critical",
    status: "Pending",
    action_notes: "Night team assigned to inspect Badli and Jahangirpuri scrap sorting clusters.",
    action_date: new Date(Date.now() - 3 * 3600000).toISOString(),
    pre_intervention_aqi: 295.0,
    evaluation_notes: "Action dispatched to local sub-divisional magistrate (SDM) team."
  }
];

export const DEMO_METRICS = {
  training_timestamp: new Date().toISOString(),
  horizons: [6, 12, 24],
  pollutants: ["pm25", "pm10", "no2", "so2", "co", "o3"],
  evaluation_metrics: {
    pm25: {
      h6: { mae: 6.31, rmse: 8.65, r2: 0.944 },
      h12: { mae: 6.74, rmse: 9.57, r2: 0.931 },
      h24: { mae: 7.33, rmse: 10.59, r2: 0.916 }
    },
    pm10: {
      h6: { mae: 10.62, rmse: 13.56, r2: 0.953 },
      h12: { mae: 12.82, rmse: 17.19, r2: 0.925 },
      h24: { mae: 14.10, rmse: 19.43, r2: 0.905 }
    },
    no2: {
      h6: { mae: 4.37, rmse: 5.52, r2: 0.579 },
      h12: { mae: 4.59, rmse: 5.80, r2: 0.535 },
      h24: { mae: 4.71, rmse: 6.00, r2: 0.503 }
    },
    so2: {
      h6: { mae: 1.54, rmse: 1.98, r2: 0.298 },
      h12: { mae: 1.63, rmse: 2.09, r2: 0.226 },
      h24: { mae: 1.64, rmse: 2.08, r2: 0.231 }
    },
    co: {
      h6: { mae: 0.13, rmse: 0.17, r2: 0.912 },
      h12: { mae: 0.14, rmse: 0.19, r2: 0.894 },
      h24: { mae: 0.15, rmse: 0.20, r2: 0.882 }
    },
    o3: {
      h6: { mae: 3.06, rmse: 3.82, r2: 0.964 },
      h12: { mae: 3.10, rmse: 3.89, r2: 0.963 },
      h24: { mae: 3.20, rmse: 4.04, r2: 0.960 }
    }
  },
  model_comparison: {
    pm25_h6: {
      random_forest: { mae: 6.31, rmse: 8.65, r2: 0.944 },
      gradient_boosting: { mae: 6.03, rmse: 8.17, r2: 0.950 }
    },
    pm10_h6: {
      random_forest: { mae: 10.62, rmse: 13.56, r2: 0.953 },
      gradient_boosting: { mae: 10.21, rmse: 12.96, r2: 0.958 }
    },
    no2_h6: {
      random_forest: { mae: 4.37, rmse: 5.52, r2: 0.579 },
      gradient_boosting: { mae: 4.22, rmse: 5.32, r2: 0.609 }
    }
  },
  shap_summary: {
    pm25_h6: {
      expected_value: 78.4,
      top_factors: [
        { factor: "24-Hour Regional Background Persistence", mean_shap_value: 68.42 },
        { factor: "Atmospheric Stagnation (Inversion Trap)", mean_shap_value: 24.15 },
        { factor: "Night-time Inversion Window", mean_shap_value: 14.80 },
        { factor: "Wind Speed (Horizontal Dispersion)", mean_shap_value: 12.30 },
        { factor: "Relative Humidity (Secondary Smog)", mean_shap_value: 9.60 },
        { factor: "NO2 Traffic Precursor Loading", mean_shap_value: 6.25 }
      ]
    }
  }
};
