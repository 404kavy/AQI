import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  BarChart3, 
  CheckCircle2, 
  Info, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Layers
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchModelMetrics, fetchFeatureImportance } from '../services/api';

export default function ModelExplainability() {
  const [metrics, setMetrics] = useState(null);
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');
  const [featureImportances, setFeatureImportances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [meta, fi] = await Promise.all([
          fetchModelMetrics(),
          fetchFeatureImportance(selectedPollutant)
        ]);
        setMetrics(meta);
        setFeatureImportances(fi.feature_importances || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [selectedPollutant]);

  const evalMetrics = metrics?.evaluation_metrics || {};
  const modelComparison = metrics?.model_comparison || {};
  const shapSummary = metrics?.shap_summary?.pm25_h6;

  return (
    <div className="min-h-screen flex flex-col bg-base-50 text-base-900">
      <Navbar />

      <section className="bg-white border-b border-base-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-indigo-700">
              Explainable AI & Model Governance
            </span>
          </div>
          <h1 className="text-3xl font-black text-base-900 tracking-tight">
            Forecasting Engine Performance & SHAP Attribution
          </h1>
          <p className="text-xs sm:text-sm text-base-600 mt-1 max-w-3xl leading-relaxed">
            Transparent evaluation of the multi-horizon Random Forest models. Chronologically validated to strictly prevent temporal data leakage, with game-theoretic Shapley value attribution.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Model Evaluation Metrics Matrix */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-base-200 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-base-100 gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-base-900">Empirical Model Performance (Chronological Test Split)</h2>
              <p className="text-xs text-base-500">
                Trained on 80% historical sequence and evaluated on strictly unseen 20% future sequence.
              </p>
            </div>
            <div className="text-[11px] font-mono text-base-500 bg-base-50 px-3 py-1.5 rounded-lg border border-base-200">
              Zero Data Leakage • Direct Multi-Horizon
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-base-50 border-b border-base-200 text-base-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Pollutant Parameter</th>
                  <th className="p-3.5">Horizon</th>
                  <th className="p-3.5">Model Architecture</th>
                  <th className="p-3.5">MAE (Mean Abs Error)</th>
                  <th className="p-3.5">RMSE (Root Mean Sq)</th>
                  <th className="p-3.5">R² Score (Goodness of Fit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100 font-mono">
                {Object.entries(evalMetrics).map(([pol, horizons]) => {
                  return Object.entries(horizons).map(([hKey, met], idx) => (
                    <tr key={`${pol}-${hKey}`} className="hover:bg-base-50/60 transition-colors">
                      {idx === 0 && (
                        <td rowSpan={Object.keys(horizons).length} className="p-3.5 font-sans font-bold text-base-900 border-r border-base-100">
                          {pol.toUpperCase()}
                        </td>
                      )}
                      <td className="p-3.5 font-bold text-authority-700">+{hKey.replace('h', '')} Hours</td>
                      <td className="p-3.5 font-sans text-base-600">Random Forest Regressor</td>
                      <td className="p-3.5 text-base-800">{met.mae}</td>
                      <td className="p-3.5 text-base-800">{met.rmse}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          met.r2 >= 0.85 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : met.r2 >= 0.50
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {met.r2}
                        </span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Benchmark Comparison (Random Forest vs Gradient Boosting) */}
        {Object.keys(modelComparison).length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-base-200 shadow-soft">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-base-900">Baseline Benchmark: Random Forest vs. Gradient Boosting</h2>
              <p className="text-xs text-base-500">
                Comparative evaluation across criteria pollutants on the 6-hour horizon.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(modelComparison).map(([key, comp]) => {
                const polName = key.replace('_h6', '').toUpperCase();
                return (
                  <div key={key} className="p-5 rounded-2xl bg-base-50 border border-base-200">
                    <span className="text-xs font-bold text-base-900 block mb-3 uppercase tracking-wider">
                      {polName} (Horizon: +6h)
                    </span>

                    <div className="space-y-3 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-white border border-base-200">
                        <div className="text-[10px] text-base-400 uppercase font-sans font-bold">Random Forest:</div>
                        <div className="flex justify-between mt-1">
                          <span>MAE: <strong>{comp.random_forest.mae}</strong></span>
                          <span>RMSE: <strong>{comp.random_forest.rmse}</strong></span>
                          <span>R²: <strong className="text-emerald-700">{comp.random_forest.r2}</strong></span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-base-200">
                        <div className="text-[10px] text-base-400 uppercase font-sans font-bold">Gradient Boosting:</div>
                        <div className="flex justify-between mt-1">
                          <span>MAE: <strong>{comp.gradient_boosting.mae}</strong></span>
                          <span>RMSE: <strong>{comp.gradient_boosting.rmse}</strong></span>
                          <span>R²: <strong className="text-indigo-700">{comp.gradient_boosting.r2}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Feature Importance Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-base-200 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-base-100 gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-base-900">Global Feature Importance (Gini Impurity)</h2>
              <p className="text-xs text-base-500">Top explanatory variables utilized by the baseline Random Forest model.</p>
            </div>

            <div className="flex items-center gap-1.5 bg-base-100 p-1 rounded-xl border border-base-200">
              {['pm25', 'pm10', 'no2', 'o3'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPollutant(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedPollutant === p ? 'bg-indigo-600 text-white' : 'text-base-600 hover:bg-base-200'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {featureImportances.map((item, idx) => {
              const maxImp = featureImportances[0]?.importance || 1;
              const widthPct = Math.max(10, Math.min(100, (item.importance / maxImp) * 100));

              return (
                <div key={idx} className="p-3 rounded-xl bg-base-50 border border-base-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-base-800">{item.feature.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="font-mono text-base-500">{item.importance}</span>
                  </div>
                  <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global SHAP Summary */}
        {shapSummary && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-base-200 shadow-soft">
            <div className="mb-6">
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                TreeExplainer Global Attributions
              </span>
              <h2 className="text-lg font-bold text-base-900 mt-2">SHAP Mean Absolute Attribution (PM2.5 Horizon 6h)</h2>
              <p className="text-xs text-base-500">
                Average magnitude of impact across test instances. Baseline expected value: <strong>{shapSummary.expected_value?.toFixed(1)} µg/m³</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {shapSummary.top_factors?.map((tf, i) => (
                <div key={i} className="p-4 rounded-2xl bg-base-50 border border-base-200">
                  <span className="text-[11px] font-bold text-base-700 block mb-1">{tf.factor}</span>
                  <div className="text-xl font-black text-indigo-900 font-mono">
                    {tf.mean_shap_value}
                  </div>
                  <span className="text-[10px] text-base-400">Mean |SHAP| impact (µg/m³)</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-900 leading-relaxed mt-6 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Interpretation Guide: </strong>
                Features with highest mean absolute SHAP values exert the greatest control over the multi-horizon trajectory. Lags reflect temporal persistence, while meteorological stagnation triggers rapid non-linear accumulation.
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
