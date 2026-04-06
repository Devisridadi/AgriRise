"""
Fertilizer Recommendation Model Training Script.
Trains a classifier that maps soil nutrients + crop type → fertilizer recommendation.

Usage:
    python ml/train_fertilizer.py                          # Use synthetic data
    python ml/train_fertilizer.py --dataset path/to.csv   # Use real dataset

Expected CSV columns: N, P, K, temperature, humidity, Soil_Type, Crop_Type, Fertilizer_Name
"""

import os
import sys
import argparse
import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.crop_data import CROP_REQUIREMENTS


# ─────────────────────────────────────────────
# Fertilizer Rules (used for synthetic generation)
# Based on standard NPK deficiency → fertilizer mapping
# ─────────────────────────────────────────────

FERTILIZER_RULES = [
    # (N_low, P_low, K_low, pH_cond, label)
    # Format: each entry = (n_thresh, p_thresh, k_thresh, label)
    {"n_low": True,  "p_low": True,  "k_low": True,  "name": "NPK 10-26-26"},
    {"n_low": True,  "p_low": True,  "k_low": False, "name": "DAP + Urea"},
    {"n_low": True,  "p_low": False, "k_low": True,  "name": "Urea + MOP"},
    {"n_low": True,  "p_low": False, "k_low": False, "name": "Urea"},
    {"n_low": False, "p_low": True,  "k_low": True,  "name": "NPK 12-32-16"},
    {"n_low": False, "p_low": True,  "k_low": False, "name": "DAP"},
    {"n_low": False, "p_low": False, "k_low": True,  "name": "MOP"},
    {"n_low": False, "p_low": False, "k_low": False, "name": "Organic Manure"},
]

# Thresholds below which a nutrient is considered "low"
N_LOW_THRESH = 50
P_LOW_THRESH = 35
K_LOW_THRESH = 40


def _get_fertilizer_label(N, P, K):
    n_low = N < N_LOW_THRESH
    p_low = P < P_LOW_THRESH
    k_low = K < K_LOW_THRESH
    for rule in FERTILIZER_RULES:
        if rule["n_low"] == n_low and rule["p_low"] == p_low and rule["k_low"] == k_low:
            return rule["name"]
    return "Organic Manure"


def generate_fertilizer_data(num_samples: int = 3000) -> pd.DataFrame:
    """Generate synthetic fertilizer recommendation dataset."""
    crops = list(CROP_REQUIREMENTS.keys())
    records = []

    for _ in range(num_samples):
        crop = np.random.choice(crops)
        req = CROP_REQUIREMENTS[crop]

        # Generate soil values with noise
        N = float(np.clip(np.random.normal((req["N"][0] + req["N"][1]) / 2, 20), 0, 140))
        P = float(np.clip(np.random.normal((req["P"][0] + req["P"][1]) / 2, 15), 0, 145))
        K = float(np.clip(np.random.normal((req["K"][0] + req["K"][1]) / 2, 15), 0, 205))
        temp = float(np.clip(np.random.normal((req["temperature"][0] + req["temperature"][1]) / 2, 3), 8, 45))
        humidity = float(np.clip(np.random.normal((req["humidity"][0] + req["humidity"][1]) / 2, 10), 14, 99))
        ph = float(np.clip(np.random.normal((req["pH"][0] + req["pH"][1]) / 2, 0.5), 3.5, 9.5))

        label = _get_fertilizer_label(N, P, K)

        records.append({
            "N": round(N, 2),
            "P": round(P, 2),
            "K": round(K, 2),
            "temperature": round(temp, 2),
            "humidity": round(humidity, 2),
            "pH": round(ph, 2),
            "crop": crop,
            "fertilizer": label,
        })

    df = pd.DataFrame(records)
    print(f"  Generated {len(df)} synthetic fertilizer samples")
    print(f"  Fertilizer classes: {df['fertilizer'].nunique()}")
    return df


def load_fertilizer_dataset(csv_path: str) -> pd.DataFrame:
    """Load real fertilizer dataset from CSV and normalize columns."""
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip()

    # Common column name normalization including exact Kaggle dataset headers
    rename_map = {
        "Fertilizer Name": "fertilizer",
        "Fertilizer_Name": "fertilizer",
        "Crop_Type": "crop",
        "Crop Type": "crop",
        "Soil_Type": "soil_type",
        "Nitrogen": "N",
        "Phosphorous": "P",
        "Potassium": "K",
        "Temparature": "temperature",
        "Humidity": "humidity",
    }
    df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns}, inplace=True)

    if "fertilizer" not in df.columns:
        raise ValueError("CSV must have a 'Fertilizer Name' or 'fertilizer' column")

    print(f"  Loaded {len(df)} rows from {csv_path}")
    print(f"  Fertilizer classes: {df['fertilizer'].nunique()}")
    return df


