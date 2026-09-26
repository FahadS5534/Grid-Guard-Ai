import React from 'react';

export default function RiskGauge({ percentage = 0, level = 'Low' }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const safePercentage = Math.min(100, Math.max(0, percentage || 0));
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  const levelStr = (level || 'Low').toString();
  const normalizedLevel = levelStr.toLowerCase();

  let strokeColor = '#10B981';
  if (normalizedLevel.includes('moderate') || normalizedLevel.includes('medium')) {
    strokeColor = '#F59E0B';
  } else if (normalizedLevel.includes('high')) {
    strokeColor = '#EF4444';
  } else if (normalizedLevel.includes('critical')) {
    strokeColor = '#DC2626';
  }

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#1E293B"
          strokeWidth="10"
        />
        {/* Progress track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold text-white tracking-tight">{levelStr.split(' ')[0]}</span>
      </div>
    </div>
  );
}
