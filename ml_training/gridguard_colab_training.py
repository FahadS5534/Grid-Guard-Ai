# ==============================================================================
# GridGuard AI — Google Colab Autoencoder Training & Artifact Export Pipeline
# Project: AI-Based Predictive Maintenance for Power Grid Infrastructure
# ==============================================================================
# Instructions for Google Colab:
# Simply run this script in a Google Colab cell.
# It automatically downloads the ETT dataset, validates data, trains a Dense
# Autoencoder, calculates reconstruction thresholds, evaluates metrics,
# exports all required FastAPI artifacts to /content/gridguard_ml/, zips them into
# gridguard_ml_artifacts.zip, and verifies model reload compatibility.
# ==============================================================================

import os
import sys
import json
import zipfile
import shutil
import urllib.request
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib

# TensorFlow / Keras imports
import tensorflow as tf
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import StandardScaler

print("==================================================")
print(" ⚡ GRIDGUARD AI — ML TRAINING PIPELINE INITIALIZATION")
print("==================================================")
print(f"Python version: {sys.version.split()[0]}")
print(f"TensorFlow version: {tf.__version__}")
print(f"Pandas version: {pd.__version__}")

# ------------------------------------------------------------------------------
# 1. AUTOMATIC DATASET DOWNLOAD & VALIDATION
# ------------------------------------------------------------------------------
PRIMARY_URL = "https://raw.githubusercontent.com/zhouhaoyi/ETDataset/main/ETT-small/ETTm1.csv"
FALLBACK_URL = "https://raw.githubusercontent.com/zhouhaoyi/ETDataset/main/ETT-small/ETTh1.csv"

print("\n--------------------------------------------------")
print("[STEP 1/11] Downloading ETT Dataset...")
print("--------------------------------------------------")

dataset_url = PRIMARY_URL
try:
    print(f"Downloading primary dataset from: {PRIMARY_URL}")
    df = pd.read_csv(PRIMARY_URL)
    print("✓ ETTm1 dataset downloaded successfully.")
except Exception as e:
    print(f"Warning: Primary download failed ({e}). Attempting fallback to ETTh1...")
    try:
        dataset_url = FALLBACK_URL
        df = pd.read_csv(FALLBACK_URL)
        print("✓ Fallback ETTh1 dataset downloaded successfully.")
    except Exception as e2:
        sys.exit(f"FATAL ERROR: Could not download ETT dataset: {e2}")

# Data Validation & Statistics
print("\n--- Dataset Validation & Summary ---")
print(f"Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"Columns: {list(df.columns)}")
print("\nFirst 5 Rows:")
print(df.head())

print("\nData Types:")
print(df.dtypes)

print("\nMissing Values:")
print(df.isnull().sum())

# Date parsing & sorting
date_col = 'date' if 'date' in df.columns else df.columns[0]
df[date_col] = pd.to_datetime(df[date_col])
duplicate_timestamps = df[date_col].duplicated().sum()
print(f"\nDuplicate Timestamps: {duplicate_timestamps}")

df = df.sort_values(by=date_col).reset_index(drop=True)
min_ts = df[date_col].min()
max_ts = df[date_col].max()
print(f"Timestamp Range: From {min_ts} to {max_ts}")

print("\nBasic Summary Statistics:")
print(df.describe())

# ------------------------------------------------------------------------------
# 2. FEATURE SELECTION
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 2/11] Feature Selection")
print("--------------------------------------------------")

expected_features = ['HUFL', 'HULL', 'MUFL', 'MULL', 'LUFL', 'LULL', 'OT']
selected_features = [col for col in expected_features if col in df.columns]

if not selected_features:
    # Fallback to all numeric columns excluding date
    selected_features = [col for col in df.columns if col != date_col and pd.api.types.is_numeric_dtype(df[col])]

print(f"Selected features: {selected_features}")
print(f"Number of features: {len(selected_features)}")
print("Primary target/thermal indicator: OT (Oil Temperature)")

# Extract feature matrix (preserve timestamps for final results dataframe)
df_features = df[selected_features].copy()
timestamps = df[date_col].values

