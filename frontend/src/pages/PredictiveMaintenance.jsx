import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import RiskGauge from '../components/gauges/RiskGauge';
import { CheckCircle2, AlertTriangle, Calendar, ShieldAlert } from 'lucide-react';
import { useTransformer } from '../context/TransformerContext';
import { api } from '../services/api';

export default function PredictiveMaintenance() {
  const { selectedTransformer } = useTransformer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getMaintenanceRecommendations(selectedTransformer)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load maintenance data:', err);
        setError(err.message || 'Unable to load maintenance recommendations.');
        setLoading(false);
      });
  }, [selectedTransformer]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Header 
          title="Predictive Maintenance" 
          subtitle="Maintenance recommendations based on AI analysis" 
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-800/40 rounded-xl" />
          <div className="h-48 bg-slate-800/40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-40 bg-slate-800/40 rounded-xl" />
          <div className="h-40 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header 
          title="Predictive Maintenance" 
          subtitle="Maintenance recommendations based on AI analysis" 
        />
        <div className="gridguard-card p-6 border-l-4 border-red-500 bg-red-950/20 text-slate-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-red-400">Unable to load predictive maintenance status</h3>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Header 
          title="Predictive Maintenance" 
          subtitle="Maintenance recommendations based on AI analysis" 
        />
        <div className="gridguard-card p-6 text-center text-slate-400 text-xs">
          No maintenance recommendations available for current transformer.
        </div>
      </div>
    );
  }

  const riskLevelColor = (data.risk_level || '').toLowerCase().includes('high') || (data.risk_level || '').toLowerCase().includes('critical') 
    ? 'text-red-500' 
    : (data.risk_level || '').toLowerCase().includes('medium') || (data.risk_level || '').toLowerCase().includes('moderate')
    ? 'text-amber-400' 
    : 'text-emerald-400';

  return (
    <div className="space-y-6">
      <Header 
        title="Predictive Maintenance" 
        subtitle={`AI maintenance recommendations for ${data.transformer_id || selectedTransformer}`} 
      />

      {/* Top Section: Maintenance Risk + Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Risk Card */}
        <div className="gridguard-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Maintenance Risk</span>
            <h2 className={`text-3xl font-black ${riskLevelColor} mt-2 tracking-tight`}>{data.risk_level}</h2>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-medium">Risk Score</p>
              <p className="text-2xl font-black text-white mt-0.5">{data.risk_score}%</p>
            </div>
          </div>

          <RiskGauge percentage={data.risk_score} level={data.risk_level} />
        </div>

        {/* Recommended Actions Card */}
        <div className="gridguard-card p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
            Recommended Actions
          </h3>

          <div className="space-y-2.5">
            {data.recommended_actions && data.recommended_actions.length > 0 ? (
              data.recommended_actions.map((act, index) => (
                <div key={index} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800">
                  {index === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-slate-200">{act}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No immediate maintenance actions required.</p>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Reason + Next Inspection Suggested */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reason Card */}
        <div className="lg:col-span-2 gridguard-card p-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Reason</h3>
          {data.reasons && data.reasons.length > 0 ? (
            <ul className="space-y-3">
              {data.reasons.map((r, index) => (
                <li key={index} className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Transformer operating within nominal thresholds.</p>
          )}
        </div>

        {/* Next Inspection Suggested Card */}
        <div className="gridguard-card p-6 flex flex-col justify-between items-center text-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start">
            Next Inspection Suggested
          </h3>

          <div className="my-4 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <span className="text-xs text-slate-400">Timeframe</span>
            <span className="text-2xl font-black text-purple-300 mt-0.5">{data.suggested_timeframe}</span>
          </div>
        </div>
      </div>

      {/* Bottom Assurance Banner */}
      <div className="gridguard-card p-5 border-l-4 border-emerald-500 flex items-center gap-4">
        <ShieldAlert className="w-6 h-6 text-emerald-400 shrink-0" />
        <p className="text-xs text-slate-200 font-medium">
          System-Generated Recommendations: Timely maintenance based on LSTM Autoencoder reconstruction evaluation prevents failure under El Niño thermal stress.
        </p>
      </div>
    </div>
  );
}
