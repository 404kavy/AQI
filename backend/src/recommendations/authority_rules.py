"""
AirGuard AI — Authority Intervention Recommendation Engine
Generates scientifically grounded, rule-based operational intervention suggestions
for pollution control boards and municipal authorities based on multi-pollutant forecasts,
AQI category, diurnal trends, and monitoring station context.
"""

from typing import List, Dict, Any

def generate_authority_recommendations(
    station_id: str,
    station_name: str,
    station_type: str,
    current_aqi: float,
    predicted_aqi_6h: float,
    predicted_aqi_24h: float,
    predicted_pollutants: Dict[str, float],
    dominant_pollutant: str,
    trend: str = "increasing"
) -> List[Dict[str, Any]]:
    """
    Evaluates forecasted concentrations and operational thresholds to suggest targeted municipal interventions.
    Recommendations are presented as evidence-backed investigations, not automatic government orders.
    """
    recommendations = []
    
    pm25 = predicted_pollutants.get("pm25", 0.0)
    pm10 = predicted_pollutants.get("pm10", 0.0)
    no2 = predicted_pollutants.get("no2", 0.0)
    so2 = predicted_pollutants.get("so2", 0.0)
    co = predicted_pollutants.get("co", 0.0)
    o3 = predicted_pollutants.get("o3", 0.0)
    
    max_aqi = max(predicted_aqi_6h or 0, predicted_aqi_24h or 0, current_aqi or 0)
    
    # ── 1. PM2.5 Combustion & Regional Smog Interventions ───────────────────────────
    if pm25 > 120.0 or (dominant_pollutant == "PM25" and max_aqi > 250):
        priority = "Immediate" if pm25 > 250.0 else "High"
        severity = "Critical" if pm25 > 250.0 else "Elevated"
        recommendations.append({
            "id": f"AUTH-PM25-{station_id}-01",
            "pollutant": "PM2.5",
            "title": "Industrial Combustion & Open-Burning Inspection Taskforce",
            "department": "State Pollution Control Board (DPCC / CPCB Enforcement)",
            "priority": priority,
            "severity": severity,
            "affected_location": station_name,
            "action_type": "Combustion & Biomass Surveillance",
            "description": (
                f"Deploy night-patrol inspection teams across identified micro-clusters in {station_name}. "
                "Inspect small-scale industrial fuel compliance, unauthorized biomass or municipal waste burning, "
                "and ensure diesel generator sets (DG sets) are strictly non-operational during peak stagnation."
            ),
            "scientific_rationale": (
                f"Predicted PM2.5 level of {pm25:.1f} ug/m3 significantly exceeds the CPCB 24-hr threshold (60 ug/m3). "
                "Fine particulate spikes under low boundary layer heights indicate local primary combustion emissions "
                "and secondary aerosol formation under temperature inversion."
            ),
            "suggested_actions": [
                "Night-time drone or ground patrol for open municipal solid waste burning",
                "Verify approved fuel compliance (PNG/bio-mass pellets) in nearby industrial clusters",
                "Deploy anti-smog guns along major arterial roads within a 3km radius",
                "Implement Graded Response Action Plan (GRAP) Stage-III/IV restrictions if regional threshold crossed"
            ]
        })
        
    # ── 2. PM10 Road Dust & Construction Enforcement ─────────────────────────────
    if pm10 > 250.0 or (dominant_pollutant == "PM10" and max_aqi > 200):
        priority = "High" if pm10 > 350.0 else "Medium"
        severity = "High" if pm10 > 350.0 else "Moderate"
        recommendations.append({
            "id": f"AUTH-PM10-{station_id}-02",
            "pollutant": "PM10",
            "title": "Mechanized Road Dust Sweeping & Construction Site Dust Audit",
            "department": "Municipal Corporation (MCD) & Public Works Department (PWD)",
            "priority": priority,
            "severity": severity,
            "affected_location": station_name,
            "action_type": "Fugitive Dust Suppression",
            "description": (
                f"Intensify continuous mechanical sweeping and treated-water sprinkling on major unpaved shoulders "
                f"surrounding {station_name}. Conduct unannounced compliance audits on active construction and demolition (C&D) sites."
            ),
            "scientific_rationale": (
                f"Forecasted PM10 concentration of {pm10:.1f} ug/m3 indicates severe mechanical resuspension of road dust "
                "and unmitigated earth-moving operations. High coarse-to-fine ratio points to non-combustion fugitive sources."
            ),
            "suggested_actions": [
                "Mandate 100% green net barrier wrapping and water misting guns at active C&D sites",
                "Prohibit uncovered transport of sand, gravel, and construction debris",
                "Increase frequency of mechanized vacuum sweepers on heavy transit corridors",
                "Apply chemical dust suppressants on unpaved roadway shoulders"
            ]
        })

    # ── 3. NO2 Vehicular Traffic Flow & Corridor Diversion ─────────────────────────
    if no2 > 80.0 or (dominant_pollutant == "NO2" and max_aqi > 150):
        priority = "High" if no2 > 180.0 else "Medium"
        severity = "Elevated" if no2 > 180.0 else "Moderate"
        recommendations.append({
            "id": f"AUTH-NO2-{station_id}-03",
            "pollutant": "NO2",
            "title": "Traffic Flow Optimization & Commercial Freight Restriction Advisory",
            "department": "Traffic Police & Transport Department",
            "priority": priority,
            "severity": severity,
            "affected_location": station_name,
            "action_type": "Traffic Demand Management",
            "description": (
                f"Manage peak congestion chokepoints along arterial corridors connecting {station_name}. "
                "Enforce strict non-entry for non-destined commercial heavy vehicles and synchronize traffic signals "
                "to minimize vehicular idling during morning (8-10 AM) and evening (6-9 PM) rush hours."
            ),
            "scientific_rationale": (
                f"Elevated NO2 forecast of {no2:.1f} ug/m3 is strongly associated with high-temperature internal combustion "
                "engines (diesel freight trucks and stop-and-go commuter traffic). NO2 acts as an acute respiratory irritant "
                "and a primary chemical precursor for daytime ozone and secondary nitrates."
            ),
            "suggested_actions": [
                "Deploy dynamic signal cycle adjustments to clear bottleneck intersections",
                "Reroute non-destined interstate freight trucks via Eastern/Western Peripheral Expressways",
                "Strict roadside tailpipe emission (PUC) audits targeting commercial diesel light/heavy vehicles",
                "Promote public transit feeder connectivity around major metro transit hubs"
            ]
        })

    # ── 4. SO2 Point-Source & Industrial Stack Emissions ──────────────────────────
    if so2 > 50.0:
        recommendations.append({
            "id": f"AUTH-SO2-{station_id}-04",
            "pollutant": "SO2",
            "title": "Industrial Boiler & Sulfur Fuel Compliance Inspection",
            "department": "Pollution Control Committee Industrial Cell",
            "priority": "Medium",
            "severity": "Moderate",
            "affected_location": station_name,
            "action_type": "Point Source Industrial Emission Audit",
            "description": (
                f"Inspect Continuous Emission Monitoring Systems (CEMS) across manufacturing and industrial boilers "
                f"operating within the airshed of {station_name}. Audit fuel receipts to ensure zero unapproved high-sulfur petcoke or furnace oil."
            ),
            "scientific_rationale": (
                f"Forecasted SO2 concentration of {so2:.1f} ug/m3. Sulfur dioxide emissions in urban centers are almost exclusively "
                "derived from high-sulfur liquid/solid fuel combustion and captive power boilers."
            ),
            "suggested_actions": [
                "Audit fuel consumption records of registered industrial units",
                "Inspect Flue Gas Desulfurization (FGD) scrubbers on operational stacks",
                "Conduct spot sampling of liquid fuels used in commercial generators"
            ]
        })

    # ── 5. CO Stagnant Incomplete Combustion ──────────────────────────────────────
    if co > 4.0:
        recommendations.append({
            "id": f"AUTH-CO-{station_id}-05",
            "pollutant": "CO",
            "title": "Incomplete Combustion Hotspot Verification & Roadside Venting",
            "department": "Fire Services & Municipal Health Inspection",
            "priority": "High" if co > 10.0 else "Medium",
            "severity": "High" if co > 10.0 else "Moderate",
            "affected_location": station_name,
            "action_type": "Combustion Safety & Idling Prevention",
            "description": (
                f"Investigate localized sources of incomplete combustion near {station_name}, including unventilated roadside eatery stoves, "
                "waste burning pits, and congested bus terminal idling bays."
            ),
            "scientific_rationale": (
                f"Elevated CO forecast of {co:.2f} mg/m3 points to oxygen-starved incomplete burning of carbon fuels under calm wind conditions."
            ),
            "suggested_actions": [
                "Enforce anti-idling regulations at bus terminals and railway drop-off zones",
                "Inspect commercial eateries for proper flue gas chimneys and LPG compliance",
                "Ensure continuous surveillance against unauthorized garbage smoldering"
            ]
        })

    # ── 6. O3 Ground-Level Photochemical Precursor Alert ──────────────────────────
    if o3 > 90.0:
        recommendations.append({
            "id": f"AUTH-O3-{station_id}-06",
            "pollutant": "Ozone (O3)",
            "title": "Volatile Organic Precursor (VOC) & Evaporative Loss Containment",
            "department": "Department of Environment & Oil Marketing Companies",
            "priority": "Medium",
            "severity": "Elevated",
            "affected_location": station_name,
            "action_type": "Photochemical Precursor Mitigation",
            "description": (
                f"Ground-level ozone is not directly emitted but formed photochemically. Enforce vapor recovery systems (Stage-II VRS) "
                f"at retail fuel outlets in {station_name}. Advisory to reschedule solvent-based industrial painting during peak afternoon heat."
            ),
            "scientific_rationale": (
                f"Forecasted daytime ozone of {o3:.1f} ug/m3 driven by intense solar radiation and reactions between precursor NOx and VOCs. "
                "Controlling daytime precursor emissions prevents severe afternoon photochemical smog."
            ),
            "suggested_actions": [
                "Audit Vapor Recovery Systems (VRS) at petrol pumps and fuel dispensing stations",
                "Advise industrial coatings and dry-cleaning units to restrict volatile solvent releases during 11 AM - 4 PM",
                "Monitor regional nitrogen oxides (NOx) background levels to prevent titration imbalances"
            ]
        })
        
    # Baseline if air is good/satisfactory
    if not recommendations:
        recommendations.append({
            "id": f"AUTH-BASE-{station_id}-00",
            "pollutant": "Composite AQI",
            "title": "Routine Ambient Air Quality Monitoring & Green Buffer Maintenance",
            "department": "Pollution Control Board & Urban Forestry",
            "priority": "Routine",
            "severity": "Normal",
            "affected_location": station_name,
            "action_type": "Standard Preventive Maintenance",
            "description": (
                f"Air quality in {station_name} is within acceptable regulatory benchmarks. "
                "Maintain standard sensor calibration routines, road shoulder vegetation, and routine municipal cleanliness."
            ),
            "scientific_rationale": (
                f"Predicted AQI ({predicted_aqi_6h:.1f}) and criteria pollutant levels meet the National Ambient Air Quality Standards (NAAQS)."
            ),
            "suggested_actions": [
                "Perform scheduled zero-span calibration on continuous ambient air monitoring equipment (CAAQMS)",
                "Continue standard vegetative green buffer care along highway medians"
            ]
        })
        
    return recommendations
