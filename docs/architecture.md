# GridGuard AI — System Architecture & Integration Blueprint

## 1. System Architecture Overview

```
                      +------------------------------------------+
                      |         GridGuard AI React UI            |
                      |  (Vite + Tailwind CSS + Recharts + WS)   |
                      +--------------------+---------------------+
                                           |
                                 HTTP REST / WebSocket
                                           |
                      +--------------------v---------------------+
                      |           FastAPI Backend App            |
                      +--------------------+---------------------+
                                           |
         +------------------+--------------+-------------+------------------+
         |                  |                            |                  |
+--------v-------+  +-------v--------+          +--------v-------+  +-------v--------+
| Database Layer |  |   ML Adapter   |          | Maintenance &  |  | Environmental  |
|  PostgreSQL /  |  |  Service Stub  |          | Alert Engines  |  | Weather Service|
|  TimescaleDB   |  | (Mock / Real)  |          |  (Rule Engine) |  | (NOAA / Open)  |
+----------------+  +----------------+          +----------------+  +----------------+
        ^                   ^                            ^                  ^
        |                   |                            |                  |
        +-------------------+----------------------------+------------------+
                                           ^
                                           |
                        +------------------+------------------+
                        | Integration Points (External Stack) |
                        +------------------+------------------+
                                           |
                      +--------------------+------------------+
                      |                                       |
           +----------+----------+                 +----------+----------+
           | ESP32 / IoT Hardware|                 | Google Colab Autoencoder|
           | POST /api/v1/telemetry                | Model Artifacts (.keras)|
           +---------------------+                 +-------------------------+
```

---

## 2. Component Descriptions

### 2.1 React Frontend Platform
- **Framework**: React 19 + Vite + Tailwind CSS v4.
- **Visual Design**: Dark industrial control-room aesthetic with `#070A10` background, purple glow active indicators, cyan parameters, and high information density.
- **Charts & Gauges**: Recharts for line/area trends and scatter plots; custom SVG arc & radial gauges.
- **Real-Time Data**: WebSocket listener connected to `/ws/transformers/{id}` for live streaming telemetry.

### 2.2 FastAPI Backend Layer
- **Architecture**: Scalable modular service design (`app/api/routes`, `app/services`, `app/models`, `app/schemas`).
- **Data Ingestion**: `POST /api/v1/telemetry` receives IoT payloads from physical ESP32 or the development simulator.
- **Telemetry Pipeline**: Ingests sensor data $\rightarrow$ calculates Thermal Stress Index $\rightarrow$ invokes ML Inference Adapter $\rightarrow$ updates Health Scores $\rightarrow$ evaluates Maintenance Rule Engine $\rightarrow$ processes Alert Deduplication & Cooldown $\rightarrow$ broadcasts via WebSockets.

### 2.3 PostgreSQL / TimescaleDB Database Layer
- **ORM**: SQLAlchemy + Alembic migrations.
- **Tables**: `users`, `transformers`, `sensor_readings`, `environmental_readings`, `health_scores`, `anomaly_results`, `maintenance_recommendations`, `alerts`, `reports`.
- **Optimization**: Indexes on `(transformer_id, timestamp)` for fast time-series queries with pagination support (`limit`, `offset`).

### 2.4 Environmental & El Niño Integration (`WeatherService`)
- Fetches ambient temperature, humidity, pressure, wind speed, and Sea Surface Temperature (SST) anomalies.
- Incorporates ENSO (El Niño-Southern Oscillation) indices to evaluate thermal stress on power grid transformers.

### 2.5 Thermal Stress Engine (`ThermalStressService`)
Calculates the derived metric **System Thermal Stress Index**:
$$\text{Temperature Rise} = T_{\text{transformer}} - T_{\text{ambient}}$$
$$\text{Thermal Stress Index} = \text{clamp}\left( \frac{\text{Temp Rise}}{45.0} \times 0.65 + \frac{T_{\text{ambient}}}{40.0} \times 0.35, \, 0.0, \, 1.0 \right)$$
- **Low**: $0.00 - 0.33$
- **Moderate**: $0.34 - 0.66$
- **High**: $0.67 - 1.00$

### 2.6 ML Inference Adapter Interface (`MLInferenceService`)
Designed as a pluggable adapter:
- **`MockMLInferenceService`**: Simulates Autoencoder reconstruction errors and anomaly scores for development without making fake claims.
- **`RealMLInferenceService`**: Production stub configured to load `transformer_autoencoder.keras`, `scaler.pkl`, and `threshold.json`.
- Toggleable via environment variable `ML_MODE=mock` or `production`.

### 2.7 Predictive Maintenance Engine (`MaintenanceRecommendationService`)
Evaluates operational thresholds across temperature, vibration, current, thermal stress, and anomaly detection to recommend actionable maintenance steps and suggested timeframes.

### 2.8 Alert System (`AlertService`)
Evaluates telemetry against critical thresholds and handles alert deduplication with a 15-minute cooldown window to avoid alert spamming.

### 2.9 Reports System (`ReportService`)
Generates downloadable PDF and CSV reports for Daily, Weekly, Monthly, and Custom timeframes using ReportLab.
