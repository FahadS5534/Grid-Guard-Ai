import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function HealthTrendChart({ data, timeRange, onRangeChange }) {
  const ranges = ['24 Hours', '7 Days', '30 Days', '90 Days'];

  return (
    <div className="gridguard-card p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-white">Health Score Trend</h3>
          <p className="text-xs text-slate-400">Historical performance stability index over time</p>
        </div>

        <div className="flex bg-[#0B0F17] p-1 rounded-lg border border-slate-800 self-end sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`
                px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200
                ${timeRange === r 
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="date_label" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontSize: '12px'
              }}
              formatter={(val) => [`${val}%`, 'Health Score']}
            />
            <Area
              type="monotone"
              dataKey="health_score"
              stroke="#10B981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#healthGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
