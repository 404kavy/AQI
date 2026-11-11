# Deploying AirGuard AI on Vercel

AirGuard AI is configured for turnkey, zero-configuration deployment on **Vercel** with full-stack support:
* **Frontend:** React 19 + Vite single-page application built automatically from `frontend/dist`.
* **Backend API:** High-speed serverless Python FastAPI runtime located in `api/index.py` that handles all `/api/*` endpoints with live Open-Meteo telemetry and CPCB AQI calculation.
* **SPA Routing:** Clean rewrite rules ensuring page refreshes on `/authority`, `/citizen`, `/research/explainability`, and `/about` never return 404.

---

## 🚀 30-Second Deployment Instructions

### Step 1: Open Vercel Dashboard
1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** $\to$ **Project**.

### Step 2: Import Your Repository
1. Select **`404kavy/AQI`** from your GitHub repositories list.
2. Click **Import**.

### Step 3: Deploy (Zero Configuration Needed)
* **Framework Preset:** `Vite` (Vercel will detect it automatically via root `vercel.json`).
* **Root Directory:** `./` (Leave as default).
* **Build Command:** `cd frontend && npm install && npm run build` (Pre-configured in `vercel.json`).
* **Output Directory:** `frontend/dist` (Pre-configured in `vercel.json`).
* **Environment Variables:** *(Optional)* You do not need any environment variables to deploy! The system automatically uses the live Open-Meteo feed.
* Click **Deploy**.

---

## 🌐 Live URLs After Deployment

Once the build completes (usually ~45 seconds):
* **Overview:** `https://your-project.vercel.app/`
* **Authority Portal:** `https://your-project.vercel.app/authority`
* **Citizen Portal:** `https://your-project.vercel.app/citizen`
* **ML & SHAP Explainability:** `https://your-project.vercel.app/research/explainability`
* **API Health Check:** `https://your-project.vercel.app/api/health`
* **Live CAAQMS Realtime Stations:** `https://your-project.vercel.app/api/realtime/stations`

---

## 🛠️ Architecture on Vercel

```
                 Incoming Request (vercel.app)
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
     Path: /api/*                          Path: /* (Web UI)
            │                                     │
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│ Serverless Python FastAPI │         │ Pre-compiled React SPA    │
│ api/index.py              │         │ frontend/dist/index.html  │
│ (Live CPCB Telemetry)     │         │ (Client-Side Router)      │
└───────────────────────────┘         └───────────────────────────┘
```
