import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import StatCard from '../components/cards/StatCard';
import SensorCard from '../components/cards/SensorCard';
import HealthTrendChart from '../components/charts/HealthTrendChart';
import { Cpu, ShieldCheck, HeartPulse, Clock, Thermometer, Activity, Zap, Droplet } from 'lucide-react';
import { useTransformer } from '../context/TransformerContext';
import { api } from '../services/api';

export default function Dashboard() {
  const { selectedTransformer, timeRange, setTimeRange } = useTransformer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getDashboardSummary(selectedTransformer, timeRange)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard summary:', err);
        setError(err.message || 'Unable to load current ML status.');
        setLoading(false);
      });
  }, [selectedTransformer, timeRange]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-800/40 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-800/40 rounded-xl" />)}
        </div>
        <div className="h-64 bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header 
          title="Dashboard" 
          subtitle="Overview of Transformer Health" 
        />
        <div className="gridguard-card p-6 border-l-4 border-red-500 bg-red-950/20 text-slate-200">
          <h3 className="text-base font-bold text-red-400 mb-1">Unable to load current ML status</h3>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Header 
          title="Dashboard" 
          subtitle="Overview of Transformer Health" 
        />
        <div className="gridguard-card p-6 text-center text-slate-400 text-xs">
          No recent telemetry available for selected transformer.
        </div>
      </div>
    );
  }

  const lastUpdatedParts = (data.last_updated || 'Just now').split('\n');

  return (
    <div className="space-y-6">
      <Header 
        title="Dashboard" 
        subtitle={`Overview of Transformer ${data.transformer_id || selectedTransformer} Health`} 
      />

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Cpu}
          label="Transformer ID"
          value={data.transformer_id || selectedTransformer}
          colorScheme="green"
        />
        <StatCard
          icon={ShieldCheck}
          label="Status"
          value={data.status || 'Normal'}
          colorScheme={data.status === 'Critical' ? 'red' : data.status === 'Warning' ? 'amber' : 'blue'}
        />
        <StatCard
          icon={HeartPulse}
          label="Health Score"
          value={`${data.health_score ?? 100}%`}
          colorScheme="purple"
        />
        <StatCard
          icon={Clock}
          label="Last Updated"
          value={lastUpdatedParts[0]}
          subvalue={lastUpdatedParts[1] || ''}
          colorScheme="amber"
        />
      </div>

      {/* Key Parameters Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Key Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SensorCard
            icon={Thermometer}
            label="Temperature"
            value={data.temperature ?? '--'}
            unit="°C"
            color="emerald"
          />
          <SensorCard
            icon={Activity}
            label="Vibration"
            value={data.vibration ?? '--'}
            unit="mm/s"
            color="cyan"
          />
          <SensorCard
            icon={Zap}
            label="Load Current"
            value={data.load_current ?? '--'}
            unit="A"
            color="amber"
          />
          <SensorCard
            icon={Droplet}
            label="Humidity"
            value={data.humidity ?? '--'}
            unit="%"
            color="purple"
          />
        </div>
      </div>

      {/* Health Score Trend Chart */}
      <HealthTrendChart
        data={data.health_trend || []}
        timeRange={timeRange}
        onRangeChange={setTimeRange}
      />
    </div>
  );
}
