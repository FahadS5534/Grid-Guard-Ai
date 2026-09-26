import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ThermalTrendChart({ data, timeRange, onRangeChange }) {
  const ranges = ['24 Hours', '7 Days', '30 Days'];

  return (
    <div className="gridguard-card p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Thermal Stress Trend</h3>
          <p className="text-xs text-slate-400">Historical System Thermal Stress Index baseline</p>
        </div>

        <div className="flex bg-[#0B0F17] p-1 rounded-lg border border-slate-800">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`
                px-2.5 py-1 text-xs font-semibold rounded-md transition-all
                ${timeRange === r 
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' 
                  : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="thermalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="date_label" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis domain={[0, 1.0]} stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontSize: '12px'
              }}
              formatter={(val) => [val, 'Thermal Stress Index']}
            />
            <Area
              type="monotone"
              dataKey="stress_index"
              stroke="#EF4444"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#thermalGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
