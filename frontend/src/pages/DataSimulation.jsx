import React, { useState } from 'react';
import Header from '../components/layout/Header';
import ReconstructionScatterChart from '../components/charts/ReconstructionScatterChart';
import { 
  Sliders, 
  FlaskConical, 
  Upload, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Thermometer, 
  Zap, 
  Activity, 
  Droplet,
  Info,
  Clock,
  Layers,
  Database,
  Loader2
} from 'lucide-react';
import { useTransformer } from '../context/TransformerContext';
import { api } from '../services/api';

export default function DataSimulation() {
  const { selectedTransformer } = useTransformer();
  const [activeTab, setActiveTab] = useState('scenarios'); // 'scenarios' | 'single' | 'csv'
  
  // Single Point Form State
  const [form, setForm] = useState({
    temperature: 68.4,
    current: 156.8,
    voltage: 230.0,
    humidity: 54.0,
    vibration: 2.35,
  });

  // Selected Scenario
  const [scenario, setScenario] = useState('verified_normal');

  // Response State
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Handle Single Injection
  const handleSingleInject = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    // Client-side Validation
    if (form.temperature < -40 || form.temperature > 150) {
      setValidationError('Temperature must be between -40°C and 150°C.');
      return;
    }
    if (form.current < 0 || form.current > 1000) {
      setValidationError('Current must be between 0A and 1000A.');
      return;
    }
    if (form.voltage < 0 || form.voltage > 500) {
      setValidationError('Voltage must be between 0V and 500V.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.injectSimulationData({
        transformer_id: selectedTransformer,
        temperature: parseFloat(form.temperature),
        current: parseFloat(form.current),
        voltage: parseFloat(form.voltage),
        humidity: parseFloat(form.humidity),
        vibration: parseFloat(form.vibration),
      });
      setResult({
        data_mode: 'SIMULATED DATA (SINGLE INJECTION)',
        notice: res.notice,
        observation_count: res.observation_count,
        required_count: res.required_count || 96,
        missing_count: res.missing_count || Math.max(0, 96 - res.observation_count),
        is_complete_sequence: res.is_complete_sequence,
        ml: res.ml_result,
        rec: res.recommendation,
        raw: res.latest_injected
      });
    } catch (err) {
      setError(err.message || 'Simulation injection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Scenario Sequence Generation
  const handleRunScenario = async (scenType) => {
    setScenario(scenType);
    setLoading(true);
    setError(null);
    try {
      const res = await api.runScenarioSequence({
        transformer_id: selectedTransformer,
        scenario_type: scenType,
        base_temperature: form.temperature,
        base_current: form.current,
        base_voltage: form.voltage,
        base_humidity: form.humidity,
        base_vibration: form.vibration
      });
      setResult({
        data_mode: res.data_mode || 'SIMULATED SCENARIO (96-STEP SEQUENCE)',
        notice: res.notice,
        observation_count: res.observation_count,
        required_count: res.required_count || 96,
        missing_count: res.missing_count || 0,
        is_complete_sequence: res.is_complete_sequence,
        window_start: res.window_start,
        window_end: res.window_end,
        sequence: res.sequence,
        ml: res.ml_result,
        rec: res.recommendation,
        raw: res.sequence[res.sequence.length - 1]
      });
    } catch (err) {
      setError(err.message || 'Scenario evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV Upload
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadSimulationCsv(file);
      setResult({
        data_mode: 'SIMULATED CSV UPLOAD (96-STEP SEQUENCE)',
        notice: res.notice,
        observation_count: res.observation_count,
        required_count: res.required_count || 96,
        missing_count: res.missing_count || 0,
        is_complete_sequence: res.is_complete_sequence,
        ml: res.ml_result,
        rec: res.recommendation,
        raw: res.ml_result.raw_features
      });
    } catch (err) {
      setError(err.message || 'CSV sequence processing failed.');
    } finally {
      setLoading(false);
    }
  };

  const ml = result ? result.ml : null;
  const rec = result ? result.rec : null;
  const isAnomaly = ml ? ml.is_anomaly : false;
  const isComplete = result ? (result.is_complete_sequence !== false && result.observation_count >= 96) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Header 
          title="Data Simulation Mode" 
          subtitle="Test GridGuard AI predictive maintenance without physical ESP32 hardware" 
        />
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" />
            SIMULATED MODE
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            AI ANALYSIS
          </span>
        </div>
      </div>

      {/* Prominent Requirement Notice */}
      <div className="gridguard-card p-4 border-l-4 border-cyan-500 bg-cyan-950/20 text-slate-200 flex items-center gap-3">
        <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-cyan-300">24-Hour AI Inference Requirement: </span>
          The frozen LSTM Autoencoder requires 96 observations (24 hours at 15-minute intervals) for full sequence evaluation. Injected values convert temperature to <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-200">temperature_deviation</code> using the saved monthly baseline before model evaluation.
        </div>
      </div>

      {/* Simulation Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mode Selector & Inputs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="gridguard-card p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Simulation Method
            </h3>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#0B0F17] rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('scenarios')}
                className={`py-2 rounded-md font-semibold transition-all ${activeTab === 'scenarios' ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Scenarios
              </button>
              <button
                onClick={() => setActiveTab('single')}
                className={`py-2 rounded-md font-semibold transition-all ${activeTab === 'single' ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Manual Row
              </button>
              <button
                onClick={() => setActiveTab('csv')}
                className={`py-2 rounded-md font-semibold transition-all ${activeTab === 'csv' ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                CSV Upload
              </button>
            </div>
          </div>

          {/* TAB 1: Predefined Scenarios */}
          {activeTab === 'scenarios' && (
            <div className="gridguard-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Demo Scenarios (96 Steps)</h4>

              <button
                onClick={() => handleRunScenario('verified_normal')}
                className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${scenario === 'verified_normal' && result ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300' : 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700'}`}
              >
                <div>
                  <span className="font-bold block text-sm text-cyan-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Verified Normal (Dataset)
                  </span>
                  <span className="text-[11px] text-slate-400">Actual 96-step normal sequence from transformer test dataset</span>
                </div>
                <Play className="w-4 h-4 text-cyan-400 shrink-0" />
              </button>
              
              <button
                onClick={() => handleRunScenario('normal')}
                className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${scenario === 'normal' && result ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' : 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700'}`}
              >
                <div>
                  <span className="font-bold block text-sm text-emerald-400">Scenario 1 — Nominal Normal</span>
                  <span className="text-[11px] text-slate-400">Nominal temp dev, current (156A), voltage (230V)</span>
                </div>
                <Play className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>

              <button
                onClick={() => handleRunScenario('thermal_stress')}
                className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${scenario === 'thermal_stress' && result ? 'bg-amber-500/10 border-amber-500/50 text-amber-300' : 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700'}`}
              >
                <div>
                  <span className="font-bold block text-sm text-amber-400">Scenario 2 — Elevated Thermal</span>
                  <span className="text-[11px] text-slate-400">High temp dev (+40°C rise under heatwave)</span>
                </div>
                <Play className="w-4 h-4 text-amber-400 shrink-0" />
              </button>

              <button
                onClick={() => handleRunScenario('electrical_anomaly')}
                className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${scenario === 'electrical_anomaly' && result ? 'bg-red-500/10 border-red-500/50 text-red-300' : 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700'}`}
              >
                <div>
                  <span className="font-bold block text-sm text-red-400">Scenario 3 — Electrical Anomaly</span>
                  <span className="text-[11px] text-slate-400">Overcurrent (245A) + severe voltage drop (195V)</span>
                </div>
                <Play className="w-4 h-4 text-red-400 shrink-0" />
              </button>

              <button
                onClick={() => handleRunScenario('combined_stress')}
                className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${scenario === 'combined_stress' && result ? 'bg-purple-500/10 border-purple-500/50 text-purple-300' : 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700'}`}
              >
                <div>
                  <span className="font-bold block text-sm text-purple-400">Scenario 4 — Combined Stress</span>
                  <span className="text-[11px] text-slate-400">Elevated temp + overcurrent + low voltage</span>
                </div>
                <Play className="w-4 h-4 text-purple-400 shrink-0" />
              </button>
            </div>
          )}

          {/* TAB 2: Manual Single Telemetry Injection */}
          {activeTab === 'single' && (
            <form onSubmit={handleSingleInject} className="gridguard-card p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Manual Telemetry Injection</h4>

              {validationError && (
                <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-red-400 text-xs">
                  {validationError}
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium text-slate-400">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.temperature}
                  onChange={e => setForm({ ...form, temperature: e.target.value })}
                  className="w-full mt-1 p-2 rounded bg-[#0B0F17] border border-slate-800 text-sm text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400">Load Current (A)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.current}
                  onChange={e => setForm({ ...form, current: e.target.value })}
                  className="w-full mt-1 p-2 rounded bg-[#0B0F17] border border-slate-800 text-sm text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400">Voltage (V)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.voltage}
                  onChange={e => setForm({ ...form, voltage: e.target.value })}
                  className="w-full mt-1 p-2 rounded bg-[#0B0F17] border border-slate-800 text-sm text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Humidity (%)</label>
                  <input
                    type="number"
                    step="1"
                    value={form.humidity}
                    onChange={e => setForm({ ...form, humidity: e.target.value })}
                    className="w-full mt-1 p-2 rounded bg-[#0B0F17] border border-slate-800 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400">Vibration (mm/s)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.vibration}
                    onChange={e => setForm({ ...form, vibration: e.target.value })}
                    className="w-full mt-1 p-2 rounded bg-[#0B0F17] border border-slate-800 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Inject Telemetry Point</span>
              </button>
            </form>
          )}

          {/* TAB 3: CSV Sequence Upload */}
          {activeTab === 'csv' && (
            <div className="gridguard-card p-5 space-y-4 text-center">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Upload 96-Step CSV Sequence</h4>
              <p className="text-xs text-slate-400">
                Upload a CSV containing columns: <code className="text-purple-300">temperature, current, voltage</code>
              </p>
              
              <label className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-purple-400 mb-2" />
                <span className="text-xs font-bold text-slate-200">Click to upload CSV</span>
                <span className="text-[11px] text-slate-400 mt-0.5">.csv files up to 5MB</span>
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Right Column: AI Inference & Recommendation Results */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="gridguard-card p-12 text-center animate-pulse">
              <FlaskConical className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-white">Evaluating 96-Observation Time-Series Sequence...</p>
              <p className="text-xs text-slate-400 mt-1">Applying seasonal baseline, scaling 96-step sequence, computing reconstruction error</p>
            </div>
          )}

          {error && (
            <div className="gridguard-card p-6 border-l-4 border-red-500 bg-red-950/20 text-slate-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-red-400">Simulation Error</h3>
                  <p className="text-xs text-slate-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="gridguard-card p-12 text-center text-slate-400 space-y-3">
              <Sliders className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Simulation Data Evaluated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select a demo scenario on the left or enter simulated telemetry readings to evaluate the frozen ML model.
              </p>
            </div>
          )}

          {!loading && !error && result && (
            <>
              {/* Simulation Banner Badge */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-950/30 border border-purple-500/40 text-xs">
                <span className="font-bold text-purple-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                  {result.data_mode}
                </span>
                <span className="text-slate-400">
                  Sequence Window: <span className="font-bold text-slate-200">{result.observation_count} / 96 observations</span>
                </span>
              </div>

              {/* INCOMPLETE SEQUENCE STATE (< 96 observations) */}
              {!isComplete && (
                <div className="gridguard-card p-6 border-l-4 border-amber-500 bg-amber-950/20 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-400" />
                        Collecting Observations: {result.observation_count} / 96
                      </h3>
                      <p className="text-sm font-semibold text-white mt-1">
                        {result.missing_count} more observations required to run 24-hour AI inference.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      IN PROGRESS
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Accumulation Progress</span>
                      <span className="font-bold text-amber-300">{Math.round((result.observation_count / 96) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                        style={{ width: `${(result.observation_count / 96) * 100}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0F17] p-3 rounded border border-slate-800">
                    {result.notice || result.ml?.notice}
                  </p>

                  <div className="text-[11px] text-slate-400 italic">
                    Note: To evaluate full sequence anomaly status, continue injecting telemetry points until 96 steps are accumulated, or select a predefined 96-step demo scenario on the left.
                  </div>
                </div>
              )}

              {/* COMPLETE 96-STEP SEQUENCE STATE (96/96 observations) */}
              {isComplete && (
                <>
                  {/* SECTION 1: AI Anomaly Detection Result */}
                  <div className="gridguard-card p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-purple-400" />
                        AI Anomaly Detection Result
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${isAnomaly ? 'bg-red-500 text-white glow-red' : 'bg-emerald-500 text-white'}`}>
                        {ml.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-medium block">Reconstruction Error</span>
                        <span className="text-2xl font-black text-white mt-1 block">{ml.reconstruction_error}</span>
                        <span className="text-[10px] text-slate-400">Threshold: {ml.threshold}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-medium block">Threshold Error Ratio</span>
                        <span className="text-2xl font-black text-cyan-400 mt-1 block">{ml.threshold_ratio ?? (ml.reconstruction_error / ml.threshold).toFixed(4)}</span>
                        <span className="text-[10px] text-slate-400">Error / Threshold</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-medium block">Health Score</span>
                        <span className="text-2xl font-black text-emerald-400 mt-1 block">{ml.health_score}%</span>
                        <span className="text-[10px] text-slate-400">100 × (1 - Anomaly)</span>
                      </div>

                      <div className="p-3 rounded-lg bg-[#0B0F17] border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-medium block">Risk Level</span>
                        <span className={`text-2xl font-black mt-1 block ${ml.risk_category === 'HIGH' || ml.risk_category === 'CRITICAL' ? 'text-red-500' : ml.risk_category === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {ml.risk_category}
                        </span>
                        <span className="text-[10px] text-slate-400">Category</span>
                      </div>
                    </div>

                    {/* Dominant Reconstruction Signal */}
                    <div className="p-3.5 rounded-lg bg-[#0B0F17] border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Dominant Reconstruction Signal:</span>
                      <span className="font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                        {ml.dominant_signal || 'Temperature Deviation'}
                      </span>
                    </div>

                    {/* Explanation */}
                    <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-300">
                      <p className="font-bold text-slate-200 mb-1">Inference Explanation:</p>
                      {ml.explanation}
                    </div>

                    {/* Clarification Note */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 italic">
                      <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        Note: Anomaly classification comes strictly from the frozen LSTM Autoencoder sequence reconstruction error exceeding threshold ({ml.threshold}), not from raw individual values.
                      </span>
                    </div>
                  </div>

                  {/* SECTION 2: Predictive Maintenance Precautions & Operator Support */}
                  <div className="gridguard-card p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                        Operator Decision Support & Precautions
                      </h3>
                      <span className="text-xs text-purple-300 font-semibold">{rec.risk_level}</span>
                    </div>

                    {/* Why Recommendation Was Given (Rationale) */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rationale Breakdown:</h4>
                      <ul className="space-y-2">
                        {rec.reasons.map((r, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-[#0B0F17] p-2.5 rounded border border-slate-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Operator Precautions:</h4>
                      <div className="space-y-2">
                        {rec.recommended_actions.map((act, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#0B0F17] border border-slate-800 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-semibold text-white">{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Suggested Timeframe: <span className="font-bold text-purple-300">{rec.suggested_timeframe}</span></span>
                    </div>

                    <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300">
                      {rec.disclaimer || 'Recommendations provide operational decision support for human maintenance teams.'}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

