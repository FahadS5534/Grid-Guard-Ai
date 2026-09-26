import React, { useState } from 'react';
import { Bell, User, Menu, Zap, CheckCircle2 } from 'lucide-react';
import { useTransformer } from '../../context/TransformerContext';
import { api } from '../../services/api';

export default function Header({ title, subtitle, onMenuClick }) {
  const { selectedTransformer, setSelectedTransformer, transformers } = useTransformer();
  const [simulating, setSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await api.triggerSimulateTick(selectedTransformer);
      setSimSuccess(true);
      setTimeout(() => setSimSuccess(false), 2500);
    } catch (e) {
      console.error('Simulation trigger failed:', e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg bg-slate-800/60 text-slate-300 md:hidden hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Transformer Selector */}
        <select
          value={selectedTransformer}
          onChange={(e) => setSelectedTransformer(e.target.value)}
          className="bg-[#121827] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
        >
          {transformers.length > 0 ? (
            transformers.map((tx) => (
              <option key={tx.id} value={tx.transformer_code}>
                {tx.transformer_code} - {tx.name}
              </option>
            ))
          ) : (
            <option value="TX-101">TX-101 - Main Substation</option>
          )}
        </select>

        {/* Developer Simulator Button */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
            ${simSuccess 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
              : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/40'}
          `}
          title="Trigger realistic dev telemetry stream"
        >
          {simSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ingested ⚡</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate Telemetry</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative p-2 rounded-lg bg-[#121827] border border-slate-700/80 text-slate-300 hover:text-white cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        </div>

        {/* User Profile */}
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
