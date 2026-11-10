# AirGuard AI: Explainable, Dual-Stakeholder Air Quality Forecasting & Intelligent Decision Support Framework

AirGuard AI is a research-oriented, full-stack web application designed to forecast future air quality, explain the driving atmospheric factors, and generate differentiated, actionable decision support for two distinct stakeholders:
1. **Government Authorities & Pollution Control Departments** (emissions abatement, spatial hotspot policing, traffic demand management, closed-loop action tracking).
2. **Citizens & Vulnerable Populations** (plain-language dominant pollutant breakdown, vulnerability profiling, N95 respirator guidance, activity scheduling).

---

## 🔬 Research Contributions & Methodology

### 1. Shared Forecasting Engine with Dual Recommendation Pipelines
- **Shared Prediction Core:** 18 Random Forest Regressors predicting criteria pollutants ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{SO}_2, \text{CO}, \text{O}_3$) across 6-hour, 12-hour, and 24-hour horizons.
- **Direct Multi-Horizon Strategy:** Regressors are trained directly on target horizons ($t+6, t+12, t+24$) rather than recursive single-step forecasting, eliminating cumulative error compounding and modeling horizon-specific boundary layer dynamics.
- **Chronological Validation:** 80% train / 20% test sequential split preventing temporal data leakage.
- **Independent Decision Pipelines:** The same physical forecast produces regulatory directives for authorities and non-medical health safeguards for citizens.

### 2. Official Indian National Air Quality Index (CPCB) Breakpoint Engine
- Strictly adheres to Central Pollution Control Board (CPCB) methodology (Ministry of Environment, Forest & Climate Change, 2014).
- Sub-indices calculated via piecewise linear interpolation:
  $$I_p = \frac{I_{hi} - I_{lo}}{B_{hi} - B_{lo}} \times (C_p - B_{lo}) + I_{lo}$$
- Composite AQI assigned via maximum sub-index with mandatory CPCB validity constraint ($n \ge 3$ criteria parameters, with at least $\text{PM}_{2.5}$ or $\text{PM}_{10}$).
- Determines the **Dominant Pollutant** and standard color-coded category (Good, Satisfactory, Moderate, Poor, Very Poor, Severe).

### 3. Explainable AI (SHAP TreeExplainer)
- Game-theoretic Shapley attributions explaining why the model predicted a change in air quality.
- Uncovers the role of atmospheric stagnation, temperature inversion, relative humidity (smog formation), diurnal traffic cycles, and autoregressive lag persistence.
- Statistical associations are clearly distinguished from proven causal relationships.

### 4. Continuous Ambient Air Quality Monitoring Network (Delhi NCR)
- 8 official CAAQMS monitoring stations with actual coordinates:
  - **Anand Vihar (DPCC):** Industrial / interstate bus terminus hotspot
  - **Punjabi Bagh (DPCC):** Heavy commercial traffic corridor
  - **ITO (CPCB):** Commercial arterial junction
  - **RK Puram (DPCC):** Residential / arterial hub
  - **Lodhi Road (IMD):** Meteorological reference observatory
  - **IGI Airport T3 (IMD):** Airport transit corridor
  - **Delhi Tech University / DTU (CPCB):** North institutional / industrial fringe
  - **Jahangirpuri (DPCC):** High-density urban / industrial cluster

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend** | React 19, Vite 5, Tailwind CSS, React Router v7, Recharts, Lucide React, Leaflet & OpenStreetMap |
| **Backend** | Python 3.14, FastAPI, Uvicorn, Pydantic v2 |
| **Data & ML** | Pandas 3.0, NumPy 2.5, Scikit-learn 1.9 (Random Forest & Gradient Boosting Regressors), Joblib |
| **Explainability** | SHAP 0.54 (TreeExplainer with summary and local factor attribution) |
| **Database** | SQLite with structured relational schema (turnkey migratable to PostgreSQL) |

---

## 🚀 Quick Start Guide

### Launch Full-Stack Application (Single Port: 8000)

Run the launch script:
```powershell
# From the project root
python start_server.py
```
Or execute `start.bat` / `start.ps1`.

Access the application in your browser:
- **Landing Page:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Authority Portal:** [http://127.0.0.1:8000/authority](http://127.0.0.1:8000/authority)
- **Citizen Portal:** [http://127.0.0.1:8000/citizen](http://127.0.0.1:8000/citizen)
- **ML & Explainability:** [http://127.0.0.1:8000/research/explainability](http://127.0.0.1:8000/research/explainability)
- **About Research:** [http://127.0.0.1:8000/about](http://127.0.0.1:8000/about)
- **Interactive OpenAPI Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 📡 RESTful API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check, model count, and CPCB standard status |
| `/api/locations` | `GET` | Lists all 8 monitoring stations with coordinates and metadata |
| `/api/air-quality/current` | `GET` | Latest observed pollutant readings, weather, and CPCB AQI |
| `/api/air-quality/history` | `GET` | Chronological hourly observations for time-series charts |
| `/api/predictions/aqi` | `GET` | Multi-horizon forecasts (6h, 12h, 24h) for AQI and criteria pollutants |
| `/api/predictions/pollutants`| `GET` | Detailed pollutant concentrations and sub-indices for a horizon |
| `/api/predictions/explanations`| `GET` | Local SHAP factor attributions and narrative explanation |
| `/api/recommendations/authority`| `GET` | Pollutant-specific municipal intervention suggestions |
| `/api/recommendations/citizen`| `GET` | Plain-language health guidance customized by vulnerability profile |
| `/api/alerts` | `GET` | Active forecast threshold and rapid surge warnings |
| `/api/model/metrics` | `GET` | Real MAE, RMSE, R² scores, and RF vs GB benchmark comparison |
| `/api/model/feature-importance`| `GET` | Global Gini feature importance ranking by pollutant |
| `/api/authority/actions` | `GET` | Tracked municipal interventions with before/after AQI |
| `/api/authority/actions` | `POST` | Create or update intervention status, notes, and department |

---

## 📚 Real References & Scientific Literature

1. **Central Pollution Control Board (CPCB)**, Ministry of Environment, Forest and Climate Change, Government of India. (2014). *National Air Quality Index*. Control of Urban Pollution Series (CUPS/82/2014-15), New Delhi.
2. **World Health Organization (WHO)**. (2021). *WHO global air quality guidelines: particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide*. Geneva.
3. **Lundberg, S. M., & Lee, S. I.** (2017). *A unified approach to interpreting model predictions*. Advances in Neural Information Processing Systems (NeurIPS 30), 4765-4774.
4. **Breiman, L.** (2001). *Random forests*. Machine Learning, 45(1), 5-32.
5. **Marcellino, M., Stock, J. H., & Watson, M. W.** (2006). *A comparison of direct and iterated multistep AR methods for forecasting macroeconomic time series*. Journal of Econometrics, 135(1-2), 499-526.
6. **Ministry of Environment, Forest and Climate Change (MoEFCC)**. (2019). *National Clean Air Programme (NCAP)*. Government of India.
