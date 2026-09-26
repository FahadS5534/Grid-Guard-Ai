import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import SeaSurfaceChart from '../components/charts/SeaSurfaceChart';
import { Sun, Droplets, Wind, Gauge, Flame, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ElNinoMonitor() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getEnvironmentSummary(),
      api.getEnvironmentHistory().catch(() => ({ sea_surface_temperature_trend: [] }))
    ])
      .then(([sumRes, histRes]) => {
        setSummary(sumRes);
        setHistory(histRes.sea_surface_temperature_trend || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load environment summary:', err);
        setError(err.message || 'Unable to load environment data.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Header 
          title="El Niño Monitor" 
          subtitle="Climate and environmental conditions tracking" 
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-800/40 rounded-xl" />
          <div className="lg:col-span-2 h-64 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-6">
        <Header 
          title="El Niño Monitor" 
          subtitle="Climate and environmental conditions tracking" 
        />
        <div className="gridguard-card p-6 border-l-4 border-red-500 bg-red-950/20 text-slate-200">
          <h3 className="text-base font-bold text-red-400 mb-1">Environment Data Unavailable</h3>
          <p className="text-xs text-slate-400">{error || 'Unable to connect to environmental service.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="El Niño Monitor" 
        subtitle="Climate and environmental conditions tracking" 
      />

      {/* Top Section: El Niño Status Card + Sea Surface Temperature Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* El Niño Status Card */}
        <div className="gridguard-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">El Niño Status</span>
            <h2 className="text-3xl font-black text-amber-400 mt-2 tracking-tight">
              {summary.status || 'Active'}
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {summary.intensity || 'El Niño conditions observed.'}
            </p>
          </div>

          {/* Atmospheric Swirl Graphic Effect */}
          <div className="my-6 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-600/30 to-red-600/40 flex items-center justify-center animate-[spin_20s_linear_infinite] border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Flame className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
            Source: NOAA / Regional Climate Center
          </div>
        </div>

        {/* Sea Surface Temperature Chart */}
        <div className="lg:col-span-2">
          <SeaSurfaceChart data={history} />
        </div>
      </div>

      {/* Environmental Conditions Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Environmental Conditions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ambient Temp */}
          <div className="gridguard-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Ambient Temp</p>
              <h4 className="text-lg font-bold text-white mt-0.5">{summary.current_temp ?? '--'} °C</h4>
            </div>
          </div>

          {/* Humidity */}
          <div className="gridguard-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Humidity</p>
              <h4 className="text-lg font-bold text-white mt-0.5">{summary.humidity ?? '--'} %</h4>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="gridguard-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Wind Speed</p>
              <h4 className="text-lg font-bold text-white mt-0.5">{summary.wind_speed ?? '--'} km/h</h4>
            </div>
          </div>

          {/* Pressure */}
          <div className="gridguard-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Pressure</p>
              <h4 className="text-lg font-bold text-white mt-0.5">{summary.pressure ?? '--'} hPa</h4>
            </div>
          </div>
        </div>
      </div>

      {/* El Niño Outlook Card */}
      <div className="gridguard-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">El Niño Outlook</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {summary.outlook || 'El Niño conditions are likely to persist in the coming months, which may increase thermal stress on power grid infrastructure.'}
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-all shrink-0">
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
