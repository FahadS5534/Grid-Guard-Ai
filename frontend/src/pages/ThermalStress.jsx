import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import ThermalGauge from '../components/gauges/ThermalGauge';
import ThermalTrendChart from '../components/charts/ThermalTrendChart';
import { useTransformer } from '../context/TransformerContext';
import { api } from '../services/api';

export default function ThermalStress() {
  const { selectedTransformer, timeRange, setTimeRange } = useTransformer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getThermalStress(selectedTransformer, timeRange)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load thermal stress data:', err);
        setError(err.message || 'Unable to load thermal stress data.');
        setLoading(false);
      });
  }, [selectedTransformer, timeRange]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Header 
          title="Thermal Stress" 
          subtitle="Impact of high ambient temperature on transformer" 
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-800/40 rounded-xl" />
          <div className="lg:col-span-2 h-64 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Header 
          title="Thermal Stress" 
          subtitle="Impact of high ambient temperature on transformer" 
        />
        <div className="gridguard-card p-6 border-l-4 border-red-500 bg-red-950/20 text-slate-200">
          <h3 className="text-base font-bold text-red-400 mb-1">Thermal Stress Data Unavailable</h3>
          <p className="text-xs text-slate-400">{error || 'No thermal stress telemetry recorded.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Thermal Stress" 
        subtitle={`Impact of ambient temperature on ${data.transformer_id || selectedTransformer}`} 
      />

      {/* Top Layout: Thermal Stress Level Gauge + Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thermal Stress Level Gauge Card */}
        <div className="gridguard-card p-6 flex flex-col justify-between items-center text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start">
            Thermal Stress Level
          </span>
          <ThermalGauge 
            value={data.stress_index ?? 0} 
            level={data.thermal_stress_level || 'Low'} 
          />
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-2 gridguard-card p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Summary
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Ambient Temperature</span>
              <span className="text-lg font-bold text-amber-400">
                {data.summary ? data.summary.ambient_temperature : '--'} °C
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Transformer Temperature</span>
              <span className="text-lg font-bold text-red-400">
                {data.summary ? data.summary.transformer_temperature : '--'} °C
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Temperature Rise</span>
              <span className="text-lg font-bold text-cyan-400">
                {data.summary ? data.summary.temperature_rise : '--'} °C
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Thermal Stress Index</span>
              <span className="text-lg font-bold text-purple-400">
                {data.summary ? data.summary.thermal_stress_index : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thermal Stress Trend Chart */}
      <ThermalTrendChart
        data={data.trend || []}
        timeRange={timeRange}
        onRangeChange={setTimeRange}
      />

      {/* Stress Level Guide */}
      <div className="gridguard-card p-5">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
          Stress Level Guide
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <div>
              <span className="font-bold text-emerald-400">Low</span>
              <p className="text-slate-400 mt-0.5">0 – 0.33</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <div>
              <span className="font-bold text-amber-400">Moderate</span>
              <p className="text-slate-400 mt-0.5">0.34 – 0.66</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <div>
              <span className="font-bold text-red-400">High</span>
              <p className="text-slate-400 mt-0.5">0.67 – 1.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
