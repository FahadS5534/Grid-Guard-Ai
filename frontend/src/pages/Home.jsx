import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Activity, Wrench, Shield, Sun, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [env, setEnv] = useState({ ambient_temperature: 31.0, condition: 'Clear Sky' });
  const [stats, setStats] = useState({ transformers: 2, alerts: 3, status: 'Online' });

  useEffect(() => {
    api.getEnvironmentCurrent()
      .then(res => setEnv(res))
      .catch(err => console.error(err));
      
    api.getDashboardSummary()
      .then(res => setStats(prev => ({ ...prev, alerts: res.active_alerts_count })))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Top Navigation / Weather Header */}
      <header className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Shield className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <h1 className="font-bold text-xl text-white tracking-wide">
            GridGuard <span className="text-purple-400">AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-[#121827] border border-slate-700/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>{env.ambient_temperature}°C</span>
          <span className="text-slate-400 font-normal">{env.condition}</span>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="my-12 z-10 max-w-5xl">
        {/* Subtle grid backdrop decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Industrial Predictive Maintenance Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight max-w-4xl">
            AI-Based Predictive Maintenance for Power Grid Infrastructure under{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              El Niño induced Thermal Stress
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Monitoring transformer health in real-time using IoT sensors, climate data and AI anomaly detection.
            Protecting high-voltage power transmission assets from climate-induced failure risks.
          </p>

          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all duration-200 group"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* 3 Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {/* Card 1 */}
          <div className="gridguard-card p-6 border-purple-500/20 hover:border-purple-500/40">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">IoT Sensors</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time temperature, vibration, load current, and humidity telemetry streams captured continuously.
            </p>
          </div>

          {/* Card 2 */}
          <div className="gridguard-card p-6 border-purple-500/20 hover:border-purple-500/40">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Anomaly Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autoencoder model trained to detect subtle abnormal operational patterns and reconstruction errors.
            </p>
          </div>

          {/* Card 3 */}
          <div className="gridguard-card p-6 border-purple-500/20 hover:border-purple-500/40">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Predictive Maintenance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Early alerts and actionable maintenance recommendations to prevent catastrophic grid failures.
            </p>
          </div>
        </div>
      </main>

      {/* System Status Footer Bar */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80 text-xs text-slate-400 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>System Status: <strong className="text-emerald-400">Online</strong></span>
          </div>
          <div>Transformers Monitored: <strong className="text-white">2 Active</strong></div>
          <div>Active Alerts: <strong className="text-amber-400">{stats.alerts}</strong></div>
        </div>
        <div>© 2025 GridGuard AI • All Rights Reserved</div>
      </footer>
    </div>
  );
}
