import React from 'react';
import { 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  ExternalLink,
  Layers,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutResearch() {
  return (
    <div className="min-h-screen flex flex-col bg-base-50 text-base-900">
      <Navbar />

      {/* Research Hero Header */}
      <section className="bg-white border-b border-base-200 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Academic Research Dossier • Air Quality Systems</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-base-900 tracking-tight leading-tight">
            AirGuard AI: Explainable Dual-Stakeholder Air Quality Forecasting Framework
          </h1>
          <p className="text-sm text-base-600 mt-2 leading-relaxed">
            A comprehensive investigation into machine learning-driven multi-horizon criteria pollutant forecasting, game-theoretic SHAP explainability, and differentiated operational decision-support for municipal authorities and citizens.
          </p>
        </div>
      </section>

      {/* Main Research Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {/* 1. Research Problem & Motivation */}
        <section className="bg-white rounded-3xl p-8 border border-base-200 shadow-soft space-y-4">
          <h2 className="text-xl font-bold text-base-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">1</span>
            <span>Research Problem & Motivation</span>
          </h2>
          <p className="text-xs sm:text-sm text-base-600 leading-relaxed">
            Severe ambient air pollution in urban developing centers, particularly across the Indo-Gangetic Plain and Delhi NCR, constitutes a persistent public health emergency. Despite significant investments in Continuous Ambient Air Quality Monitoring Stations (CAAQMS), current information dissemination paradigms suffer from three foundational gaps:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-base-700 pl-4 list-disc">
            <li>
              <strong>Single-Stakeholder Uniformity:</strong> Existing air quality portals present aggregated AQI figures without differentiating the operational actions required by municipal enforcement authorities (dust suppression, vehicular diversions, industrial audits) from the personalized health safeguards needed by citizens (vulnerability-aware activity scheduling, certified respirator usage).
            </li>
            <li>
              <strong>Black-Box Forecasting:</strong> Traditional numerical or deep learning time-series forecasts output numerical point estimates without explaining *why* an accumulation event is predicted. Without transparent explanations of underlying meteorological stagnation or precursor spikes, municipal authorities cannot confidently deploy resource-intensive interventions.
            </li>
            <li>
              <strong>Absence of Closed-Loop Tracking:</strong> Predictive systems rarely provide feedback mechanisms to log municipal interventions and observe subsequent air-quality trajectories.
            </li>
          </ul>
        </section>

        {/* 2. Research Objectives */}
        <section className="bg-white rounded-3xl p-8 border border-base-200 shadow-soft space-y-4">
          <h2 className="text-xl font-bold text-base-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">2</span>
            <span>Research Objectives</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-base-50 border border-base-200">
              <strong className="text-base-900 block mb-1">1. Multi-Horizon Forecasting:</strong>
              <p className="text-base-600">Forecast composite AQI and 6 individual criteria pollutants (PM2.5, PM10, NO2, SO2, CO, O3) across 6h, 12h, and 24h horizons using direct regression.</p>
            </div>
            <div className="p-4 rounded-2xl bg-base-50 border border-base-200">
              <strong className="text-base-900 block mb-1">2. Game-Theoretic Explainability:</strong>
              <p className="text-base-600">Apply SHAP (SHapley Additive exPlanations) TreeExplainer to attribute exact contributions of meteorological variables, temporal cycles, and autocorrelation lags.</p>
            </div>
            <div className="p-4 rounded-2xl bg-base-50 border border-base-200">
              <strong className="text-base-900 block mb-1">3. Dual Decision Support:</strong>
              <p className="text-base-600">Formulate rule-based decision engines generating municipal regulatory interventions for authorities and vulnerability-tailored precautions for citizens.</p>
            </div>
            <div className="p-4 rounded-2xl bg-base-50 border border-base-200">
              <strong className="text-base-900 block mb-1">4. Closed-Loop Intervention Tracking:</strong>
              <p className="text-base-600">Maintain an auditable repository of dispatched authority actions and evaluate subsequent empirical changes in air quality parameters.</p>
            </div>
          </div>
        </section>

        {/* 3. Methodology & CPCB NAQI Formulation */}
        <section className="bg-white rounded-3xl p-8 border border-base-200 shadow-soft space-y-4">
          <h2 className="text-xl font-bold text-base-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">3</span>
            <span>CPCB National Air Quality Index (NAQI) Methodology</span>
          </h2>
          <p className="text-xs sm:text-sm text-base-600 leading-relaxed">
            The platform strictly implements the official Indian National Air Quality Index calculation formulated by the Central Pollution Control Board (CPCB), Ministry of Environment, Forest & Climate Change. For each monitored criteria pollutant concentration $C_p$, the sub-index $I_p$ is computed using piecewise linear interpolation:
          </p>

          <div className="p-4 bg-base-50 rounded-2xl border border-base-200 font-mono text-xs text-center my-4 overflow-x-auto">
            {"I_p = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (C_p - B_lo) + I_lo"}
          </div>

          <p className="text-xs sm:text-sm text-base-600 leading-relaxed">
            where $B_{hi}$ and $B_{lo}$ represent the breakpoint concentrations corresponding to sub-index interval boundaries $[I_{lo}, I_{hi}]$. The composite index is defined by the maximum sub-index with mandatory CPCB validity criteria:
          </p>

          <div className="p-4 bg-base-50 rounded-2xl border border-base-200 font-mono text-xs text-center my-4">
            {"AQI = max(I_1, I_2, ..., I_n), where n >= 3 and (I_PM2.5 or I_PM10 is present)"}
          </div>

          <p className="text-xs text-base-500">
            The pollutant yielding the maximum sub-index is designated as the <strong>dominant pollutant</strong>, dictating the composite health advisory and regulatory focus.
          </p>
        </section>

        {/* 4. Machine Learning & Explainable AI Architecture */}
        <section className="bg-white rounded-3xl p-8 border border-base-200 shadow-soft space-y-4">
          <h2 className="text-xl font-bold text-base-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">4</span>
            <span>Machine Learning & Direct Multi-Horizon Formulation</span>
          </h2>
          <p className="text-xs sm:text-sm text-base-600 leading-relaxed">
            Following econometric and time-series literature (Marcellino et al., 2006), AirGuard AI adopts a <strong>direct multi-horizon forecasting strategy</strong> rather than recursive iterated forecasting. In direct forecasting, a separate regressor f_h is trained for each horizon h in [6, 12, 24] hours:
          </p>
          <div className="p-4 bg-base-50 rounded-2xl border border-base-200 font-mono text-xs text-center my-4">
            {"y_{t+h} = f_h( X_t ) + epsilon_{t+h}"}
          </div>
          <p className="text-xs sm:text-sm text-base-600 leading-relaxed">
            This mitigates bias accumulation and allows each horizon model to independently learn atmospheric processes specific to that time lag (e.g. nocturnal boundary layer collapse vs afternoon solar heating).
          </p>
          <p className="text-xs sm:text-sm text-base-600 leading-relaxed">
            <strong>Chronological Train/Test Split:</strong> Evaluation strictly employs chronological partitioning (first 80% for model fitting; remaining 20% strictly reserved for out-of-sample testing) to eliminate temporal data leakage.
          </p>
        </section>

        {/* 5. Scientific References & Related Work */}
        <section className="bg-white rounded-3xl p-8 border border-base-200 shadow-soft space-y-4">
          <h2 className="text-xl font-bold text-base-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">5</span>
            <span>Real Publications & Reliable Literature References</span>
          </h2>
          <p className="text-xs text-base-500 mb-4">
            The mathematical, regulatory, and algorithmic foundations of AirGuard AI are grounded in peer-reviewed scientific literature and official government standards:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-base-50 border border-base-200 leading-relaxed">
              <span className="font-bold text-base-900 block mb-1">1. Central Pollution Control Board (CPCB)</span>
              <span className="text-base-600">
                Central Pollution Control Board, Ministry of Environment, Forest and Climate Change, Government of India. (2014). 
                <em> National Air Quality Index</em>. Control of Urban Pollution Series (CUPS/82/2014-15), New Delhi.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-base-50 border border-base-200 leading-relaxed">
              <span className="font-bold text-base-900 block mb-1">2. World Health Organization (WHO)</span>
              <span className="text-base-600">
                World Health Organization. (2021). 
                <em> WHO global air quality guidelines: particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide</em>. World Health Organization, Geneva. ISBN 978-92-4-003422-8.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-base-50 border border-base-200 leading-relaxed">
              <span className="font-bold text-base-900 block mb-1">3. Lundberg, S. M., & Lee, S. I.</span>
              <span className="text-base-600">
                Lundberg, S. M., & Lee, S. I. (2017). 
                <em> A unified approach to interpreting model predictions</em>. Advances in Neural Information Processing Systems (NeurIPS 30), 4765-4774.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-base-50 border border-base-200 leading-relaxed">
              <span className="font-bold text-base-900 block mb-1">4. Breiman, L.</span>
              <span className="text-base-600">
                Breiman, L. (2001). 
                <em> Random forests</em>. Machine Learning, 45(1), 5-32. DOI: 10.1023/A:1010933404324.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-base-50 border border-base-200 leading-relaxed">
              <span className="font-bold text-base-900 block mb-1">5. Marcellino, M., Stock, J. H., & Watson, M. W.</span>
              <span className="text-base-600">
                Marcellino, M., Stock, J. H., & Watson, M. W. (2006). 
                <em> A comparison of direct and iterated multistep AR methods for forecasting macroeconomic time series</em>. Journal of Econometrics, 135(1-2), 499-526.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-base-50 border border-base-200 leading-relaxed">
              <span className="font-bold text-base-900 block mb-1">6. Ministry of Environment, Forest and Climate Change (MoEFCC)</span>
              <span className="text-base-600">
                Ministry of Environment, Forest and Climate Change, Government of India. (2019). 
                <em> National Clean Air Programme (NCAP)</em>. New Delhi, India.
              </span>
            </div>
          </div>
        </section>

        {/* 6. Limitations & Future Scope */}
        <section className="bg-white rounded-3xl p-8 border border-base-200 shadow-soft space-y-4">
          <h2 className="text-xl font-bold text-base-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">6</span>
            <span>Limitations & Future Research Scope</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <strong className="text-amber-900 block mb-1">System Limitations:</strong>
              <ul className="space-y-1.5 text-amber-800 list-disc pl-4">
                <li>Spatial extrapolation is bounded by the geographic distribution of existing CAAQMS sensors.</li>
                <li>SHAP attributions represent statistical associations and should not be confused with confirmed physical causal mechanisms.</li>
                <li>Sudden unmodeled external shocks (e.g. localized industrial accidents) require auxiliary surveillance.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
              <strong className="text-indigo-900 block mb-1">Future Research Scope:</strong>
              <ul className="space-y-1.5 text-indigo-800 list-disc pl-4">
                <li>Integration with satellite remote sensing (e.g. INSAT-3D Aerosol Optical Depth / Sentinel-5P TROPOMI).</li>
                <li>Coupling machine learning regressors with Eulerian chemical transport models (WRF-Chem).</li>
                <li>Expansion to hyper-local low-cost IoT sensor calibration networks across municipal wards.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
