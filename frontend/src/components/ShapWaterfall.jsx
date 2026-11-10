import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info, HelpCircle } from 'lucide-react';

export default function ShapWaterfall({ 
  factors = [], 
  baseValue = 75, 
  predictedValue = null, 
  pollutant = 'PM2.5',
  summary = ''
}) {
  const maxImpact = Math.max(...factors.map(f => f.impact_magnitude || Math.abs(f.shap_value) || 1), 10);

  return (
    <div className="bg-white rounded-2xl p-6 border border-base-200 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-base-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base-900 text-base">SHAP Forecast Explainability</h3>
            <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              TreeExplainer
            </span>
          </div>
          <p className="text-xs text-base-500 mt-0.5">
            Key meteorological, temporal, and atmospheric persistence drivers influencing the {pollutant} forecast.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-base-50 px-3 py-1.5 rounded-lg border border-base-200 shrink-0">
          <div>
            <span className="text-base-400 block text-[10px]">Model Base Value:</span>
            <span className="font-mono font-bold text-base-700">{Math.round(baseValue)} µg/m³</span>
          </div>
          {predictedValue && (
            <div className="border-l border-base-200 pl-3">
              <span className="text-base-400 block text-[10px]">Forecast Target:</span>
              <span className="font-mono font-bold text-blue-600">{Math.round(predictedValue)} µg/m³</span>
            </div>
          )}
        </div>
      </div>

      {/* Narrative Summary */}
      {summary && (
        <div className="my-4 p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong>Synthesis: </strong>
            <span>{summary}</span>
          </div>
        </div>
      )}

      {/* Factor Attribution Bars */}
      <div className="space-y-3 mt-4">
        {factors.map((factor, idx) => {
          const isPositive = factor.shap_value > 0;
          const barWidthPercent = Math.min(100, Math.max(12, ((factor.impact_magnitude || Math.abs(factor.shap_value)) / maxImpact) * 100));

          return (
            <div key={idx} className="p-3 rounded-xl bg-base-50/70 border border-base-100 hover:bg-base-100/60 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <span className="p-1 rounded bg-rose-100 text-rose-700">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="font-semibold text-base-800">{factor.display_name}</span>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className={`font-bold ${isPositive ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isPositive ? '+' : ''}{factor.shap_value}
                  </span>
                  <span className="text-[10px] text-base-400">SHAP impact</span>
                </div>
              </div>

              {/* Impact Bar */}
              <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-base-500 mt-1.5">
                <span>{factor.direction}</span>
                {factor.current_val !== undefined && factor.current_val !== 0 && (
                  <span className="text-[10px] text-base-400 font-mono">Current value: {factor.current_val}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-base-100 flex items-center justify-between text-[11px] text-base-400">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-base-400" />
          <span>SHAP values quantify the positive or negative contribution of each feature to the model's output deviation.</span>
        </div>
        <span className="font-mono text-[10px] text-indigo-600">Game-Theoretic Shapley Form</span>
      </div>
    </div>
  );
}
