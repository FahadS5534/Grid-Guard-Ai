import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Sun, Droplets, Wind, Gauge, Flame, Info, Globe, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { useTransformer } from '../context/TransformerContext';
import { api } from '../services/api';

export default function ElNinoMonitor() {
  const { selectedTransformer } = useTransformer();
  const [summary, setSummary] = useState(null);
  const [oniHistory, setOniHistory] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [transformerStatus, setTransformerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getEnvironmentSummary(),
      api.getOniHistory().catch(() => ({ oni_history: [] })),
      api.getAnomalyStatus(selectedTransformer).catch(() => null)
    ])
      .then(([sumRes, oniRes, anomalyRes]) => {
        setSummary(sumRes);
        setOniHistory(oniRes.oni_history || []);
        if (oniRes.oni_history && oniRes.oni_history.length > 0) {
          setSelectedPeriod(oniRes.oni_history[oniRes.oni_history.length - 1]);
        }
        setTransformerStatus(anomalyRes ? anomalyRes.current_result : null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load environment summary:', err);
        setError('ONI dataset is currently unavailable. Unable to connect to the environmental-data service.');
        setLoading(false);
      });
  }, [selectedTransformer]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Header 
          title="El Niño & Climate Monitor" 
          subtitle="Oceanic Niño Index (ONI) and environmental context tracking" 
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
          title="El Niño & Climate Monitor" 
          subtitle="Oceanic Niño Index (ONI) and environmental context tracking" 
        />
        <div className="gridguard-card p-6 border-l-4 border-red-500 bg-red-950/20 text-slate-200">
          <h3 className="text-base font-bold text-red-400 mb-1">Environment Data Unavailable</h3>
          <p className="text-xs text-slate-400">ONI dataset is currently unavailable. Unable to connect to the environmental-data service.</p>
        </div>
      </div>
    );
  }

  const activePeriod = selectedPeriod || {
    period: 'DJF 2025/2026',
    oni: summary.oni || 1.4,
    condition: summary.status || 'El Niño (Moderate)',
    sst_anomaly: summary.sea_surface_anomaly || '+1.4°C'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Header 
          title="El Niño & Climate Monitor" 
          subtitle="Oceanic Niño Index (ONI) dataset and regional environmental context" 
        />
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          ENVIRONMENTAL CONTEXT
        </span>
      </div>

      {/* Prominent Environmental Context Disclaimer */}
      <div className="gridguard-card p-4 border-l-4 border-amber-500 bg-amber-950/20 text-slate-200 flex items-center gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-amber-300">Environmental Context Notice: </span>
          El Niño / ONI dataset readings provide regional environmental context during transformer monitoring. El Niño conditions may elevate ambient temperatures and heatwave thermal stress, but ONI is <span className="font-bold text-white underline">NOT an input feature</span> to the frozen 3-feature LSTM Autoencoder model.
        </div>
      </div>

      {/* Top Section: ONI Status Card + ONI Historical Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current ONI Status Card */}
        <div className="gridguard-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Oceanic Niño Index (ONI)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-amber-400">{activePeriod.oni > 0 ? `+${activePeriod.oni}` : activePeriod.oni}</span>
              <span className="text-xs text-slate-400">3-Month Running Mean</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-2">{activePeriod.condition}</h3>
            <p className="text-xs text-slate-400 mt-1">Period: <span className="text-slate-200 font-semibold">{activePeriod.period}</span></p>
          </div>

          {/* Atmospheric Swirl Graphic Effect */}
          <div className="my-4 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-600/30 to-red-600/40 flex items-center justify-center animate-[spin_20s_linear_infinite] border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <Flame className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 flex items-center justify-between">
            <span>NOAA CPC ONI Dataset</span>
            <span className="text-amber-400 font-bold">{activePeriod.sst_anomaly}</span>
          </div>
        </div>

        {/* ONI Historical Line Chart */}
        <div className="lg:col-span-2 gridguard-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Oceanic Niño Index (ONI) Dataset Trend</h3>
              <p className="text-xs text-slate-400">Pacific Sea Surface Temperature Anomaly Thresholds (+0.5°C El Niño / -0.5°C La Niña)</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oniHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="oniGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[-1.5, 2.5]} stroke="#64748B" fontSize={11} tickLine={false} unit="°C" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                  formatter={(val, name, props) => [`${val > 0 ? '+' : ''}${val}°C (${props.payload.condition})`, 'ONI Anomaly']}
                  labelFormatter={(lbl, payload) => payload[0] ? payload[0].payload.period : lbl}
                />
                <ReferenceLine y={0.5} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'El Niño Threshold (+0.5°C)', fill: '#EF4444', fontSize: 10 }} />
                <ReferenceLine y={-0.5} stroke="#3B82F6" strokeDasharray="3 3" label={{ value: 'La Niña Threshold (-0.5°C)', fill: '#3B82F6', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="oni"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#oniGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Integrated View: Transformer AI + Environmental Context (Side-by-Side) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Integrated Monitoring View — Transformer AI vs Environmental Context
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Side 1: TRANSFORMER AI */}
          <div className="gridguard-card p-5 border-l-4 border-purple-500 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                TRANSFORMER AI ({selectedTransformer})
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                FROZEN MODEL
              </span>
            </div>

            {transformerStatus ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                  <span className="text-slate-400">Anomaly Status:</span>
                  <span className={`font-bold ${transformerStatus.is_anomaly ? 'text-red-400' : 'text-emerald-400'}`}>
                    {transformerStatus.status || (transformerStatus.is_anomaly ? 'ANOMALY DETECTED' : 'NORMAL')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                  <span className="text-slate-400">Health Score:</span>
                  <span className="font-bold text-purple-300">{transformerStatus.health_score}%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                  <span className="text-slate-400">Risk Category:</span>
                  <span className={`font-bold ${transformerStatus.risk_category === 'HIGH' || transformerStatus.risk_category === 'CRITICAL' ? 'text-red-500' : transformerStatus.risk_category === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {transformerStatus.risk_category}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                  <span className="text-slate-400">Reconstruction Error / Threshold:</span>
                  <span className="font-bold text-slate-200">
                    {transformerStatus.reconstruction_error} / {transformerStatus.threshold}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Transformer telemetry status loading...</p>
            )}
          </div>

          {/* Side 2: ENVIRONMENTAL CONTEXT */}
          <div className="gridguard-card p-5 border-l-4 border-amber-500 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                ENVIRONMENTAL CONTEXT
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                CLIMATE MONITOR
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                <span className="text-slate-400">ENSO Condition:</span>
                <span className="font-bold text-amber-300">{activePeriod.condition}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                <span className="text-slate-400">ONI Value:</span>
                <span className="font-bold text-amber-400">{activePeriod.oni > 0 ? `+${activePeriod.oni}` : activePeriod.oni}°C</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                <span className="text-slate-400">Observation Period:</span>
                <span className="font-bold text-slate-200">{activePeriod.period}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                <span className="text-slate-400">Ambient Weather:</span>
                <span className="font-bold text-slate-200">{summary.current_temp}°C | {summary.humidity}% Humidity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical ONI Period Inspector Table */}
      <div className="gridguard-card p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">NOAA ONI Historical Dataset Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F17] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Period</th>
                <th className="p-3">ONI Value</th>
                <th className="p-3">ENSO Condition</th>
                <th className="p-3">SST Anomaly</th>
                <th className="p-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {oniHistory.map((rec, i) => (
                <tr key={i} className={`hover:bg-slate-800/30 transition-colors ${selectedPeriod?.period === rec.period ? 'bg-amber-500/10' : ''}`}>
                  <td className="p-3 font-semibold text-white">{rec.period}</td>
                  <td className="p-3 font-bold text-amber-400">{rec.oni > 0 ? `+${rec.oni}` : rec.oni}°C</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${rec.oni >= 0.5 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : rec.oni <= -0.5 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {rec.condition}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{rec.sst_anomaly}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedPeriod(rec)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 text-[11px] font-bold border border-slate-700 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
