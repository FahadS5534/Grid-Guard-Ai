import React from 'react';

export default function Transformer3DView({ temperature = 68.4, vibration = 2.35, current = 156.8, humidity = 54 }) {
  return (
    <div className="gridguard-card p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-cyan-900/10 to-transparent pointer-events-none" />

      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 self-start">
        Transformer 3D View
      </h3>

      {/* Industrial Transformer SVG / 3D Isometric Rendering */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Animated Rotating Field Rings */}
        <div className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full animate-[spin_12s_linear_infinite]" />
        <div className="absolute inset-3 border border-purple-500/30 rounded-full animate-[spin_8s_linear_infinite_reverse]" />

        {/* Transformer Core Body Graphic */}
        <svg className="w-40 h-40 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" viewBox="0 0 200 200" fill="none">
          {/* Base Tank */}
          <rect x="35" y="70" width="130" height="100" rx="8" fill="#1E293B" stroke="#00F0FF" strokeWidth="2" />
          
          {/* Cooling Fins / Radiator Panels */}
          <line x1="20" y1="85" x2="35" y2="85" stroke="#7C3AED" strokeWidth="4" />
          <line x1="20" y1="110" x2="35" y2="110" stroke="#7C3AED" strokeWidth="4" />
          <line x1="20" y1="135" x2="35" y2="135" stroke="#7C3AED" strokeWidth="4" />
          
          <line x1="165" y1="85" x2="180" y2="85" stroke="#7C3AED" strokeWidth="4" />
          <line x1="165" y1="110" x2="180" y2="110" stroke="#7C3AED" strokeWidth="4" />
          <line x1="165" y1="135" x2="180" y2="135" stroke="#7C3AED" strokeWidth="4" />

          {/* High Voltage Bushings */}
          <rect x="55" y="30" width="16" height="40" rx="2" fill="#334155" stroke="#00F0FF" strokeWidth="1.5" />
          <rect x="92" y="20" width="16" height="50" rx="2" fill="#334155" stroke="#00F0FF" strokeWidth="1.5" />
          <rect x="129" y="30" width="16" height="40" rx="2" fill="#334155" stroke="#00F0FF" strokeWidth="1.5" />

          {/* Bushing Cap Nodes (Glowing Points) */}
          <circle cx="63" cy="25" r="5" fill="#EF4444" className="animate-ping" />
          <circle cx="63" cy="25" r="4" fill="#EF4444" />
          
          <circle cx="100" cy="15" r="5" fill="#22C55E" />
          <circle cx="100" cy="15" r="4" fill="#22C55E" />

          <circle cx="137" cy="25" r="5" fill="#EF4444" className="animate-ping" />
          <circle cx="137" cy="25" r="4" fill="#EF4444" />

          {/* Inner Magnetic Core Winding Indicator */}
          <rect x="55" y="90" width="90" height="60" rx="4" fill="#0F172A" stroke="#7C3AED" strokeWidth="1.5" />
          <path d="M 65 120 Q 80 100 100 120 T 135 120" stroke="#22D3EE" strokeWidth="2.5" fill="none" className="animate-pulse" />

          {/* Core Temperature Pulsing Glow */}
          <circle cx="100" cy="120" r="25" fill="#EF4444" fillOpacity="0.15" className="animate-pulse" />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-xs text-slate-400 font-medium">Digital Twin Sync Active</span>
      </div>
    </div>
  );
}
