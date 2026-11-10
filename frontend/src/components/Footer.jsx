import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Info } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-base-200 mt-16 py-10 text-base-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span className="text-base font-bold text-base-900">AirGuard AI</span>
            </div>
            <p className="text-base-500 leading-relaxed max-w-md">
              A research-oriented explainable machine-learning air quality forecasting and dual-stakeholder decision-support framework. Grounded in Central Pollution Control Board (CPCB) National Air Quality Index formulations.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 max-w-md">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Academic & Research Disclaimer:</strong> Demonstrates ML decision-support capabilities. Authority interventions are suggested scientific investigations; citizen health advisories do not replace professional medical advice.
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-base-900 mb-3 uppercase tracking-wider text-[11px]">System Architecture</h4>
            <ul className="space-y-2">
              <li><Link to="/authority" className="hover:text-blue-600 transition-colors">Authority Command Portal</Link></li>
              <li><Link to="/citizen" className="hover:text-green-600 transition-colors">Citizen Health Portal</Link></li>
              <li><Link to="/research/explainability" className="hover:text-indigo-600 transition-colors">SHAP Explainability & ML Metrics</Link></li>
              <li><Link to="/about" className="hover:text-base-900 transition-colors">Methodology & References</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-base-900 mb-3 uppercase tracking-wider text-[11px]">Methodological References</h4>
            <ul className="space-y-2">
              <li className="text-base-500">CPCB NAQI Technical Report (2014)</li>
              <li className="text-base-500">WHO Global Air Quality Guidelines (2021)</li>
              <li className="text-base-500">SHAP TreeExplainer (Lundberg et al., 2017)</li>
              <li className="text-base-500">Random Forest Regressors (Breiman, 2001)</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-base-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-base-400">© 2026 AirGuard AI Research Framework. All rights reserved.</p>
          <p className="text-base-400 font-mono">CPCB Sub-Index Standard • Random Forest Direct Multi-Horizon</p>
        </div>
      </div>
    </footer>
  );
}
