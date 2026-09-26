import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function SeaSurfaceChart({ data }) {
  return (
    <div className="gridguard-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">Sea Surface Temperature (°C)</p>
          <h3 className="text-2xl font-bold text-cyan-400 mt-0.5">
            29.1 °C <span className="text-xs text-cyan-300/80 font-normal">Above Normal</span>
          </h3>
        </div>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="sstGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis domain={[25, 32]} stroke="#64748B" fontSize={11} tickLine={false} unit="°C" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontSize: '12px'
              }}
              formatter={(val) => [`${val} °C`, 'SST']}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#22D3EE"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#sstGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
