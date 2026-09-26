import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import SensorLineChart from '../components/charts/SensorLineChart';
import Transformer3DView from '../components/visualization/Transformer3DView';
import { Thermometer, Activity, Zap, Droplet, Radio } from 'lucide-react';
import { useTransformer } from '../context/TransformerContext';
import { api } from '../services/api';
import { TelemetryWebSocket } from '../services/websocket';

export default function LiveMonitoring() {
  const { selectedTransformer } = useTransformer();
  const [readings, setReadings] = useState(null);
  const [tempHistory, setTempHistory] = useState([]);
  const [vibHistory, setVibHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Initial fetch of dashboard summary and telemetry history
    Promise.all([
      api.getDashboardSummary(selectedTransformer),
      api.getTelemetryHistory(selectedTransformer, '24h').catch(() => [])
    ])
      .then(([summary, history]) => {
        setReadings({
          temperature: summary.temperature,
          vibration: summary.vibration,
          current: summary.load_current,
          humidity: summary.humidity,
          last_updated: new Date().toLocaleTimeString()
        });

        if (history && history.length > 0) {
          const formattedTemp = history.slice(-10).map(r => ({
            time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temp: r.temperature
          }));
          const formattedVib = history.slice(-10).map(r => ({
            time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            vib: r.vibration
          }));
          setTempHistory(formattedTemp);
          setVibHistory(formattedVib);
        } else {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setTempHistory([{ time: nowStr, temp: summary.temperature }]);
          setVibHistory([{ time: nowStr, vib: summary.vibration }]);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load initial telemetry:', err);
        setError(err.message || 'Unable to connect to telemetry service.');
        setLoading(false);
      });

    // Connect WebSocket
    const ws = new TelemetryWebSocket(selectedTransformer, (msg) => {
      if (msg.temperature !== undefined) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setReadings(prev => ({
          temperature: msg.temperature,
          vibration: msg.vibration ?? prev?.vibration,
          current: msg.current ?? msg.load_current ?? prev?.current,
          humidity: msg.humidity ?? prev?.humidity,
          last_updated: new Date().toLocaleTimeString()
        }));
        setTempHistory(prev => [...prev.slice(-9), { time: timeStr, temp: msg.temperature }]);
        if (msg.vibration !== undefined) {
          setVibHistory(prev => [...prev.slice(-9), { time: timeStr, vib: msg.vibration }]);
        }
      }
    });

    ws.connect();
    return () => ws.disconnect();
  }, [selectedTransformer]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Header 
          title="Live Monitoring" 
          subtitle="Real-time transformer sensor data stream" 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-800/40 rounded-xl" />
          <div className="h-44 bg-slate-800/40 rounded-xl" />
        </div>
        <div className="h-64 bg-slate-800/40 rounded-xl" />
      </div>
    );
  }

  if (error || !readings) {
    return (
      <div className="space-y-6">
        <Header 
          title="Live Monitoring" 
          subtitle="Real-time transformer sensor data stream" 
        />
        <div className="gridguard-card p-6 border-l-4 border-red-500 bg-red-950/20 text-slate-200">
          <h3 className="text-base font-bold text-red-400 mb-1">Telemetry Unavailable</h3>
          <p className="text-xs text-slate-400">{error || 'No telemetry data available for current transformer.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Header 
          title="Live Monitoring" 
          subtitle={`Real-time sensor stream for ${selectedTransformer}`} 
        />
      </div>

      {/* Top Sparkline Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SensorLineChart
          title="Temperature (°C)"
          data={tempHistory}
          dataKey="temp"
          color="#EF4444"
          unit="°C"
        />
        <SensorLineChart
          title="Vibration (mm/s)"
          data={vibHistory}
          dataKey="vib"
          color="#22D3EE"
          unit="mm/s"
        />
      </div>

      {/* Middle Section: Transformer 3D View + Side Sensor Readings Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Transformer3DView 
            temperature={readings.temperature}
            vibration={readings.vibration}
            current={readings.current}
            humidity={readings.humidity}
          />
        </div>

        {/* Side Sensor Readings Card */}
        <div className="gridguard-card p-6 flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Sensor Readings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
              <div className="flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-red-400" />
                <span className="text-xs text-slate-400 font-medium">Temperature</span>
              </div>
              <span className="text-lg font-bold text-white">{readings.temperature ?? '--'} °C</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span className="text-xs text-slate-400 font-medium">Vibration</span>
              </div>
              <span className="text-lg font-bold text-white">{readings.vibration ?? '--'} mm/s</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-slate-400 font-medium">Load Current</span>
              </div>
              <span className="text-lg font-bold text-white">{readings.current ?? '--'} A</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
              <div className="flex items-center gap-3">
                <Droplet className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-slate-400 font-medium">Humidity</span>
              </div>
              <span className="text-lg font-bold text-white">{readings.humidity ?? '--'} %</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Streaming Status Bar */}
      <div className="gridguard-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">Data Streaming:</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Live WebSocket
          </span>
        </div>
        <div className="text-slate-400 font-medium">
          Last Updated: <span className="text-white">{readings.last_updated}</span>
        </div>
      </div>
    </div>
  );
}
