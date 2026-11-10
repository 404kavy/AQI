import React from 'react';

const CATEGORY_COLORS = {
  good: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  satisfactory: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200', dot: 'bg-lime-500' },
  moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  poor: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  verypoor: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  severe: { bg: 'bg-rose-900', text: 'text-rose-100', border: 'border-rose-950', dot: 'bg-rose-400' },
};

export default function AqiBadge({ category = 'Moderate', code = 'moderate', aqi = null, size = 'md' }) {
  const normCode = (code || category || 'moderate').toLowerCase().replace(/\s+/g, '');
  const style = CATEGORY_COLORS[normCode] || CATEGORY_COLORS.moderate;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-bold px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size] || sizeClasses.md}`}>
      <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} />
      <span>{category}</span>
      {aqi !== null && aqi !== undefined && (
        <span className="font-mono opacity-80">({Math.round(aqi)})</span>
      )}
    </span>
  );
}
