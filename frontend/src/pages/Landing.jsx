import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Cpu, 
  Compass, 
  Activity, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-base-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-base-200 bg-gradient-to-b from-white via-base-50 to-base-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Research Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-soft">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Research Framework • CPCB NAQI Standard • Explainable AI</span>
            </div>

            {/* Title & Tagline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-base-900 tracking-tight leading-[1.1] mb-6">
              Predict Pollution. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600">
                Enable Action. Protect Lives.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-base-600 leading-relaxed mb-8">
              AirGuard AI is an explainable machine-learning air quality forecasting and intelligent decision-support system. Powered by a shared multi-horizon prediction engine with dedicated, independent recommendation systems for government authorities and citizens.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/authority"
                className="px-6 py-3.5 rounded-xl bg-authority-600 hover:bg-authority-700 text-white font-bold text-sm shadow-card hover:shadow-elevated transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Open Authority Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/citizen"
                className="px-6 py-3.5 rounded-xl bg-citizen-600 hover:bg-citizen-700 text-white font-bold text-sm shadow-card hover:shadow-elevated transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Open Citizen Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Prominent Portal Cards Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-base-900">Dual-Stakeholder Architecture</h2>
          <p className="text-sm text-base-500 mt-2 max-w-xl mx-auto">
            A single machine learning forecasting engine drives two fundamentally distinct operational workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Portal 1: Authority Dashboard Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-authority-200 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-authority-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-authority-600 text-white flex items-center justify-center shadow-soft mb-6">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="inline-block px-2.5 py-1 rounded-full bg-authority-50 text-authority-800 text-[11px] font-bold border border-authority-200 mb-3 uppercase tracking-wider">
                Government & Pollution Control
              </div>

              <h3 className="text-2xl font-black text-base-900 mb-3">Authority Decision Portal</h3>
              <p className="text-sm text-base-600 mb-6 leading-relaxed">
                Designed for municipal commissioners, State Pollution Control Boards (DPCC/CPCB), and traffic enforcement departments.
              </p>

              <ul className="space-y-3 mb-8 text-xs text-base-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-authority-600 shrink-0" />
                  <span><strong>Multi-Horizon Forecasting:</strong> 6h, 12h, and 24h predictions for all criteria pollutants</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-authority-600 shrink-0" />
                  <span><strong>Spatial Hotspot Mapping:</strong> Interactive Leaflet map with CPCB CAAQMS monitoring network</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-authority-600 shrink-0" />
                  <span><strong>Pollutant-Specific Interventions:</strong> Rule-based directives for road dust, traffic diversion, and combustion inspection</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-authority-600 shrink-0" />
                  <span><strong>Intervention Tracking:</strong> Log municipal actions and evaluate before/after air quality attenuation</span>
                </li>
              </ul>
            </div>

            <Link
              to="/authority"
              className="w-full py-3 px-4 rounded-xl bg-authority-600 hover:bg-authority-700 text-white font-bold text-sm text-center shadow-soft transition-colors flex items-center justify-center gap-2 relative z-10"
            >
              <span>Access Authority Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Portal 2: Citizen Dashboard Card */}
          <div className="bg-white rounded-3xl p-8 border-2 border-citizen-200 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-citizen-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-citizen-600 text-white flex items-center justify-center shadow-soft mb-6">
                <Users className="w-6 h-6" />
              </div>

              <div className="inline-block px-2.5 py-1 rounded-full bg-citizen-50 text-citizen-800 text-[11px] font-bold border border-citizen-200 mb-3 uppercase tracking-wider">
                Public Health & Citizens
              </div>

              <h3 className="text-2xl font-black text-base-900 mb-3">Citizen Health Advisory Portal</h3>
              <p className="text-sm text-base-600 mb-6 leading-relaxed">
                Simple, actionable, empathetic guidance tailored to citizen vulnerability profiles without medical jargon.
              </p>

              <ul className="space-y-3 mb-8 text-xs text-base-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-citizen-600 shrink-0" />
                  <span><strong>Dominant Pollutant Breakdown:</strong> Plain-language biological impacts (PM2.5 alveolar entry, NO2 airway spasm)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-citizen-600 shrink-0" />
                  <span><strong>Vulnerability Profiling:</strong> Tailored guidance for General Public, Children, Seniors, and Respiratory Patients</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-citizen-600 shrink-0" />
                  <span><strong>Actionable Precautions:</strong> Outdoor activity safety windows, ventilation timing, and certified N95 mask advice</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-citizen-600 shrink-0" />
                  <span><strong>Advance Pollution Alerts:</strong> Early notifications for upcoming hours to plan commutes and school activities</span>
                </li>
              </ul>
            </div>

            <Link
              to="/citizen"
              className="w-full py-3 px-4 rounded-xl bg-citizen-600 hover:bg-citizen-700 text-white font-bold text-sm text-center shadow-soft transition-colors flex items-center justify-center gap-2 relative z-10"
            >
              <span>Access Citizen Health Advisory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How the Prediction Engine Works Section */}
      <section className="py-16 bg-white border-y border-base-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-mono font-bold text-blue-600 tracking-wider">Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-base-900 mt-1">How the Prediction Engine Works</h2>
            <p className="text-xs sm:text-sm text-base-500 mt-2">
              From raw CAAQMS sensor telemetry to dual-stakeholder decision support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-base-50 border border-base-200 relative">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-sm flex items-center justify-center mb-4">1</span>
              <h4 className="font-bold text-base-900 text-sm mb-2">Data & Feature Extraction</h4>
              <p className="text-xs text-base-600 leading-relaxed">
                Ingests 6 criteria pollutants (PM2.5, PM10, NO2, SO2, CO, O3) plus meteorology. Engineers diurnal cycles, atmospheric stagnation indices, and temporal lag/rolling statistics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-base-50 border border-base-200 relative">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-sm flex items-center justify-center mb-4">2</span>
              <h4 className="font-bold text-base-900 text-sm mb-2">Direct Multi-Horizon ML</h4>
              <p className="text-xs text-base-600 leading-relaxed">
                Random Forest Regressors predict target concentrations across 6h, 12h, and 24h horizons without iterative error compounding, evaluated chronologically (MAE, RMSE, R²).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-base-50 border border-base-200 relative">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-sm flex items-center justify-center mb-4">3</span>
              <h4 className="font-bold text-base-900 text-sm mb-2">Official CPCB NAQI Engine</h4>
              <p className="text-xs text-base-600 leading-relaxed">
                Executes piecewise linear interpolation across Indian CPCB breakpoint tables, computing sub-indices, determining the dominant pollutant, and assigning standard warning categories.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-base-50 border border-base-200 relative">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-sm flex items-center justify-center mb-4">4</span>
              <h4 className="font-bold text-base-900 text-sm mb-2">Explainability & Dual Support</h4>
              <p className="text-xs text-base-600 leading-relaxed">
                SHAP TreeExplainer attributes exact meteorological drivers (wind stagnation, inversion). Dispatches targeted interventions for authorities and health advisories for citizens.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/research/explainability"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>Explore SHAP Attributions & Benchmark Metrics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
