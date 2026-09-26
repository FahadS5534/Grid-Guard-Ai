import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import AlertRow from '../components/alerts/AlertRow';
import { FileText, Download, Calendar, Filter, Plus } from 'lucide-react';
import { useTransformer } from '../context/TransformerContext';
import { api } from '../services/api';

export default function AlertsReports() {
  const { selectedTransformer } = useTransformer();
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);

  const loadData = () => {
    api.getAlerts(selectedTransformer)
      .then(res => setAlerts(res))
      .catch(err => console.error(err));

    api.getReports()
      .then(res => setReports(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, [selectedTransformer]);

  const handleAcknowledge = async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadReport = (type) => {
    const url = api.getStandardDownloadUrl(type.toLowerCase());
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Alerts & Reports" 
        subtitle="View all alerts and generate system reports" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Recent Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Alerts</h3>
            <button className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Severity</span>
            </button>
          </div>

          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map(a => (
                <AlertRow key={a.id} alert={a} onAcknowledge={handleAcknowledge} />
              ))
            ) : (
              <div className="gridguard-card p-6 text-center text-slate-400 text-xs">
                No active alerts recorded for transformer.
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Reports Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Reports</h3>
            <span className="text-xs text-slate-400">PDF / CSV Export</span>
          </div>

          <div className="space-y-3">
            {/* Daily Report */}
            <div className="gridguard-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Daily Report</h4>
                  <p className="text-[11px] text-slate-400">May 25, 2025</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport('daily')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700 transition-colors"
                title="Download PDF Report"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Weekly Report */}
            <div className="gridguard-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Weekly Report</h4>
                  <p className="text-[11px] text-slate-400">May 19 – May 25, 2025</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport('weekly')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                title="Download PDF Report"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Monthly Report */}
            <div className="gridguard-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Monthly Report</h4>
                  <p className="text-[11px] text-slate-400">May 2025</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport('monthly')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700 transition-colors"
                title="Download PDF Report"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Report */}
            <div className="gridguard-card p-4 flex items-center justify-between border-dashed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Custom Report</h4>
                  <p className="text-[11px] text-slate-400">Select Date Range</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadReport('daily')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Generate Custom Report"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