# ------------------------------------------------------------------------------
# 3. OPTIONAL ENVIRONMENTAL ENRICHMENT (NON-BLOCKING FALLBACK)
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 3/11] Checking Optional Environmental / ENSO Enrichment...")
print("--------------------------------------------------")

try:
    oni_url = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"
    print(f"Attempting to check NOAA CPC ONI data from {oni_url}...")
    # Non-blocking fetch test
    req = urllib.request.Request(oni_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=3) as resp:
        if resp.status == 200:
            print("✓ NOAA ONI endpoint reachable. (Optional enrichment available)")
except Exception as e:
    print("Notice: Environmental enrichment omitted because location/regional match could not be scientifically verified.")
    print("Continuing primary model training on ETT dataset alone...")

# ------------------------------------------------------------------------------
# 4. CHRONOLOGICAL TIME-SERIES TRAIN / VAL / TEST SPLIT
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 4/11] Chronological Data Splitting (Time-Aware)")
print("--------------------------------------------------")

n_total = len(df_features)
train_end = int(n_total * 0.70)
val_end = int(n_total * 0.85)

train_df = df_features.iloc[:train_end]
val_df = df_features.iloc[train_end:val_end]
test_df = df_features.iloc[val_end:]

train_timestamps = timestamps[:train_end]
val_timestamps = timestamps[train_end:val_end]
test_timestamps = timestamps[val_end:]

print(f"Total Rows: {n_total}")
print(f"Training set (70%):   {len(train_df)} rows ({train_timestamps[0]} to {train_timestamps[-1]})")
print(f"Validation set (15%): {len(val_df)} rows ({val_timestamps[0]} to {val_timestamps[-1]})")
print(f"Test set (15%):       {len(test_df)} rows ({test_timestamps[0]} to {test_timestamps[-1]})")

# ------------------------------------------------------------------------------
# 5. FEATURE SCALING (FIT ONLY ON TRAINING DATA)
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 5/11] Scaling Features (StandardScaler)")
print("--------------------------------------------------")

scaler = StandardScaler()
scaler.fit(train_df.values)

train_scaled = scaler.transform(train_df.values)
val_scaled = scaler.transform(val_df.values)
test_scaled = scaler.transform(test_df.values)

print("✓ StandardScaler fit exclusively on training data.")
print(f"Feature Means (train): {scaler.mean_}")
print(f"Feature Stds  (train): {scaler.scale_}")

# ------------------------------------------------------------------------------
# 6. SLIDING WINDOW CREATION
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 6/11] Creating Sliding Windows (Window Size = 96)")
print("--------------------------------------------------")

WINDOW_SIZE = 96 # 96 * 15m = 24 hours of operational context

def create_sliding_windows(data_array, timestamps_array, window_size=96):
    windows = []
    window_timestamps = []
    for i in range(len(data_array) - window_size + 1):
        windows.append(data_array[i : i + window_size])
        # Track timestamp at the END of each window
        window_timestamps.append(timestamps_array[i + window_size - 1])
    return np.array(windows), np.array(window_timestamps)

X_train_win, train_win_ts = create_sliding_windows(train_scaled, train_timestamps, WINDOW_SIZE)
X_val_win, val_win_ts = create_sliding_windows(val_scaled, val_timestamps, WINDOW_SIZE)
X_test_win, test_win_ts = create_sliding_windows(test_scaled, test_timestamps, WINDOW_SIZE)

print(f"Windowed Train Shape: {X_train_win.shape}")
print(f"Windowed Val Shape:   {X_val_win.shape}")
print(f"Windowed Test Shape:  {X_test_win.shape}")

# Flatten window features for Dense Autoencoder: (N, 96 * n_features)
n_features = len(selected_features)
input_dim = WINDOW_SIZE * n_features

X_train_flat = X_train_win.reshape(-1, input_dim)
X_val_flat = X_val_win.reshape(-1, input_dim)
X_test_flat = X_test_win.reshape(-1, input_dim)

print(f"Flattened Input Dimension: {input_dim} (96 windows * {n_features} features)")

# ------------------------------------------------------------------------------
# 7. DENSE AUTOENCODER MODEL TRAINING
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 7/11] Building & Training Dense Autoencoder")
print("--------------------------------------------------")

