import React from 'react';

export default function ThermalGauge({ value = 0.78, level = 'High' }) {
  // Angle conversion: value from 0.0 to 1.0 maps to -90 to +90 degrees
  const clamped = Math.min(1.0, Math.max(0.0, value));
  const angle = (clamped * 180) - 90;

  const levelColors = {
    Low: 'text-emerald-400',
    Moderate: 'text-amber-400',
    High: 'text-red-500'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
        {/* SVG Arc Gauge */}
        <svg className="w-48 h-48 transform -rotate-180" viewBox="0 0 100 50">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#1E293B"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Low segment - Green */}
          <path
            d="M 10 50 A 40 40 0 0 1 36 15"
            fill="none"
            stroke="#10B981"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Moderate segment - Yellow */}
          <path
            d="M 36 15 A 40 40 0 0 1 64 15"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="10"
          />
          {/* High segment - Red */}
          <path
            d="M 64 15 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#EF4444"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>

        {/* Pointer Needle */}
        <div 
          className="absolute bottom-0 w-1 h-20 bg-gradient-to-t from-white to-red-500 origin-bottom transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md"></div>
      </div>

      <div className="text-center mt-3">
        <span className={`text-xl font-extrabold ${levelColors[level] || 'text-red-500'}`}>
          {level}
        </span>
        <p className="text-xs text-slate-400 font-medium">Index: {value.toFixed(2)}</p>
      </div>
    </div>
  );
}
