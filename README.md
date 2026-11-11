# AirGuard AI: Explainable, Dual-Stakeholder Air Quality Forecasting & Intelligent Decision Support Framework

AirGuard AI is a research-oriented, full-stack decision-support framework and machine learning application designed to forecast criteria air pollutants, explain atmospheric driving mechanisms, and produce differentiated, actionable interventions for two distinct stakeholders:
1. **Government Authorities & Pollution Control Departments** (automated Graded Response Action Plan (GRAP) alignment, spatial hotspot policing, mechanized dust suppression, closed-loop action tracking).
2. **Citizens & Vulnerable Populations** (plain-language health advisories, dominant pollutant breakdown, vulnerability profiling, N95 respirator guidance, activity scheduling).

---

## 🔑 API Keys & Environment Configuration

AirGuard AI is designed with **zero-configuration resilience**: it works immediately out-of-the-box using the open-access Open-Meteo European Centre for Medium-Range Weather Forecasts (ECMWF) feed without requiring any mandatory API key. For production deployment and official CPCB telemetry, the following API keys can be supplied via environment variables or a `.env` file in `backend/`:

| Provider | Environment Variable | Required? | Description & How to Obtain |
|---|---|---|---|
| **Open-Meteo** | *None (Zero-Key)* | **No** (Default) | Open-access European Reanalysis & CAMS atmospheric chemistry feed providing live $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{SO}_2, \text{CO}, \text{O}_3$, temperature, humidity, and wind vectors for any coordinate. |
| **CPCB / Data.gov.in** | `DATA_GOV_IN_API_KEY` | Optional | Official Indian National Data Sharing & Accessibility Portal (NDSAP) real-time CAAQMS station feed. Register and generate free API key at [data.gov.in](https://data.gov.in/). |
| **WAQI / AQICN** | `WAQI_TOKEN` | Optional | World Air Quality Index Project real-time monitoring feed covering Delhi DPCC and CPCB stations. Obtain free token at [aqicn.org/data-platform/token/](https://aqicn.org/data-platform/token/). |
| **OpenWeatherMap** | `OPENWEATHER_API_KEY` | Optional | Current air pollution and weather API. Obtain free tier key at [openweathermap.org/api](https://openweathermap.org/api). |
| **Kaggle** | `KAGGLE_USERNAME` & `KAGGLE_KEY` | For Training | Used by `src/data/cpcb_kaggle_loader.py` to automatically download official historical CPCB datasets. Obtain from Kaggle Account $\rightarrow$ "Create New API Token" (`kaggle.json`). |

### Setting Up Environment Variables

Create a `.env` file inside `backend/` or set variables in your shell:
```bash
# Windows PowerShell
$env:DATA_GOV_IN_API_KEY="your_cpcb_datagov_key"
$env:WAQI_TOKEN="your_waqi_token"
$env:OPENWEATHER_API_KEY="your_openweather_key"
$env:KAGGLE_USERNAME="your_kaggle_username"
$env:KAGGLE_KEY="your_kaggle_key"
```

---

## 🔄 Real-Time Multi-Provider Ingestion Pipeline

The real-time data pipeline (`backend/src/data/realtime_pipeline.py`) coordinates telemetry across all 8 continuous ambient air quality monitoring stations in Delhi NCR.

### Multi-Provider Fallback Cascade
```
  [Trigger / Scheduled Poller / Startup]
                     │
                     ▼
  ┌───────────────────────────────────────┐
  │ 1. Check Data.gov.in (Official CPCB)  │ ──► Success ──┐
  └──────────────────┬────────────────────┘               │
                     │ (No Key / Unavailable)             │
                     ▼                                    │
  ┌───────────────────────────────────────┐               │
  │ 2. Check WAQI / AQICN Station Feeds   │ ──► Success ──┤
  └──────────────────┬────────────────────┘               │
                     │ (No Key / Unavailable)             │
                     ▼                                    │
  ┌───────────────────────────────────────┐               │
  │ 3. Check OpenWeatherMap Air Pollution │ ──► Success ──┤
  └──────────────────┬────────────────────┘               │
                     │ (No Key / Unavailable)             │
                     ▼                                    │
  ┌───────────────────────────────────────┐               │
  │ 4. Open-Meteo Atmospheric Chemistry   │ ──► Success ──┤
  │    (Zero-Key Open Access Reanalysis)  │               │
  └──────────────────┬────────────────────┘               │
                     │ (Network Offline)                  │
                     ▼                                    │
  ┌───────────────────────────────────────┐               │
  │ 5. Physical Diurnal Baseline Model    │ ──► Fallback ─┤
  └───────────────────────────────────────┘               │
                                                          ▼
                                      ┌─────────────────────────────────────┐
                                      │ CPCB NAQI Breakpoint Calculation    │
                                      │ Compute Sub-Indices & Dominant Pol. │
                                      └──────────────────┬──────────────────┘
                                                         │
                                  ┌──────────────────────┴──────────────────────┐
                                  ▼                                             ▼
                 ┌────────────────────────────────┐            ┌────────────────────────────────┐
                 │ Thread-Safe In-Memory Cache    │            │ SQLite Database (observations) │
                 └────────────────────────────────┘            └────────────────────────────────┘
```

### Covered Parameters & Unit Standardizations
All external parameters are harmonized into official CPCB measurement units:
- $\text{PM}_{2.5}$: Particulate Matter $\le 2.5\,\mu\text{m}$ ($\mu\text{g}/\text{m}^3$)
- $\text{PM}_{10}$: Particulate Matter $\le 10\,\mu\text{m}$ ($\mu\text{g}/\text{m}^3$)
- $\text{NO}_2$: Nitrogen Dioxide ($\mu\text{g}/\text{m}^3$)
- $\text{SO}_2$: Sulfur Dioxide ($\mu\text{g}/\text{m}^3$)
- $\text{CO}$: Carbon Monoxide ($\text{mg}/\text{m}^3$, auto-converted from $\mu\text{g}/\text{m}^3$ when ingesting from Open-Meteo / OpenWeather)
- $\text{O}_3$: Ground-Level Ozone ($\mu\text{g}/\text{m}^3$)
- Meteorological Parameters: Temperature ($^\circ\text{C}$), Relative Humidity ($\%$), Wind Speed ($\text{m}/\text{s}$, auto-converted from $\text{km}/\text{h}$), Wind Direction ($0\text{--}360^\circ$), Rainfall ($\text{mm}$), Surface Pressure ($\text{hPa}$).

### Active Real-Time Endpoints
| Route | Method | Functionality |
|---|---|---|
| `/api/realtime/status` | `GET` | Returns active provider, key availability, last sync time, and station inventory. |
| `/api/realtime/sync` | `POST` | Triggers immediate real-time sync across all 8 stations, caches data, and updates SQLite. |
| `/api/realtime/stations` | `GET` | Returns latest real-time observations and CPCB AQI across all stations. |
| `/api/realtime/station/{station_id}` | `GET` | Detailed live observation and sub-indices for a single station. |

---

## 🧮 Scientific Feature Engineering: Logic, Physics & Mathematics

Every engineered feature in AirGuard AI is grounded in atmospheric fluid dynamics, physical chemistry, boundary layer meteorology, and time-series econometrics:

```
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                            SCIENTIFIC FEATURE TAXONOMY                                 │
  ├────────────────────────────────────────────────────────────────────────────────────────┤
  │                                                                                        │
  │  1. Atmospheric Stagnation & Advective Dispersion Dynamics                             │
  │     • Stagnation Index:             ASI = 1 / (WS + 0.5)                               │
  │     • Zonal Advective Vector:       U_east = -WS · sin(θ · π / 180)                    │
  │     • Meridional Advective Vector:  V_north = -WS · cos(θ · π / 180)                   │
  │                                                                                        │
  │  2. Thermodynamic & Hygrometric Interaction (Aerosol Swelling)                         │
  │     • Tetens Saturation Pressure:   e_s(T) = 0.61078 · exp(17.27·T / (T + 237.3))      │
  │     • Vapor Pressure Deficit (VPD): VPD = e_s(T) · (1 - RH / 100)                      │
  │     • Dew Point Spread (Inversion): ΔT_dew = T - T_dew                                 │
  │                                                                                        │
  │  3. Chemical Kinetics & Source Apportionment                                           │
  │     • Fine-to-Coarse PM Ratio:      R_pm = PM2.5 / (PM10 + ε)                          │
  │     • Photochemical Ozone Proxy:    P_O3 = [NO2] · max(0, sin(π·(h-6)/12)) · (T / 30)  │
  │     • Gaussian Commuter Surge:      f_traffic(h) = 0.3 + 0.7·[exp(-(h-9)²/4.5) + ...] │
  │                                                                                        │
  │  4. Temporal Harmonics & Periodicities                                                 │
  │     • Diurnal Orthogonal Angles:    sin(2π·h / 24), cos(2π·h / 24)                     │
  │     • Seasonal Annual Harmonics:    sin(2π·m / 12), cos(2π·m / 12)                     │
  │                                                                                        │
  │  5. Autoregressive Persistence & Atmospheric Memory                                    │
  │     • Multi-Scale Lags:             t-1, t-2, t-6, t-24                                │
  │     • Shifted Rolling Statistics:   Rolling Mean (6h, 24h), Volatility Std (12h)       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Mathematical Formulations

#### 1. Atmospheric Stagnation Index ($ASI$)
$$ASI = \frac{1}{WS + 0.5} \quad [\text{s}/\text{m}]$$
- **Scientific Logic**: In the planetary boundary layer, the horizontal flux of pollutants is directly governed by advective transport $\vec{u} \cdot \nabla C$. When wind speed $WS \to 0$ (calm night conditions), mechanical turbulence collapses, leading to pollutant accumulation. The $0.5\,\text{m}/\text{s}$ dampening factor prevents numerical singularities while capturing nocturnal stagnation.

#### 2. Orthogonal Wind Decomposition ($U_{\text{east}}, V_{\text{north}}$)
$$U_{\text{east}} = -WS \cdot \sin\left(\frac{\theta \cdot \pi}{180}\right), \quad V_{\text{north}} = -WS \cdot \cos\left(\frac{\theta \cdot \pi}{180}\right)$$
- **Scientific Logic**: Raw wind direction ($0\text{--}360^\circ$) exhibits an artificial circular discontinuity at $0^\circ / 360^\circ$ (North). Orthogonal vector decomposition converts wind into continuous Cartesian velocities. In Delhi NCR, negative $U_{\text{east}}$ and negative $V_{\text{north}}$ represent northwesterly advection, which transports biomass and stubble burning plumes from Punjab and Haryana into the urban basin.

#### 3. Vapor Pressure Deficit ($VPD$) via Tetens Formulation
$$e_s(T) = 0.61078 \exp\left(\frac{17.27 \cdot T}{T + 237.3}\right) \quad [\text{kPa}]$$
$$VPD = e_s(T) \cdot \left(1 - \frac{RH}{100}\right) \quad [\text{kPa}]$$
- **Scientific Logic**: Fine particulate matter ($\text{PM}_{2.5}$) consists largely of hygroscopic ammonium sulfate $((\text{NH}_4)_2\text{SO}_4)$ and ammonium nitrate $(\text{NH}_4\text{NO}_3)$. At low $VPD$ (high relative humidity, $RH > 70\%$), aerosol particles absorb ambient moisture, swell via deliquescence, and catalyze aqueous secondary sulfate and nitrate formation, generating dense winter radiation smog.

#### 4. Dew Point Spread ($\Delta T_{\text{dew}}$)
$$\gamma(T, RH) = \frac{17.27 \cdot T}{T + 237.3} + \ln\left(\frac{RH}{100}\right)$$
$$T_{\text{dew}} = \frac{237.3 \cdot \gamma}{17.27 - \gamma}, \quad \Delta T_{\text{dew}} = T - T_{\text{dew}}$$
- **Scientific Logic**: A narrow dew point depression ($\Delta T_{\text{dew}} < 2.5^\circ\text{C}$) indicates that the near-surface air has reached saturation. This triggers radiation fog and signals intense surface radiative cooling, creating surface thermal inversions ($\partial T / \partial z > 0$) that trap ground emissions below a low mixing lid.

#### 5. Fine-to-Coarse Particulate Ratio ($R_{\text{pm}}$)
$$R_{\text{pm}} = \frac{\text{PM}_{2.5}}{\text{PM}_{10} + \epsilon}$$
- **Scientific Logic**: Provides dynamic emission source apportionment:
  - $R_{\text{pm}} > 0.65$: Dominated by combustion processes (vehicular exhaust, biomass burning, thermal power generation).
  - $R_{\text{pm}} < 0.40$: Dominated by mechanical shearing (resuspended road dust, construction activities, transboundary desert dust storms).

#### 6. Photochemical Ozone Potential Proxy ($P_{\text{O}_3}$)
$$P_{\text{O}_3} = [\text{NO}_2] \cdot \max\left(0, \sin\left(\frac{\pi (h - 6)}{12}\right)\right) \cdot \left(\frac{T}{30}\right)$$
- **Scientific Logic**: Ground-level tropospheric ozone is a secondary photochemical pollutant produced during daylight hours:
  $$\text{NO}_2 + h\nu \;(\lambda < 420\,\text{nm}) \longrightarrow \text{NO} + \text{O}(^3\text{P}), \quad \text{O}(^3\text{P}) + \text{O}_2 + M \longrightarrow \text{O}_3 + M$$
  Peak production requires solar ultraviolet radiation and elevated ambient temperatures, modulated by $\text{NO}_2$ precursor abundance.

#### 7. Bi-Modal Commuter Traffic Surge ($f_{\text{traffic}}$)
$$f_{\text{traffic}}(h) = 0.3 + 0.7 \left[ \exp\left(-\frac{(h - 9)^2}{2 \times 1.5^2}\right) + \exp\left(-\frac{(h - 20)^2}{2 \times 2.0^2}\right) \right]$$
- **Scientific Logic**: Continuous ambient air monitoring in Delhi displays marked bi-modal surges corresponding to morning (08:00–10:30) and evening (18:00–21:30) peak vehicular demand. On weekends, this term is automatically attenuated by $25\%$.

#### 8. Autoregressive Lags & Rolling Volatility
- **Per-Station Lags**: $X_{t-1}, X_{t-2}, X_{t-6}, X_{t-24}$
- **Shifted Rolling Statistics**:
  $$\mu_{6h} = \frac{1}{6}\sum_{i=1}^{6} X_{t-i}, \quad \mu_{24h} = \frac{1}{24}\sum_{i=1}^{24} X_{t-i}, \quad \sigma_{12h} = \sqrt{\frac{1}{12}\sum_{i=1}^{12}(X_{t-i} - \mu_{12h})^2}$$
- **Leakage Prevention**: All rolling windows are strictly computed on $t-1$ and earlier timestamps. Rolling standard deviation ($\sigma_{12h}$) acts as a plume volatility sensor, detecting sudden episodic influxes.

---

## 📊 Training Pipeline with Kaggle CPCB Data

The repository provides a dedicated data ingestion and processing module (`backend/src/data/cpcb_kaggle_loader.py`) for working with official Central Pollution Control Board historical datasets from Kaggle.

### Automated Kaggle Ingestion
```bash
# 1. Place kaggle.json in ~/.kaggle/ OR set environment variables:
export KAGGLE_USERNAME="your_username"
export KAGGLE_KEY="your_api_key"

# 2. Run the loader to download and clean CPCB Delhi data
python backend/src/data/cpcb_kaggle_loader.py
```

### Manual CSV Ingestion
If downloading manually from Kaggle (e.g. `rohanrao/air-quality-data-in-india` or CPCB portals):
1. Place the CSV file into `backend/data/cpcb_delhi_air_quality.csv`.
2. The loader automatically harmonizes column headers (`PM2.5` $\to$ `pm25`, `Temp` $\to$ `temperature`, etc.).
3. Sensor anomalies are cleaned against CPCB physical instrument bounds, and short-duration missing intervals ($\le 3\,\text{hours}$) are linearly interpolated.
4. Run model retraining:
   ```bash
   python -c "import sys; sys.path.insert(0, 'backend'); from src.ml.training_pipeline import train_and_evaluate; train_and_evaluate('backend/data/cpcb_delhi_air_quality.csv')"
   ```

---

## 🏛️ Official Indian National AQI (CPCB Breakpoint Formulation)

CPCB NAQI is calculated via piecewise linear interpolation:
$$I_p = \frac{I_{\text{hi}} - I_{\text{lo}}}{B_{\text{hi}} - B_{\text{lo}}} \times (C_p - B_{\text{lo}}) + I_{\text{lo}}$$

Where $C_p$ is pollutant concentration, $[B_{\text{lo}}, B_{\text{hi}}]$ is the breakpoint bracket, and $[I_{\text{lo}}, I_{\text{hi}}]$ is the corresponding index bracket:

| Category | AQI Range | $\text{PM}_{2.5}$ ($\mu\text{g}/\text{m}^3$) | $\text{PM}_{10}$ ($\mu\text{g}/\text{m}^3$) | $\text{NO}_2$ ($\mu\text{g}/\text{m}^3$) | $\text{SO}_2$ ($\mu\text{g}/\text{m}^3$) | $\text{CO}$ ($\text{mg}/\text{m}^3$) | $\text{O}_3$ ($\mu\text{g}/\text{m}^3$) |
|---|---|---|---|---|---|---|---|
| **Good** | 0 – 50 | 0 – 30 | 0 – 50 | 0 – 40 | 0 – 40 | 0 – 1.0 | 0 – 50 |
| **Satisfactory** | 51 – 100 | 31 – 60 | 51 – 100 | 41 – 80 | 41 – 80 | 1.1 – 2.0 | 51 – 100 |
| **Moderate** | 101 – 200 | 61 – 90 | 101 – 250 | 81 – 180 | 81 – 380 | 2.1 – 10.0 | 101 – 168 |
| **Poor** | 201 – 300 | 91 – 120 | 251 – 350 | 181 – 280 | 381 – 800 | 10.1 – 17.0 | 169 – 208 |
| **Very Poor** | 301 – 400 | 121 – 250 | 351 – 430 | 281 – 400 | 801 – 1600 | 17.1 – 34.0 | 209 – 748 |
| **Severe** | 401 – 500 | 250+ | 430+ | 400+ | 1600+ | 34.0+ | 748+ |

- **CPCB Validity Criterion**: A valid AQI requires observations for at least 3 criteria pollutants, of which one must be either $\text{PM}_{2.5}$ or $\text{PM}_{10}$.
- **Dominant Pollutant**: The parameter yielding the maximum sub-index: $\text{AQI} = \max_p(I_p)$.

---

## 🚀 Quick Start Guide

### Launch Application (Single Port: 8000)
```powershell
python start_server.py
```
Or execute `start.bat` / `start.ps1`.

Access in your browser:
- **Landing Page:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Authority Portal:** [http://127.0.0.1:8000/authority](http://127.0.0.1:8000/authority)
- **Citizen Portal:** [http://127.0.0.1:8000/citizen](http://127.0.0.1:8000/citizen)
- **ML & Explainability:** [http://127.0.0.1:8000/research/explainability](http://127.0.0.1:8000/research/explainability)
- **API Documentation (Interactive OpenAPI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 📡 Complete RESTful API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check, model count, CPCB NAQI standard status, and real-time pipeline telemetry |
| `/api/locations` | `GET` | Lists all 8 monitoring stations with coordinates and metadata |
| `/api/realtime/status` | `GET` | Diagnostics on real-time data providers, active keys, and cache state |
| `/api/realtime/sync` | `POST` | Triggers immediate multi-provider live sync across all stations |
| `/api/realtime/stations` | `GET` | Returns live real-time observation and sub-indices for all stations |
| `/api/realtime/station/{station_id}` | `GET` | Returns live observation and sub-indices for a specific station |
| `/api/air-quality/current` | `GET` | Latest observed pollutant readings, weather, and CPCB AQI (real-time prioritized) |
| `/api/air-quality/history` | `GET` | Chronological hourly observations for time-series charts (DB prioritized) |
| `/api/predictions/aqi` | `GET` | Multi-horizon forecasts (6h, 12h, 24h) for AQI and criteria pollutants |
| `/api/predictions/pollutants`| `GET` | Detailed pollutant concentrations and sub-indices for a horizon |
| `/api/predictions/explanations`| `GET` | Local SHAP factor attributions and narrative explanation |
| `/api/recommendations/authority`| `GET` | Pollutant-specific municipal intervention suggestions aligned with GRAP |
| `/api/recommendations/citizen`| `GET` | Plain-language health guidance customized by vulnerability profile |
| `/api/alerts` | `GET` | Active forecast threshold and rapid surge warnings |
| `/api/model/metrics` | `GET` | Genuine evaluation metrics (MAE, RMSE, $R^2$), and RF vs GB benchmark |
| `/api/model/feature-importance`| `GET` | Global Gini feature importance ranking by pollutant |
| `/api/authority/actions` | `GET` | Tracked municipal interventions with before/after AQI |
| `/api/authority/actions` | `POST` | Create or update intervention status, notes, and department |

---

## 📚 Real Scientific Literature References

1. **Central Pollution Control Board (CPCB)**, Ministry of Environment, Forest and Climate Change, Government of India. (2014). *National Air Quality Index*. Control of Urban Pollution Series (CUPS/82/2014-15), New Delhi.
2. **Lundberg, S. M., & Lee, S. I.** (2017). *A unified approach to interpreting model predictions*. Advances in Neural Information Processing Systems (NeurIPS 30), 4765-4774.
3. **Breiman, L.** (2001). *Random forests*. Machine Learning, 45(1), 5-32.
4. **Marcellino, M., Stock, J. H., & Watson, M. W.** (2006). *A comparison of direct and iterated multistep AR methods for forecasting macroeconomic time series*. Journal of Econometrics, 135(1-2), 499-526.
5. **Tetens, O.** (1930). *Über einige meteorologische Begriffe*. Zeitschrift für Geophysik, 6, 297-309.
6. **Seinfeld, J. H., & Pandis, S. N.** (2016). *Atmospheric chemistry and physics: from air pollution to climate change*. John Wiley & Sons.
7. **Ministry of Environment, Forest and Climate Change (MoEFCC)**. (2019). *National Clean Air Programme (NCAP)*. Government of India.