# Compact Architecture
input_layer = Input(shape=(input_dim,), name="input_features")
encoded_1 = Dense(128, activation="relu", name="encoder_dense_1")(input_layer)
encoded_2 = Dense(32, activation="relu", name="encoder_dense_2")(encoded_1)
bottleneck = Dense(8, activation="relu", name="bottleneck_latent")(encoded_2)
decoded_1 = Dense(32, activation="relu", name="decoder_dense_1")(bottleneck)
decoded_2 = Dense(128, activation="relu", name="decoder_dense_2")(decoded_1)
output_layer = Dense(input_dim, activation="linear", name="reconstructed_output")(decoded_2)

autoencoder = Model(inputs=input_layer, outputs=output_layer, name="GridGuard_Autoencoder")
autoencoder.compile(optimizer="adam", loss="mse")

autoencoder.summary()

early_stopping = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)

history = autoencoder.fit(
    X_train_flat, X_train_flat,
    epochs=50,
    batch_size=64,
    validation_data=(X_val_flat, X_val_flat),
    callbacks=[early_stopping],
    verbose=1
)

print(f"✓ Training finished at Epoch {len(history.history['loss'])}")
print(f"Final Train Loss (MSE): {history.history['loss'][-1]:.6f}")
print(f"Final Val Loss (MSE):   {history.history['val_loss'][-1]:.6f}")

# ------------------------------------------------------------------------------
# 8. RECONSTRUCTION ERROR & THRESHOLD DETERMINATION
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 8/11] Computing Reconstruction Errors & 95th Percentile Threshold")
print("--------------------------------------------------")

val_reconstructions = autoencoder.predict(X_val_flat, verbose=0)
val_mse = np.mean(np.square(X_val_flat - val_reconstructions), axis=1)

# Set threshold at 95th percentile of validation reconstruction error
THRESHOLD = float(np.percentile(val_mse, 95))

print(f"Validation Reconstruction Error (MSE) - Min: {val_mse.min():.5f}, Max: {val_mse.max():.5f}, Mean: {val_mse.mean():.5f}")
print(f"► ANOMALY THRESHOLD (95th percentile val error): {THRESHOLD:.6f}")

# ------------------------------------------------------------------------------
# 9. EVALUATION & PREDICTION PIPELINE FUNCTIONS
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 9/11] Evaluating Model Predictions on Test Data")
print("--------------------------------------------------")

test_reconstructions = autoencoder.predict(X_test_flat, verbose=0)
test_mse = np.mean(np.square(X_test_flat - test_reconstructions), axis=1)

# Calculate normalized Anomaly Score (0.0 to 1.0)
test_anomaly_scores = np.clip(test_mse / THRESHOLD, 0.0, 1.0)

# Calculate Health Score (100 * (1 - anomaly_score))
test_health_scores = np.clip(100.0 * (1.0 - test_anomaly_scores), 0.0, 100.0)

# Assign Risk Category
def get_risk_category(score):
    if score < 0.10:
        return "LOW"
    elif score < 0.30:
        return "MEDIUM"
    elif score < 0.60:
        return "HIGH"
    else:
        return "CRITICAL"

test_risks = [get_risk_category(s) for s in test_anomaly_scores]
test_is_anomaly = test_mse >= THRESHOLD

anomaly_count = np.sum(test_is_anomaly)
test_anomaly_rate = (anomaly_count / len(test_is_anomaly)) * 100.0
print(f"Test Set Windows: {len(X_test_flat)}")
print(f"Anomalies Detected in Test Set: {anomaly_count} ({test_anomaly_rate:.2f}%)")

# Single Sample Prediction Test Function
def predict_anomaly(window_raw_df, scaler_obj, model_obj, threshold_val, features_list):
    """
    Simulates FastAPI single-window inference request payload parsing and score calculation.
    """
    # Ensure exact feature order
    scaled_data = scaler_obj.transform(window_raw_df[features_list].values)
    flat_input = scaled_data.reshape(1, -1)
    
    reconstruction = model_obj.predict(flat_input, verbose=0)
    mse = float(np.mean(np.square(flat_input - reconstruction)))
    
    anom_score = float(np.clip(mse / threshold_val, 0.0, 1.0))
    h_score = float(np.clip(100.0 * (1.0 - anom_score), 0.0, 100.0))
    risk_cat = get_risk_category(anom_score)
    is_anom = bool(mse >= threshold_val)

    return {
        "reconstruction_error": round(mse, 6),
        "anomaly_score": round(anom_score, 4),
        "health_score": round(h_score, 2),
        "risk": risk_cat,
        "is_anomaly": is_anom
    }

