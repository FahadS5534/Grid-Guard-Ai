import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, Check } from 'lucide-react';

export default function AlertRow({ alert, onAcknowledge }) {
  const severities = {
    CRITICAL: {
      bg: 'bg-red-500/10 border-red-500/30',
      icon: AlertTriangle,
      iconColor: 'text-red-400 bg-red-500/20',
      badgeBg: 'bg-red-500/20 text-red-400'
    },
    HIGH: {
      bg: 'bg-orange-500/10 border-orange-500/30',
      icon: AlertCircle,
      iconColor: 'text-orange-400 bg-orange-500/20',
      badgeBg: 'bg-orange-500/20 text-orange-400'
    },
    WARNING: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      icon: AlertCircle,
      iconColor: 'text-amber-400 bg-amber-500/20',
      badgeBg: 'bg-amber-500/20 text-amber-400'
    },
    INFO: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-500/20',
      badgeBg: 'bg-emerald-500/20 text-emerald-400'
    }
  };

  const style = severities[alert.severity] || severities.INFO;
  const Icon = style.icon;

  const formattedTime = alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:24 AM';
  const formattedDate = alert.timestamp ? new Date(alert.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 25, 2025';

  return (
    <div className={`p-4 rounded-xl border ${style.bg} flex items-start justify-between gap-4 transition-all duration-200`}>
      <div className="flex items-start gap-3.5">
        <div className={`w-10 h-10 rounded-xl ${style.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">{alert.title}</h4>
            <span className="text-[11px] text-slate-400 font-medium">{formattedTime}</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">{alert.message}</p>
          <p className="text-[10px] text-slate-400 mt-1">{formattedDate} • Transformer {alert.transformer_id}</p>
        </div>
      </div>

      {!alert.acknowledged ? (
        <button
          onClick={() => onAcknowledge(alert.id)}
          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
        >
          Acknowledge
        </button>
      ) : (
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          Acknowledged
        </span>
      )}
    </div>
  );
}
