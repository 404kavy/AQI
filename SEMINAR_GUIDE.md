# AirGuard AI — Seminar Presentation & Viva Defense Guide

This guide is designed for your academic seminar presentation, project demonstration, and viva defense. It includes an **elevator pitch**, a **3-minute live demonstration script**, and **top viva defense questions with scientific answers**.

---

## 🎯 1. Two-Minute Seminar Elevator Pitch

> *"Good morning respected evaluators and professors. Today we present **AirGuard AI** — an Explainable, Dual-Stakeholder Air Quality Forecasting and Intelligent Decision Support System.*
>
> *Existing air quality dashboards are passive and one-size-fits-all: they report past sensor values or output abstract black-box index numbers. AirGuard AI introduces three major scientific innovations:*
> 1. *A **Shared Predictive ML Core** powered by 18 Direct Multi-Horizon Random Forest Regressors, trained on **230,307 authentic CPCB hourly observations** across Delhi NCR, forecasting criteria pollutants at 6-hour, 12-hour, and 24-hour intervals.*
> 2. *An official **Indian National AQI (CPCB) Breakpoint Engine** that computes sub-indices, identifies dominant pollutants, and enforces statutory data validity constraints.*
> 3. *A **Dual-Stakeholder Branching Framework** that translates identical physical predictions into two independent pipelines: statutory Graded Response Action Plan (GRAP) interventions for **government authorities** with closed-loop outcome evaluation, and vulnerability-specific advisories for **citizens and sensitive populations**.*
> 4. *A **Real-Time Ingestion Cascade** that polls live CAAQMS telemetry with zero configuration and explains predictions using **SHAP (SHapley Additive exPlanations)**."*

---

## 🖥️ 2. Step-by-Step Live Demo Script (3-Minute Walkthrough)

### Step 1: System Health & Overview (30 Seconds)
1. Run `python start_server.py` and open `http://127.0.0.1:8000`.
2. Point to the green pulsing badge in the top navbar: **`LIVE CAAQMS`**.
   - *Key Talking Point:* "The system maintains an asynchronous real-time polling pipeline connected to continuous monitoring stations, with automatic failover."
3. Highlight the headline metrics: 8 CAAQMS monitoring stations in Delhi, 18 multi-horizon models, and compliance with MoEFCC 2014 standards.

### Step 2: Authority Decision-Support Portal (60 Seconds)
1. Click **Authority Portal** in the navigation bar (`/authority`).
2. Show the **Geospatial Leaflet Map**: click on **Anand Vihar (DEL_AV_01)** or **Jahangirpuri**.
   - *Key Talking Point:* "Notice the spatial hotspot classification. Anand Vihar is an interstate transport hub with high particulate loading."
3. Show the **Multi-Horizon Forecast Tabs (6h, 12h, 24h)**: show how $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$ and composite AQI evolve over time.
4. Scroll to **GRAP-Aligned Decision Support Recommendations**:
   - Point out how interventions are dynamically categorized by department (Municipal Corporation MCD, Traffic Police, DPCC Enforcement) and priority (Immediate, High).
5. Demonstrate **Closed-Loop Action Tracking**:
   - Click "Log New Intervention" or click on an existing action (e.g. *Anti-Smog Gun Operation*).
   - *Key Talking Point:* "Notice the closed-loop governance: we record pre-intervention AQI versus post-intervention AQI to quantitatively verify policy efficacy."

### Step 3: Citizen Public Health Portal (45 Seconds)
1. Click **Citizen Portal** (`/citizen`).
2. Show the **Vulnerability Profile Selector**:
   - Toggle between **General Public**, **Children & Active Youth**, **Elderly (65+)**, and **Patients with Respiratory/Cardiac Conditions**.
   - *Key Talking Point:* "Notice how the health guidance changes dynamically. For general public, moderate air allows outdoor work; but for asthma patients, it immediately triggers N95 mask guidance and morning exercise rescheduling."
3. Show the **24-Hour Trend Chart (Recharts)** showing historical observed trend flowing directly into forecasted hours.

### Step 4: ML & SHAP Explainability (45 Seconds)
1. Click **ML & SHAP** (`/research/explainability`).
2. Show the **Empirical Performance Table**:
   - Point out the chronologically validated metrics: $\text{MAE}$, $\text{RMSE}$, and $R^2$ scores across horizons.
   - *Key Talking Point:* "We used an 80/20 chronological sequence split, strictly preventing data leakage across time."
3. Show the **SHAP Waterfall Attribution Chart**:
   - *Key Talking Point:* "We do not treat machine learning as a black box. SHAP game theory proves that low surface wind speed and high relative humidity (temperature inversion) are the primary physical factors driving the pollution spike."

---

## 🎓 3. Top 10 Viva Defense Questions & Winning Answers

#### Q1: Why did you use Random Forest instead of Deep Learning (LSTM / GRU / Transformers)?
> **Winning Answer:**
> *"Tabular atmospheric and meteorological datasets are non-smooth and feature-heterogeneous. Extensive empirical benchmarks (e.g., Grinsztajn et al., NeurIPS) demonstrate that tree-based ensembles consistently outperform deep sequence models on tabular time series with irregular sensor noise. Furthermore, Random Forest natively supports tree-based SHAP (TreeExplainer) with polynomial-time exact Shapley calculation, whereas explaining Deep Learning models requires costly Monte Carlo approximations. Finally, Random Forests do not suffer from exploding/vanishing gradients and train in minutes rather than hours."*