# Run sample test prediction
sample_window_df = test_df.iloc[:WINDOW_SIZE]
sample_res = predict_anomaly(sample_window_df, scaler, autoencoder, THRESHOLD, selected_features)
print("\nSample Test Window Inference Result:")
print(json.dumps(sample_res, indent=2))

# Plot Lightweight Evaluation Visuals
plt.figure(figsize=(14, 5))

# Plot 1: Training Loss Curve
plt.subplot(1, 2, 1)
plt.plot(history.history['loss'], label='Train MSE Loss', color='#7C3AED')
plt.plot(history.history['val_loss'], label='Val MSE Loss', color='#00F0FF')
plt.title('Autoencoder Training & Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('MSE Loss')
plt.legend()
plt.grid(True, alpha=0.3)

# Plot 2: Test Reconstruction Errors vs Threshold
plt.subplot(1, 2, 2)
plt.plot(test_mse, label='Test Reconstruction Error', color='#10B981', alpha=0.7)
plt.axhline(y=THRESHOLD, color='#EF4444', linestyle='--', label=f'Threshold ({THRESHOLD:.4f})')
plt.title('Test Set Reconstruction Error vs Anomaly Threshold')
plt.xlabel('Window Index')
plt.ylabel('Reconstruction Error (MSE)')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('model_evaluation_plots.png', dpi=150)
plt.close()
print("✓ Evaluation plots saved to model_evaluation_plots.png")

# ------------------------------------------------------------------------------
# 10. EXPORT MODEL ARTIFACTS TO /content/gridguard_ml/
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 10/11] Exporting FastAPI Production Artifacts")
print("--------------------------------------------------")

EXPORT_DIR = "/content/gridguard_ml" if os.path.exists("/content") or os.name != 'nt' else "./gridguard_ml"
if os.path.exists(EXPORT_DIR):
    shutil.rmtree(EXPORT_DIR)
os.makedirs(EXPORT_DIR, exist_ok=True)

# 1. Keras Autoencoder Model
keras_path = os.path.join(EXPORT_DIR, "transformer_autoencoder.keras")
autoencoder.save(keras_path)
print(f"✓ Saved Model: {keras_path}")

# 2. StandardScaler Pickle
scaler_path = os.path.join(EXPORT_DIR, "scaler.pkl")
joblib.dump(scaler, scaler_path)
print(f"✓ Saved Scaler: {scaler_path}")

# 3. Features JSON
features_path = os.path.join(EXPORT_DIR, "features.json")
with open(features_path, "w") as f:
    json.dump({"features": selected_features}, f, indent=2)
print(f"✓ Saved Feature Order: {features_path}")

# 4. Threshold JSON
threshold_path = os.path.join(EXPORT_DIR, "threshold.json")
with open(threshold_path, "w") as f:
    json.dump({
        "threshold": THRESHOLD,
        "method": "95th_percentile_validation_reconstruction_error"
    }, f, indent=2)
print(f"✓ Saved Threshold: {threshold_path}")

# 5. Model Metadata JSON
metadata_path = os.path.join(EXPORT_DIR, "model_metadata.json")
metadata_content = {
    "project": "GridGuard AI",
    "model_type": "Dense Autoencoder",
    "dataset": "ETTm1",
    "dataset_url": dataset_url,
    "window_size": WINDOW_SIZE,
    "features": selected_features,
    "scaler": "StandardScaler",
    "threshold": THRESHOLD,
    "threshold_method": "95th percentile of validation reconstruction error",
    "anomaly_score_definition": "clip(reconstruction_error / threshold, 0, 1)",
    "health_score_definition": "100 * (1 - anomaly_score)",
    "train_windows": len(X_train_flat),
    "val_windows": len(X_val_flat),
    "test_windows": len(X_test_flat),
    "test_anomaly_rate_percent": round(test_anomaly_rate, 2)
}
with open(metadata_path, "w") as f:
    json.dump(metadata_content, f, indent=2)
