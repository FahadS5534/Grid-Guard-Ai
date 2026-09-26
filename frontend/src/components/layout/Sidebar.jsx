import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Activity, 
  Globe, 
  Thermometer, 
  Cpu, 
  Wrench, 
  BellRing,
  LogOut,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Monitoring', path: '/live-monitoring', icon: Activity },
  { name: 'El Niño Monitor', path: '/el-nino-monitor', icon: Globe },
  { name: 'Thermal Stress', path: '/thermal-stress', icon: Thermometer },
  { name: 'AI Anomaly Detection', path: '/ai-anomaly-detection', icon: Cpu },
  { name: 'Predictive Maintenance', path: '/predictive-maintenance', icon: Wrench },
  { name: 'Alerts & Reports', path: '/alerts-reports', icon: BellRing },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`
      fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#0A0E17] border-r border-slate-800/80
      flex flex-col justify-between transition-transform duration-300 md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Shield className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1">
              GridGuard <span className="text-purple-400">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">POWER GRID INFRASTRUCTURE</p>
          </div>
        </div>

        {/* Navigation Order */}
        <nav className="mt-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'nav-active text-purple-300 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}
                `}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User / Logout Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
