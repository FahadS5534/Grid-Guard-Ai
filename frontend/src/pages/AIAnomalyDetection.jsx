import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import ReconstructionScatterChart from '../components/charts/ReconstructionScatterChart';
import { AlertTriangle, Thermometer, Activity, Zap, ShieldCheck } from 'lucide-react';
import { useTransformer } from '../context/TransformerContext';
import { api } from '../services/api';

export default function AIAnomalyDetection() {
  const { selectedTransformer } = useTransformer();
  const [anomaly, setAnomaly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getAnomalyStatus(selectedTransformer)
      .then(res => {
        setAnomaly(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load anomaly status:', err);
        setError(err.message || 'Unable to load current ML status.');
        setLoading(false);
      });
  }, [selectedTransformer]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Header 
          title="AI Anomaly Detection" 
          subtitle="Autoencoder-based anomaly detection" 
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-40 bg-slate-800/40 rounded-xl" />
          <div className="h-40 bg-slate-800/40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-800/40 rounded-xl" />
          <div className="h-48 bg-slate-800/40 rounded-xl" />
          <div className="h-48 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header 
          title="AI Anomaly Detection" 
          subtitle="Autoencoder-based anomaly detection" 
        />
        <div className="gridguard-card p-6 border-l-4 border-red-500 bg-red-950/20 text-slate-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-red-400">Unable to load current ML status</h3>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!anomaly || !anomaly.current_result) {
    return (
      <div className="space-y-6">
        <Header 
          title="AI Anomaly Detection" 
          subtitle="Autoencoder-based anomaly detection" 
        />
        <div className="gridguard-card p-6 text-center text-slate-400 text-xs">
          No anomaly detection telemetry available for current transformer.
        </div>
      </div>
    );
  }

  const curr = anomaly.current_result;
  const isAnomaly = curr.is_anomaly;
  const raw = curr.raw_features || {};

  const timeString = curr.timestamp 
    ? new Date(curr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <div className="space-y-6">
      <Header 
        title="AI Anomaly Detection" 
        subtitle={`LSTM Autoencoder ML inference for ${curr.transformer_id || selectedTransformer}`} 
      />

      {/* Top 2 Cards: Anomaly Score + Model Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Score Card */}
        <div className="gridguard-card p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anomaly Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-white">{(curr.anomaly_score || 0).toFixed(4)}</span>
              <span className="text-sm text-slate-400 font-medium">/ 1.00</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isAnomaly ? 'bg-red-500 text-white glow-red' : 'bg-emerald-500 text-white'}`}>
                {curr.status || (isAnomaly ? 'Anomaly Detected' : 'Normal')}
              </span>
              <span className="text-xs text-slate-400">
                Reconstruction Error: <span className="font-bold text-slate-200">{(curr.reconstruction_error || 0).toFixed(4)}</span> (Threshold: {(curr.threshold || 0.2432).toFixed(4)})
              </span>
            </div>
          </div>
        </div>

        {/* Model Status Card */}
        <div className="gridguard-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model Status</span>
            <h3 className="text-2xl font-bold text-white mt-1">LSTM Autoencoder</h3>
            <p className="text-xs text-slate-300 mt-1">{anomaly.model_status || 'Frozen Model - Active Inference'}</p>
          </div>

          {/* Animated Neural Network Nodes SVG */}
          <div className="w-24 h-24 relative flex items-center justify-center">
            <svg className="w-full h-full text-cyan-400" viewBox="0 0 100 100" fill="none">
              <line x1="20" y1="30" x2="50" y2="20" stroke="#7C3AED" strokeWidth="1.5" />
              <line x1="20" y1="30" x2="50" y2="50" stroke="#7C3AED" strokeWidth="1.5" />
              <line x1="20" y1="70" x2="50" y2="50" stroke="#7C3AED" strokeWidth="1.5" />
              <line x1="20" y1="70" x2="50" y2="80" stroke="#7C3AED" strokeWidth="1.5" />
              
              <line x1="50" y1="20" x2="80" y2="50" stroke="#00F0FF" strokeWidth="1.5" />
              <line x1="50" y1="50" x2="80" y2="50" stroke="#00F0FF" strokeWidth="1.5" />
              <line x1="50" y1="80" x2="80" y2="50" stroke="#00F0FF" strokeWidth="1.5" />

              <circle cx="20" cy="30" r="5" fill="#10B981" />
              <circle cx="20" cy="70" r="5" fill="#10B981" />
              <circle cx="50" cy="20" r="5" fill="#7C3AED" className="animate-pulse" />
              <circle cx="50" cy="50" r="6" fill="#00F0FF" className="animate-ping" />
              <circle cx="50" cy="50" r="5" fill="#00F0FF" />
              <circle cx="50" cy="80" r="5" fill="#7C3AED" className="animate-pulse" />
              <circle cx="80" cy="50" r="5" fill={isAnomaly ? '#EF4444' : '#10B981'} />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle Grid: Input Features + Reconstruction Error + Detection Result */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Features (3 ML Model Features) */}
        <div className="gridguard-card p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">3 Model ML Input Features</h4>
          
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800">
            <Thermometer className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400">Temp / Deviation</p>
              <p className="text-sm font-bold text-white">{raw.temperature ?? '--'} °C <span className="text-xs font-medium text-slate-400">({(curr.temperature_deviation ?? 0).toFixed(1)}°C dev)</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400">Load Current</p>
              <p className="text-sm font-bold text-white">{raw.current ?? '--'} A</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800">
            <Activity className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400">Voltage</p>
              <p className="text-sm font-bold text-white">{raw.voltage ?? '--'} V</p>
            </div>
          </div>
        </div>

        {/* Reconstruction Error Scatter Chart */}
        <div className="md:col-span-1">
          <ReconstructionScatterChart data={anomaly.reconstruction_history || []} />
        </div>

        {/* Detection Result Card */}
        <div className="gridguard-card p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detection Result</h4>
            <div className="flex items-center gap-3 mt-4">
              {isAnomaly ? (
                <>
                  <span className="text-2xl font-black text-red-500 tracking-tight">Anomaly Detected</span>
                  <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight">Normal State</span>
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-[11px] text-slate-400">Time Evaluated</p>
            <p className="text-sm font-bold text-white mt-0.5">{timeString}</p>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className={`gridguard-card p-5 border-l-4 ${isAnomaly ? 'border-red-500 bg-red-950/10' : 'border-emerald-500 bg-emerald-950/10'}`}>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">ML Inference Explanation</h4>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {curr.explanation}
        </p>
      </div>
    </div>
  );
}