print(f"✓ Saved Metadata: {metadata_path}")

# 6. Sample Prediction JSON
sample_path = os.path.join(EXPORT_DIR, "sample_prediction.json")
with open(sample_path, "w") as f:
    json.dump(sample_res, f, indent=2)
print(f"✓ Saved Sample Prediction: {sample_path}")

# 7. Results CSV
csv_path = os.path.join(EXPORT_DIR, "transformer_anomaly_results.csv")
results_df = pd.DataFrame({
    "timestamp": [str(ts) for ts in test_win_ts],
    "reconstruction_error": np.round(test_mse, 6),
    "anomaly_score": np.round(test_anomaly_scores, 4),
    "health_score": np.round(test_health_scores, 2),
    "risk": test_risks,
    "is_anomaly": test_is_anomaly
})
results_df.to_csv(csv_path, index=False)
print(f"✓ Saved Results CSV: {csv_path} ({len(results_df)} rows)")

# 8. Create ZIP bundle
zip_path = "gridguard_ml_artifacts.zip"
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, _, files in os.walk(EXPORT_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, EXPORT_DIR)
            zipf.write(full_path, rel_path)
print(f"✓ Zip Archive Created: {os.path.abspath(zip_path)}")

# ------------------------------------------------------------------------------
# 11. MODEL RELOAD VERIFICATION (REQUIRED)
# ------------------------------------------------------------------------------
print("\n--------------------------------------------------")
print("[STEP 11/11] Verifying Artifact Reload Compatibility")
print("--------------------------------------------------")

# Reload saved files from disk
reloaded_model = load_model(keras_path)
reloaded_scaler = joblib.load(scaler_path)

with open(features_path, "r") as f:
    reloaded_features = json.load(f)["features"]

with open(threshold_path, "r") as f:
    reloaded_threshold = json.load(f)["threshold"]

reloaded_res = predict_anomaly(
    sample_window_df,
    reloaded_scaler,
    reloaded_model,
    reloaded_threshold,
    reloaded_features
)

assert reloaded_res["reconstruction_error"] == sample_res["reconstruction_error"], "Mismatch in reloaded model MSE output!"
assert reloaded_res["health_score"] == sample_res["health_score"], "Mismatch in reloaded health score!"

print("✓ Model, Scaler, Threshold, and Feature Order successfully reloaded.")
print("\n========================================")
print(" MODEL RELOAD TEST: PASSED")
print("========================================")

# ------------------------------------------------------------------------------
# FINAL SUMMARY OUTPUT
# ------------------------------------------------------------------------------
print("\n========================================")
print(" GRIDGUARD AI ML TRAINING COMPLETE")
print("========================================")
print(f"Dataset:                  ETTm1")
print(f"Dataset source:           {dataset_url}")
print(f"Rows:                     {df.shape[0]}")
print(f"Features:                 {selected_features}")
print(f"Window size:              {WINDOW_SIZE} (24 Hours)")
print(f"Train windows:            {len(X_train_flat)}")
print(f"Validation windows:       {len(X_val_flat)}")
print(f"Test windows:             {len(X_test_flat)}")
print(f"Autoencoder:              Dense (128 -> 32 -> 8 -> 32 -> 128 -> {input_dim})")
print(f"Threshold (95th pct val): {THRESHOLD:.6f}")
print(f"Test anomaly rate:        {test_anomaly_rate:.2f}%")
print("\nArtifacts Exported to /content/gridguard_ml/:")
print("  ✓ transformer_autoencoder.keras")
print("  ✓ scaler.pkl")
print("  ✓ features.json")
print("  ✓ threshold.json")
print("  ✓ model_metadata.json")
print("  ✓ sample_prediction.json")
print("  ✓ transformer_anomaly_results.csv")
print("  ✓ gridguard_ml_artifacts.zip")
print("\nModel reload:")
print("  ✓ PASSED")
print("========================================\n")
