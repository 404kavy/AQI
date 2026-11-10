"""
AirGuard AI — Citizen Health Advisory & Personalized Recommendation Engine
Provides evidence-based, plain-language health guidance tailored to citizen vulnerability profiles
(General Population, Children, Older Adults, People with Respiratory/Cardiac Conditions)
grounded in official CPCB health advisories and WHO Global Air Quality Guidelines.
"""

from typing import Dict, Any, List

VULNERABILITY_PROFILES = [
    {
        "id": "general",
        "name": "General Population",
        "badge": "Active Adults",
        "description": "Healthy adults without pre-existing respiratory or cardiovascular ailments."
    },
    {
        "id": "children",
        "name": "Children & Students",
        "badge": "Developing Lungs",
        "description": "Infants, toddlers, and school-age children with higher ventilation rates per body weight."
    },
    {
        "id": "elderly",
        "name": "Older Adults",
        "badge": "Senior Citizens (60+)",
        "description": "Seniors with decreased physiological reserves and higher baseline cardiovascular vulnerability."
    },
    {
        "id": "respiratory",
        "name": "Asthma & Respiratory Patients",
        "badge": "High Clinical Risk",
        "description": "Individuals diagnosed with asthma, COPD, chronic bronchitis, or coronary heart disease."
    }
]

POLLUTANT_EXPLANATIONS = {
    "PM25": {
        "title": "PM2.5 (Fine Particulate Matter)",
        "plain_explanation": (
            "Tiny microscopic particles (under 2.5 micrometers wide—about 30 times smaller than a human hair). "
            "Because they are so small, they bypass nasal hairs and travel deep into the lung alveoli, "
            "and can enter the bloodstream, causing inflammation throughout the body."
        ),
        "primary_symptoms": ["Dry cough", "Throat irritation", "Chest tightness", "Fatigue", "Watery eyes"],
        "protection_tip": "Standard cloth and surgical masks cannot filter PM2.5. Use a certified, well-fitted N95, KN95, or FFP2 respirator."
    },
    "PM10": {
        "title": "PM10 (Inhalable Coarse Particles)",
        "plain_explanation": (
            "Larger airborne dust particles originating from road dust, construction sites, and vehicle tire wear. "
            "They deposit in the nasal passages, throat, and upper airways, causing coughing, sneezing, and airway irritation."
        ),
        "primary_symptoms": ["Sneezing", "Upper airway irritation", "Eye stinging", "Cough"],
        "protection_tip": "Avoid walking near unpaved roads and active demolition zones. Wash face and eyes after returning from outdoors."
    },
    "NO2": {
        "title": "Nitrogen Dioxide (NO2)",
        "plain_explanation": (
            "A pungent, reddish-brown toxic gas emitted mainly from vehicle exhaust pipes and industrial burning. "
            "It inflames the lining of the lungs, making individuals much more vulnerable to respiratory infections and triggering asthma attacks."
        ),
        "primary_symptoms": ["Wheezing", "Shortness of breath", "Bronchial spasm", "Headache"],
        "protection_tip": "Avoid heavy traffic corridors during morning and evening rush hours. Keep car windows closed and air recirculation on in traffic."
    },
    "SO2": {
        "title": "Sulfur Dioxide (SO2)",
        "plain_explanation": (
            "A colorless, suffocating gas produced by burning sulfur-rich fuels like diesel and coal. "
            "It causes rapid narrowing of airways (bronchoconstriction), especially dangerous for people with asthma."
        ),
        "primary_symptoms": ["Burning sensation in throat", "Sudden reflex coughing", "Difficulty breathing"],
        "protection_tip": "Stay away from industrial boiler zones and diesel generator exhausts during elevated periods."
    },
    "CO": {
        "title": "Carbon Monoxide (CO)",
        "plain_explanation": (
            "An odorless, colorless, invisible gas from incomplete burning of fuels. "
            "It attaches tightly to blood hemoglobin, blocking vital oxygen from reaching the heart and brain."
        ),
        "primary_symptoms": ["Headache", "Dizziness", "Nausea", "Disorientation"],
        "protection_tip": "Never burn charcoal, wood, or use fuel generators indoors or in poorly ventilated enclosed rooms."
    },
    "O3": {
        "title": "Ground-Level Ozone (O3)",
        "plain_explanation": (
            "Unlike the high-altitude protective ozone layer, ground-level ozone is 'bad ozone'—a harsh oxidizing gas "
            "formed when sunlight 'cooks' traffic exhaust on hot, sunny afternoons. It acts like a sunburn inside your lungs."
        ),
        "primary_symptoms": ["Painful deep breaths", "Chest tightness", "Dry airway irritation", "Reduced stamina"],
        "protection_tip": "Ozone peaks between 12 PM and 4 PM. Shift outdoor jogs and sports to early morning before the sun heats the atmosphere."
    }
}

