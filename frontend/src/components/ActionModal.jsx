import React, { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ActionModal({ action, isOpen, onClose, onSave }) {
  if (!isOpen || !action) return null;

  const [status, setStatus] = useState(action.status || 'Pending');
  const [department, setDepartment] = useState(action.department || '');
  const [notes, setNotes] = useState(action.action_notes || '');
  const [postAqi, setPostAqi] = useState(action.post_intervention_aqi || '');
  const [evaluationNotes, setEvaluationNotes] = useState(action.evaluation_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...action,
        status,
        department,
        action_notes: notes,
        post_intervention_aqi: postAqi ? parseFloat(postAqi) : null,
        evaluation_notes: evaluationNotes,
        completed_date: status === 'Completed' ? new Date().toISOString() : action.completed_date
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-base-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-base-200">
        <div className="flex items-center justify-between pb-4 border-b border-base-100">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-authority-700 bg-authority-50 px-2 py-0.5 rounded border border-authority-200">
              Authority Intervention Tracker
            </span>
            <h3 className="text-base font-bold text-base-900 mt-1">{action.action_title || action.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-base-400 hover:text-base-700 hover:bg-base-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-base-600 font-semibold mb-1">Affected Location & Target Pollutant</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                disabled 
                value={action.affected_location || action.station_name || 'Station'} 
                className="bg-base-100 text-base-700 px-3 py-2 rounded-lg border border-base-200 flex-1"
              />
              <input 
                type="text" 
                disabled 
                value={action.pollutant || 'PM2.5'} 
                className="bg-base-100 text-base-700 px-3 py-2 rounded-lg border border-base-200 w-24 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-base-600 font-semibold mb-1">Operational Status</label>
            <div className="grid grid-cols-3 gap-2">
              {['Pending', 'In Progress', 'Completed'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                    status === s
                      ? s === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-soft'
                        : s === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-soft'
                        : 'bg-amber-50 text-amber-700 border-amber-300 shadow-soft'
                      : 'border-base-200 text-base-600 hover:bg-base-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base-600 font-semibold mb-1">Responsible Municipal Department</label>
            <input 
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. DPCC Enforcement, PWD, Traffic Police"
              className="w-full px-3 py-2 rounded-lg border border-base-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-base-600 font-semibold mb-1">Intervention Field Notes & Actions Deployed</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record deployed teams, anti-smog guns, traffic diversions, or site closure notices..."
              className="w-full px-3 py-2 rounded-lg border border-base-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {status === 'Completed' && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Post-Intervention Verification</span>
              </div>
              <div>
                <label className="block text-emerald-700 font-semibold mb-1">Post-Intervention Observed AQI (Subsequent Reading)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={postAqi}
                  onChange={(e) => setPostAqi(e.target.value)}
                  placeholder="e.g. 295"
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-emerald-700 font-semibold mb-1">Evaluation & Attenuation Notes</label>
                <input 
                  type="text"
                  value={evaluationNotes}
                  onChange={(e) => setEvaluationNotes(e.target.value)}
                  placeholder="e.g. Observed 22% PM10 reduction within 2km sensor radius"
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-base-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-base-200 text-base-600 hover:bg-base-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-authority-600 hover:bg-authority-700 text-white font-semibold shadow-soft transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Intervention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
