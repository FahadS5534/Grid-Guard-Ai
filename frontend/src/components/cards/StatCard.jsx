import React from 'react';

export default function StatCard({ icon: Icon, label, value, subvalue, colorScheme = 'purple' }) {
  const themes = {
    green: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      textColor: 'text-emerald-300'
    },
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-400',
      textColor: 'text-blue-300'
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-400',
      textColor: 'text-purple-300'
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
      textColor: 'text-amber-300'
    },
    red: {
      bg: 'bg-red-500/10 border-red-500/30',
      iconBg: 'bg-red-500/20 text-red-400',
      textColor: 'text-red-300'
    }
  };

  const theme = themes[colorScheme] || themes.purple;

  return (
    <div className={`p-4 rounded-xl border ${theme.bg} backdrop-blur-md flex items-center gap-4 transition-all duration-200`}>
      <div className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className={`text-xl font-bold ${theme.textColor} mt-0.5`}>{value}</h3>
        {subvalue && <p className="text-[11px] text-slate-400 mt-0.5">{subvalue}</p>}
      </div>
    </div>
  );
}