def generate_citizen_advisory(
    profile_id: str,
    aqi: float,
    category: str,
    dominant_pollutant: str,
    forecast_aqi_6h: float,
    forecast_aqi_24h: float,
    pollutants: Dict[str, float]
) -> Dict[str, Any]:
    """
    Produces customized, non-medical citizen health recommendations tailored to user vulnerability profile.
    """
    pol_key = dominant_pollutant.upper().replace(".", "")
    pol_info = POLLUTANT_EXPLANATIONS.get(pol_key, POLLUTANT_EXPLANATIONS["PM25"])
    
    # Activity Level Guidance
    if aqi <= 50:
        outdoor_status = "Safe for All Activities"
        outdoor_class = "safe"
        outdoor_advice = "Air quality is ideal. Great time for outdoor exercise, cycling, and park visits."
        mask_required = False
        mask_text = "No mask needed for general outdoor activities."
        ventilation_advice = "Keep windows open for natural ventilation and fresh air circulation."
        school_sports = "Unrestricted outdoor play and sports activities."
    elif aqi <= 100:
        outdoor_status = "Generally Safe"
        outdoor_class = "safe"
        outdoor_advice = "Air quality is acceptable. Most individuals can perform normal outdoor activities."
        mask_required = False
        mask_text = "Optional for sensitive individuals if feeling throat irritation."
        ventilation_advice = "Good time for room ventilation, preferably during afternoon breeze."
        school_sports = "Normal outdoor sports permitted."
    elif aqi <= 200: # Moderate
        outdoor_status = "Exercise Caution"
        outdoor_class = "caution"
        if profile_id in ["respiratory", "elderly", "children"]:
            outdoor_advice = "Reduce prolonged or heavy outdoor exertion. Take frequent rests during sports."
            mask_required = True
            mask_text = "Wear a well-fitted N95 mask if outdoors near traffic or construction."
            school_sports = "Limit high-intensity outdoor running; replace with moderate indoor physical education."
        else:
            outdoor_advice = "Healthy individuals can continue outdoor workouts, but avoid heavy traffic corridors."
            mask_required = False
            mask_text = "Not mandatory for healthy adults, but recommended during dusty periods."
            school_sports = "Normal outdoor play allowed with regular hydration breaks."
        ventilation_advice = "Ventilate rooms during midday when daytime solar heating disperses ground pollution."
    elif aqi <= 300: # Poor
        outdoor_status = "Limit Outdoor Activity"
        outdoor_class = "warning"
        if profile_id in ["respiratory", "elderly", "children"]:
            outdoor_advice = "Avoid non-essential outdoor activities. Move all workouts and play sessions indoors."
            mask_required = True
            mask_text = "Strictly wear a certified N95 / FFP2 respirator outdoors. Cloth masks offer negligible fine particle filtration."
            school_sports = "Cancel outdoor sports and strenuous assemblies. Keep students in closed classrooms."
        else:
            outdoor_advice = "Cut back strenuous outdoor jogging or cycling. Shift exercise to early afternoon or well-ventilated indoor gyms."
            mask_required = True
            mask_text = "Recommended N95 mask for daily commuters and outdoor workers."
            school_sports = "Shortened outdoor breaks only."
        ventilation_advice = "Keep doors and windows closed during early morning and late evening smog peaks. Use air purifiers if available."
    elif aqi <= 400: # Very Poor
        outdoor_status = "Avoid Outdoor Exertion"
        outdoor_class = "danger"
        outdoor_advice = (
            "Health alert: Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects. "
            "Avoid strenuous outdoor activities. Stay indoors as much as possible."
        )
        mask_required = True
        mask_text = "Mandatory certified N95 respirator if stepping outside. Ensure an airtight seal around nose and chin."
        ventilation_advice = "Keep windows sealed tight. Run HEPA air filtration indoors on medium/high mode. Avoid burning incense or frying foods without kitchen exhaust."
        school_sports = "Prohibit outdoor physical activities and outdoor assemblies completely."
    else: # Severe (401+)
        outdoor_status = "Emergency Health Warning"
        outdoor_class = "emergency"
        outdoor_advice = (
            "Emergency condition: Even healthy people will experience reduced lung capacity and throat burn. "
            "Stay strictly indoors in air-filtered spaces. Avoid any physical exertion outdoors."
        )
        mask_required = True
        mask_text = "Emergency N95/N99 respirator required for any emergency outdoor transit. Ensure zero edge leakage."
        ventilation_advice = "Keep all windows, gaps, and vents sealed. Run HEPA purifiers continuously. Avoid wet mopping with strong chemical fumes."
        school_sports = "School outdoor activities must be suspended; follow state education advisories regarding school closures."

    # Specific profile nuances
    profile_specific_notes = []
    if profile_id == "children":
        profile_specific_notes.append("Children breathe up to 50% more air per pound of body weight than adults, absorbing more toxins.")
        profile_specific_notes.append("Encourage quiet indoor activities, reading, and board games instead of running games.")
        profile_specific_notes.append("Ensure child-sized N95 masks that form an actual seal on smaller facial profiles.")
    elif profile_id == "elderly":
        profile_specific_notes.append("High particulate spikes increase cardiovascular strain and blood pressure. Check resting pulse and blood pressure regularly.")
        profile_specific_notes.append("Reschedule early morning walks to afternoon (2 PM - 4 PM) when atmospheric inversion has lifted.")
    elif profile_id == "respiratory":
        profile_specific_notes.append("Keep quick-relief rescue inhalers (e.g. Salbutamol / Budesonide) readily accessible at all times.")
        profile_specific_notes.append("If you experience wheezing, chest tightening, or persistent shortness of breath, consult your physician promptly.")
        profile_specific_notes.append("Maintain peak flow meter monitoring if advised by your pulmonologist.")
    else:
        profile_specific_notes.append("Stay well hydrated throughout the day; fluids help thin mucus secretions in the upper respiratory tract.")
        profile_specific_notes.append("Avoid smoking, vaping, or burning mosquito coils indoors during poor air days.")

    return {
        "profile_id": profile_id,
        "aqi": round(aqi, 1),
        "category": category,
        "dominant_pollutant": dominant_pollutant,
        "pollutant_details": pol_info,
        "outdoor_status": outdoor_status,
        "outdoor_class": outdoor_class,
        "outdoor_advice": outdoor_advice,
        "mask_required": mask_required,
        "mask_text": mask_text,
        "ventilation_advice": ventilation_advice,
        "school_sports": school_sports,
        "profile_notes": profile_specific_notes,
        "forecast_comparison": {
            "current": round(aqi, 1),
            "next_6h": round(forecast_aqi_6h, 1) if forecast_aqi_6h else None,
            "next_24h": round(forecast_aqi_24h, 1) if forecast_aqi_24h else None,
            "trend": "deteriorating" if (forecast_aqi_6h or 0) > aqi + 15 else ("improving" if (forecast_aqi_6h or 0) < aqi - 15 else "stable")
        },
        "disclaimer": (
            "AirGuard AI provides research-based public health risk mitigation guidelines based on ambient air pollution forecasts. "
            "These precautions do not constitute clinical diagnosis, personalized medical advice, or treatment plans. "
            "Individuals with existing health conditions should always adhere to their personal physician's medical instructions."
        )
    }