# Feature list adapted for the kaggle dataset (pH is unavailable)
FERTILIZER_FEATURES = ["N", "P", "K", "temperature", "humidity"]


def train_fertilizer_models(df: pd.DataFrame):
    """Train RF and XGBoost for fertilizer prediction."""
    X = df[FERTILIZER_FEATURES].values
    le = LabelEncoder()
    y = le.fit_transform(df["fertilizer"].values)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=200, random_state=42, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1,
            use_label_encoder=False, eval_metric="mlogloss",
            random_state=42, verbosity=0
        ),
    }

    results = {}
    trained = {}

    print("\n  Fertilizer Model Training Results:")
    print("  " + "-" * 45)

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        results[name] = round(acc * 100, 2)
        trained[name] = model
        print(f"  {name:<18} Test Accuracy: {acc*100:.2f}%")

    print("  " + "-" * 45)

    best_name = max(results, key=lambda k: results[k])
    print(f"\n  [SUCCESS] Best Model: {best_name} ({results[best_name]}%)")

    # Report
    best_model = trained[best_name]
    y_pred_best = best_model.predict(X_test)
    print("\n  Classification Report (Fertilizer):")
    print(classification_report(y_test, y_pred_best, target_names=le.classes_))

    return trained, le, results, best_name


def save_fertilizer_models(trained, le, best_name, models_dir):
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(trained[best_name], os.path.join(models_dir, "fertilizer_model.pkl"))
    joblib.dump(le, os.path.join(models_dir, "fertilizer_encoder.pkl"))
    print(f"\n  Fertilizer models saved to: {models_dir}")


def save_fertilizer_visualizations(trained, le, best_name, results, visuals_dir):
    os.makedirs(visuals_dir, exist_ok=True)

    # Feature importance
    model = trained[best_name]
    if hasattr(model, "feature_importances_"):
        plt.figure(figsize=(8, 4))
        imp = pd.Series(model.feature_importances_, index=FERTILIZER_FEATURES)
        imp.sort_values().plot(kind="barh", color="#1565c0")
        plt.title(f"Fertilizer Feature Importance ({best_name})", fontsize=13)
        plt.xlabel("Importance")
        plt.tight_layout()
        plt.savefig(os.path.join(visuals_dir, "fertilizer_feature_importance.png"), dpi=150)
        plt.close()

    # Accuracy bar
    plt.figure(figsize=(7, 3))
    names = list(results.keys())
    accs = [results[n] for n in names]
    colors = ["#0d47a1" if n == best_name else "#90caf9" for n in names]
    bars = plt.bar(names, accs, color=colors, edgecolor="white")
    for bar, acc in zip(bars, accs):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() - 3,
                 f"{acc}%", ha="center", va="top", color="white", fontweight="bold")
    plt.ylim(0, 110)
    plt.ylabel("Accuracy (%)")
    plt.title("Fertilizer Model Comparison", fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(visuals_dir, "fertilizer_model_comparison.png"), dpi=150)
    plt.close()

    print(f"  Visualizations saved to: {visuals_dir}")


def main():
    parser = argparse.ArgumentParser(description="Train fertilizer recommendation model")
    parser.add_argument("--dataset", type=str, default=None,
                        help="Path to real fertilizer CSV dataset (optional)")
    parser.add_argument("--samples", type=int, default=3000,
                        help="Number of synthetic samples (default: 3000)")
    args = parser.parse_args()

    ml_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(ml_dir, "models")
    visuals_dir = os.path.join(ml_dir, "visuals")

    print("=" * 55)
    print("  AgriSense - Fertilizer Recommendation Model Training")
    print("=" * 55)

    if args.dataset:
        print(f"\n[1/4] Loading real dataset: {args.dataset}")
        df = load_fertilizer_dataset(args.dataset)
    else:
        print(f"\n[1/4] Generating synthetic fertilizer data ({args.samples} samples)...")
        df = generate_fertilizer_data(num_samples=args.samples)

    print("\n[2/4] Training models...")
    trained, le, results, best_name = train_fertilizer_models(df)

    print("\n[3/4] Saving models...")
    save_fertilizer_models(trained, le, best_name, models_dir)

    print("\n[4/4] Generating visualizations...")
    save_fertilizer_visualizations(trained, le, best_name, results, visuals_dir)

    print("\n" + "=" * 55)
    print("  [SUCCESS] Fertilizer training complete!")
    print(f"  Best model: {best_name} - {results[best_name]}% accuracy")
    print("=" * 55 + "\n")


if __name__ == "__main__":
    main()
