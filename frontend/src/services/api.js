const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function fetchJson(endpoint, options = {}) {
  const token = localStorage.getItem('gridguard_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API call failed: ${response.statusText}`;
    try {
      const errData = await response.json();
      errorMsg = errData.error?.message || errData.detail || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials) => fetchJson('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => fetchJson('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => fetchJson('/auth/me'),

  // Dashboard
  getDashboardSummary: (transformerId, range = '7 Days') => 
    fetchJson(`/dashboard/summary?range=${encodeURIComponent(range)}${transformerId ? `&transformer_id=${transformerId}` : ''}`),

  // Transformers
  getTransformers: () => fetchJson('/transformers'),
  getTransformerById: (id) => fetchJson(`/transformers/${id}`),

  // Telemetry & History
  getTelemetryHistory: (id, range) => fetchJson(`/transformers/${id}/telemetry?limit=100`),
  postTelemetry: (payload) => fetchJson('/telemetry', { method: 'POST', body: JSON.stringify(payload) }),

  // Environmental / El Niño
  getEnvironmentSummary: () => fetchJson('/environment/summary'),
  getEnvironmentCurrent: () => fetchJson('/environment/current'),
  getEnsoStatus: () => fetchJson('/environment/enso'),
  getEnvironmentHistory: () => fetchJson('/environment/history'),

  // Thermal Stress
  getThermalStress: (transformerId, range = '7 Days') => 
    fetchJson(`/thermal-stress?range=${encodeURIComponent(range)}${transformerId ? `&transformer_id=${transformerId}` : ''}`),

  // AI Anomaly Detection
  getAnomalyStatus: (transformerId) => 
    fetchJson(`/anomaly${transformerId ? `?transformer_id=${transformerId}` : ''}`),

  // Predictive Maintenance
  getMaintenanceRecommendations: (transformerId) => 
    fetchJson(`/maintenance${transformerId ? `?transformer_id=${transformerId}` : ''}`),

  // Alerts
  getAlerts: (transformerId, acknowledged) => {
    let q = [];
    if (transformerId) q.push(`transformer_id=${transformerId}`);
    if (acknowledged !== undefined) q.push(`acknowledged=${acknowledged}`);
    return fetchJson(`/alerts${q.length ? '?' + q.join('&') : ''}`);
  },
  acknowledgeAlert: (alertId) => fetchJson(`/alerts/${alertId}/acknowledge`, { method: 'PATCH' }),

  // Reports
  getReports: () => fetchJson('/reports'),
  createCustomReport: (data) => fetchJson('/reports', { method: 'POST', body: JSON.stringify(data) }),
  getDownloadUrl: (reportId) => `${API_BASE_URL}/reports/${reportId}/download`,
  getStandardDownloadUrl: (type) => `${API_BASE_URL}/reports/${type}/download`,

  // Dev Simulator
  triggerSimulateTick: (transformerId = 'TX-101') => 
    fetchJson(`/dev/simulate?transformer_id=${transformerId}`, { method: 'POST' }),
};