#### Q2: Why direct multi-horizon forecasting ($t+6, t+12, t+24$) instead of recursive single-step ($t+1$ fed into $t+2$)?
> **Winning Answer:**
> *"In recursive single-step forecasting, prediction errors at $t+1$ compound exponentially over multi-step horizons, causing severe drift. Direct multi-horizon forecasting trains independent models explicitly conditioned to minimize loss at target horizon $t+h$, effectively capturing horizon-specific atmospheric physics (e.g., midday solar photochemistry at 6h vs nighttime boundary layer collapse at 12h) without error compounding."*

#### Q3: How is data leakage prevented in feature engineering?
> **Winning Answer:**
> *"We strictly enforced three mathematical constraints:*
> 1. *All lag features ($t-1, t-2, t-6, t-24$) are computed on historical series prior to $t$.*
> 2. *All rolling window statistics (e.g. 6h rolling mean, 12h rolling standard deviation) are applied to shifted series ($\text{shift}(1)$) so the current observation $t$ is excluded from the window.*
> 3. *Data splitting is strictly chronological (first 80% chronologically for training, final 20% strictly for testing)—no randomized K-fold shuffling."*

#### Q4: How is CPCB composite AQI calculated?
> **Winning Answer:**
> *"We implement the official 2014 MoEFCC/CPCB piecewise linear interpolation formula:*
> $$I_p = \frac{I_{\text{hi}} - I_{\text{lo}}}{B_{\text{hi}} - B_{\text{lo}}} \times (C_p - B_{\text{lo}}) + I_{\text{lo}}$$
> *For every criteria pollutant ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{SO}_2, \text{CO}, \text{O}_3$), sub-indices $I_p$ are computed. The composite AQI is the maximum sub-index: $\text{AQI} = \max(I_p)$. Crucially, we enforce the statutory CPCB validity rule: at least 3 pollutants must be monitored, of which one must be particulate matter ($\text{PM}_{2.5}$ or $\text{PM}_{10}$)."*

#### Q5: What is the scientific logic behind the Atmospheric Stagnation Index ($ASI$)?
> **Winning Answer:**
> *"Atmospheric dispersion is governed by advective transport $\vec{u} \cdot \nabla C$. Under calm nocturnal conditions ($WS \to 0$), advection ceases and ground-level emissions accumulate in the shallow nocturnal boundary layer. We formulate $ASI = \frac{1}{WS + 0.5}$. The $0.5\,\text{m/s}$ damping term prevents division by zero and reflects the empirical threshold below which aerodynamic surface turbulence collapses."*

#### Q6: Why did you orthogonalize wind speed and direction into $U_{\text{east}}$ and $V_{\text{north}}$?
> **Winning Answer:**
> *"Wind direction is circular ($0^\circ$ and $360^\circ$ are physically identical North). Standard regression trees treat them as distant extremes, creating artificial split boundaries. By projecting into orthogonal Cartesian vectors $U = -WS \cdot \sin(\theta)$ and $V = -WS \cdot \cos(\theta)$, we produce continuous Cartesian velocities. In Delhi, negative $U$ and negative $V$ explicitly capture regional northwesterly transport of stubble-burning plumes from Punjab and Haryana."*

#### Q7: What dataset was used to train the models?
> **Winning Answer:**
> *"The models were trained on 230,307 authentic hourly records from the Central Pollution Control Board (CPCB) continuous ambient monitoring stations across Delhi NCR, preprocessed from the official open CPCB repository on Kaggle. The dataset includes Anand Vihar, Punjabi Bagh, ITO, RK Puram, Lodhi Road, IGI Airport, DTU, and Jahangirpuri."*

#### Q8: How does the real-time data fetching pipeline work?
> **Winning Answer:**
> *"The system uses a tiered fallback cascade. It first attempts to query official CPCB Data.gov.in or WAQI station feeds; if credentials are not configured, it seamlessly queries the open-access European ECMWF/Open-Meteo atmospheric chemistry feed; if network access is offline, it gracefully falls back to physics-informed diurnal baselines. All incoming telemetry is normalized into CPCB units, evaluated for NAQI, cached in memory, and recorded into an SQLite relational database."*

#### Q9: What is the role of SHAP in your system?
> **Winning Answer:**
> *"SHAP applies cooperative game theory (Shapley values) to fairly allocate the difference between model output and baseline expectation across individual features. It provides local explainability: answering why a specific station is predicted to spike (e.g. +35 AQI points due to stagnation, +18 points due to morning rush hour, offset by -8 points due to wind dispersion)."*

#### Q10: How is the application deployed?
> **Winning Answer:**
> *"The system runs on a unified, single-port architecture: FastAPI serves high-performance asynchronous RESTful endpoints and simultaneously serves the pre-compiled production React single-page application from `frontend/dist` on port 8000, eliminating CORS issues and multi-server management."*
