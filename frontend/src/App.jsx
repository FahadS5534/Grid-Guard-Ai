import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TransformerProvider } from './context/TransformerContext';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import ElNinoMonitor from './pages/ElNinoMonitor';
import ThermalStress from './pages/ThermalStress';
import AIAnomalyDetection from './pages/AIAnomalyDetection';
import PredictiveMaintenance from './pages/PredictiveMaintenance';
import AlertsReports from './pages/AlertsReports';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TransformerProvider>
          <Routes>
            {/* Page 1: Standalone Hero Landing */}
            <Route path="/" element={<Home />} />

            {/* Pages 2 to 8: Dashboard Platform with persistent sidebar */}
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/live-monitoring" element={<Layout><LiveMonitoring /></Layout>} />
            <Route path="/el-nino-monitor" element={<Layout><ElNinoMonitor /></Layout>} />
            <Route path="/thermal-stress" element={<Layout><ThermalStress /></Layout>} />
            <Route path="/ai-anomaly-detection" element={<Layout><AIAnomalyDetection /></Layout>} />
            <Route path="/predictive-maintenance" element={<Layout><PredictiveMaintenance /></Layout>} />
            <Route path="/alerts-reports" element={<Layout><AlertsReports /></Layout>} />
          </Routes>
        </TransformerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
