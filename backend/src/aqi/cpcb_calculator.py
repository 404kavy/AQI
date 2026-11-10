"""
AirGuard AI — CPCB Indian National Air Quality Index (NAQI) Calculator
Formulated according to the official Central Pollution Control Board (CPCB) methodology:
"National Air Quality Index" report by CPCB, Ministry of Environment, Forest & Climate Change.

Breakpoint ranges (Cp in ug/m3, except CO in mg/m3):
Category        AQI Range   PM2.5    PM10     NO2      SO2       CO(mg/m3) O3
Good            0 - 50      0-30     0-50     0-40     0-40      0-1.0     0-50
Satisfactory    51 - 100    31-60    51-100   41-80    41-80     1.1-2.0   51-100
Moderate        101 - 200   61-90    101-250  81-180   81-380    2.1-10.0  101-168
Poor            201 - 300   91-120   251-350  181-280  381-800   10.1-17.0 169-208
Very Poor       301 - 400   121-250  351-430  281-400  801-1600  17.1-34.0 209-748
Severe          401 - 500   250+     430+     400+     1600+     34.0+     748+
"""

from typing import Dict, Any, Tuple, Optional

BREAKPOINTS = {
    "pm25": [
        (0.0, 30.0, 0, 50),
        (30.1, 60.0, 51, 100),
        (60.1, 90.0, 101, 200),
        (90.1, 120.0, 201, 300),
        (120.1, 250.0, 301, 400),
        (250.1, 500.0, 401, 500),
    ],
    "pm10": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 250.0, 101, 200),
        (250.1, 350.0, 201, 300),
        (350.1, 430.0, 301, 400),
        (430.1, 600.0, 401, 500),
    ],
    "no2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 180.0, 101, 200),
        (180.1, 280.0, 201, 300),
        (280.1, 400.0, 301, 400),
        (400.1, 600.0, 401, 500),
    ],
    "so2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 380.0, 101, 200),
        (380.1, 800.0, 201, 300),
        (800.1, 1600.0, 301, 400),
        (1600.1, 2400.0, 401, 500),
    ],
    "co": [
        (0.0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 50.0, 401, 500),
    ],
    "o3": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 168.0, 101, 200),
        (168.1, 208.0, 201, 300),
        (208.1, 748.0, 301, 400),
        (748.1, 1000.0, 401, 500),
    ],
}

CATEGORIES = [
    {"name": "Good", "min": 0, "max": 50, "color": "#16a34a", "code": "good",
     "impact": "Minimal impact. Clean air posing little or no risk."},
    {"name": "Satisfactory", "min": 51, "max": 100, "color": "#65a30d", "code": "satisfactory",
     "impact": "Minor breathing discomfort to sensitive people."},
    {"name": "Moderate", "min": 101, "max": 200, "color": "#d97706", "code": "moderate",
     "impact": "Breathing discomfort to people with lung disease such as asthma, and discomfort to children and older adults."},
    {"name": "Poor", "min": 201, "max": 300, "color": "#ea580c", "code": "poor",
     "impact": "Breathing discomfort to most people on prolonged exposure. Significant risk for sensitive groups."},
    {"name": "Very Poor", "min": 301, "max": 400, "color": "#dc2626", "code": "verypoor",
     "impact": "Respiratory illness on prolonged exposure. Pronounced effects on people with lung and heart diseases."},
    {"name": "Severe", "min": 401, "max": 500, "color": "#7f1d1d", "code": "severe",
     "impact": "Affects healthy people and seriously impacts those with existing respiratory or cardiovascular illnesses."},
]

def calculate_sub_index(pollutant: str, concentration: float) -> Optional[float]:
    """
    Calculates sub-index Ip for a given pollutant using CPCB piecewise linear formula:
    Ip = [(I_hi - I_lo) / (B_hi - B_lo)] * (Cp - B_lo) + I_lo
    """
    key = pollutant.lower().replace(".", "")
    if key not in BREAKPOINTS or concentration is None or concentration < 0:
        return None

    ranges = BREAKPOINTS[key]
    
    # Check below lowest
    if concentration <= ranges[0][0]:
        return float(ranges[0][2])
    
    # Check within ranges
    for b_lo, b_hi, i_lo, i_hi in ranges:
        if b_lo <= concentration <= b_hi:
            sub = ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo) + i_lo
            return round(sub, 1)

    # Beyond severe upper breakpoint - extrapolate capped at 500
    last_b_lo, last_b_hi, last_i_lo, last_i_hi = ranges[-1]
    sub = ((last_i_hi - last_i_lo) / (last_b_hi - last_b_lo)) * (concentration - last_b_lo) + last_i_lo
    return min(500.0, round(sub, 1))

def get_category_info(aqi_value: float) -> Dict[str, Any]:
    """Returns official CPCB category meta for a given AQI."""
    if aqi_value is None:
        return {"name": "Unknown", "code": "unknown", "color": "#94a3b8", "impact": "No data available."}
    
    clamped = max(0.0, min(500.0, float(aqi_value)))
    for cat in CATEGORIES:
        if cat["min"] <= clamped <= cat["max"]:
            return {
                "name": cat["name"],
                "code": cat["code"],
                "color": cat["color"],
                "impact": cat["impact"],
                "aqi": round(clamped, 1)
            }
    return CATEGORIES[-1]

def calculate_composite_aqi(concentrations: Dict[str, float]) -> Dict[str, Any]:
    """
    Computes Indian National AQI from pollutant concentrations dict.
    CPCB Rule:
    1. Sub-index calculated for all valid pollutants.
    2. AQI = max(sub_indices).
    3. Mandatory condition: At least 3 pollutants present, with at least one particulate (PM2.5 or PM10).
    """
    sub_indices = {}
    for pol, val in concentrations.items():
        if val is not None:
            sub = calculate_sub_index(pol, float(val))
            if sub is not None:
                sub_indices[pol.lower().replace(".", "")] = sub

    if not sub_indices:
        return {
            "aqi": None,
            "category": "Insufficient Data",
            "dominant_pollutant": None,
            "sub_indices": {},
            "valid_cpcb": False
        }

    # Identify dominant pollutant (highest sub-index)
    dominant_pollutant = max(sub_indices.items(), key=lambda x: x[1])[0]
    aqi_value = sub_indices[dominant_pollutant]

    # CPCB Validity check
    has_particulate = ("pm25" in sub_indices) or ("pm10" in sub_indices)
    is_valid_cpcb = (len(sub_indices) >= 3) and has_particulate

    category_info = get_category_info(aqi_value)

    return {
        "aqi": round(aqi_value, 1),
        "category": category_info["name"],
        "category_code": category_info["code"],
        "color": category_info["color"],
        "health_impact": category_info["impact"],
        "dominant_pollutant": dominant_pollutant.upper(),
        "sub_indices": sub_indices,
        "valid_cpcb": is_valid_cpcb,
        "pollutant_count": len(sub_indices)
    }
