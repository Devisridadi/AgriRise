"""
Crop Recommendation Model Training Script.
Integrated Soil-Climate Based Crop Recommendation System.

Usage:
    python ml/train_models.py                          # Use synthetic data
    python ml/train_models.py --dataset path/to.csv   # Use real dataset

Expected CSV columns: N, P, K, temperature, humidity, ph (or pH), rainfall, label
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
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.crop_data import CROP_REQUIREMENTS


# ─────────────────────────────────────────────
# 1. Synthetic Data Generation
# ─────────────────────────────────────────────

def generate_synthetic_data(num_samples: int = 5000, noise_level: float = 0.15) -> pd.DataFrame:
    """
    Generate realistic synthetic crop data from CROP_REQUIREMENTS.
    Each crop gets an equal share of samples. Gaussian noise is added
    to simulate real-world soil variability.
    """
    crops = list(CROP_REQUIREMENTS.keys())
    samples_per_crop = num_samples // len(crops)
    records = []

    for crop in crops:
        req = CROP_REQUIREMENTS[crop]
        for _ in range(samples_per_crop):
            row = {}
            for feature in ["N", "P", "K", "pH", "temperature", "humidity", "rainfall"]:
                lo, hi = req[feature]
                mid = (lo + hi) / 2.0
                span = (hi - lo) / 2.0 if hi != lo else 1.0
                # Gaussian centered at midpoint, std = noise_level * span
                val = np.random.normal(loc=mid, scale=noise_level * span + 0.5)
                # Clip to slightly wider range for realism
                val = float(np.clip(val, lo * 0.85, hi * 1.15))
                row[feature] = round(val, 2)
            row["label"] = crop
            records.append(row)

    df = pd.DataFrame(records).sample(frac=1, random_state=42).reset_index(drop=True)
    print(f"  Generated {len(df)} synthetic samples for {len(crops)} crops")
    return df


# ─────────────────────────────────────────────
# 2. Load Real Dataset (CSV)
# ─────────────────────────────────────────────

def load_real_dataset(csv_path: str) -> pd.DataFrame:
    """
    Load a real crop recommendation dataset from CSV.
    Normalizes column names to match internal schema.
    Expected columns: N, P, K, temperature, humidity, ph (or pH), rainfall, label
    """
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip()

    # Normalize pH column name
    if "ph" in df.columns and "pH" not in df.columns:
        df.rename(columns={"ph": "pH"}, inplace=True)

    required = {"N", "P", "K", "pH", "temperature", "humidity", "rainfall", "label"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")

    print(f"  Loaded {len(df)} real samples, {df['label'].nunique()} crops")
    return df


# ─────────────────────────────────────────────
# 3. Train & Evaluate Models
# ─────────────────────────────────────────────

FEATURE_COLS = ["N", "P", "K", "pH", "temperature", "humidity", "rainfall"]

def train_all_models(df: pd.DataFrame):
    """
    Train RandomForest, ExtraTrees, and XGBoost on the dataset.
    Returns the best model, label encoder, and accuracy info.
    """
    X = df[FEATURE_COLS].values
    le = LabelEncoder()
    y = le.fit_transform(df["label"].values)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=None,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1
        ),
        "Extra Trees": ExtraTreesClassifier(
            n_estimators=200,
            random_state=42,
            n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric="mlogloss",
            random_state=42,
            verbosity=0
        ),
    }

    results = {}
    trained = {}

    print("\n  Model Training Results:")
    print("  " + "-" * 45)

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy", n_jobs=-1)
        results[name] = {
            "test_accuracy": round(acc * 100, 2),
            "cv_mean": round(cv_scores.mean() * 100, 2),
            "cv_std": round(cv_scores.std() * 100, 2),
        }
        trained[name] = model
        print(f"  {name:<18} Test: {acc*100:.2f}%  CV: {cv_scores.mean()*100:.2f}% ±{cv_scores.std()*100:.2f}%")

    print("  " + "-" * 45)

    # Pick best model by test accuracy
    best_name = max(results, key=lambda k: results[k]["test_accuracy"])
    print(f"\n  [SUCCESS] Best Model: {best_name} ({results[best_name]['test_accuracy']}% accuracy)")

    # Final report using best model
    best_model = trained[best_name]
    y_pred_best = best_model.predict(X_test)
    print("\n  Classification Report (Best Model):")
    print(classification_report(y_test, y_pred_best, target_names=le.classes_))

    return trained, le, results, best_name, X_test, y_test, y_pred_best


# ─────────────────────────────────────────────
# 4. Save Models & Visualizations
# ─────────────────────────────────────────────

def save_models(trained: dict, le: LabelEncoder, best_name: str, models_dir: str):
    """Save the best model and label encoder to disk."""
    os.makedirs(models_dir, exist_ok=True)

    # Save best model as primary
    joblib.dump(trained[best_name], os.path.join(models_dir, "crop_model.pkl"))
    joblib.dump(le, os.path.join(models_dir, "label_encoder.pkl"))

    # Save all models individually for reference
    for name, model in trained.items():
        safe_name = name.lower().replace(" ", "_")
        joblib.dump(model, os.path.join(models_dir, f"crop_model_{safe_name}.pkl"))

    print(f"\n  Models saved to: {models_dir}")
    print(f"  Primary model: crop_model.pkl ({best_name})")


def save_visualizations(
    trained: dict,
    le: LabelEncoder,
    best_name: str,
    results: dict,
    X_test,
    y_test,
    y_pred_best,
    visuals_dir: str
):
    """Generate and save training visualizations."""
    os.makedirs(visuals_dir, exist_ok=True)
    best_model = trained[best_name]

    # 1. Feature Importance
    if hasattr(best_model, "feature_importances_"):
        plt.figure(figsize=(10, 5))
        importance = pd.Series(best_model.feature_importances_, index=FEATURE_COLS)
        importance.sort_values().plot(kind="barh", color="#2e7d32")
        plt.title(f"Feature Importance ({best_name})", fontsize=14)
        plt.xlabel("Relative Importance")
        plt.tight_layout()
        plt.savefig(os.path.join(visuals_dir, "feature_importance.png"), dpi=150)
        plt.close()

    # 2. Confusion Matrix
    plt.figure(figsize=(14, 12))
    from sklearn.metrics import confusion_matrix
    cm = confusion_matrix(y_test, y_pred_best)
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="YlGn",
        xticklabels=le.classes_, yticklabels=le.classes_,
        linewidths=0.5
    )
    plt.title(f"Confusion Matrix — {best_name}", fontsize=14)
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.xticks(rotation=45, ha="right", fontsize=8)
    plt.yticks(rotation=0, fontsize=8)
    plt.tight_layout()
    plt.savefig(os.path.join(visuals_dir, "confusion_matrix.png"), dpi=150)
    plt.close()

    # 3. Model Comparison Bar Chart
    plt.figure(figsize=(9, 4))
    names = list(results.keys())
    accs = [results[n]["test_accuracy"] for n in names]
    colors = ["#1b5e20" if n == best_name else "#81c784" for n in names]
    bars = plt.bar(names, accs, color=colors, edgecolor="white")
    for bar, acc in zip(bars, accs):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height() - 3,
                 f"{acc}%", ha="center", va="top", color="white", fontweight="bold")
    plt.ylim(0, 110)
    plt.ylabel("Test Accuracy (%)")
    plt.title("Model Comparison — Crop Recommendation", fontsize=13)
    plt.tight_layout()
    plt.savefig(os.path.join(visuals_dir, "model_comparison.png"), dpi=150)
    plt.close()

    print(f"  Visualizations saved to: {visuals_dir}")


# ─────────────────────────────────────────────
# 5. Main Entry
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Train crop recommendation models")
    parser.add_argument(
        "--dataset", type=str, default=None,
        help="Path to real CSV dataset (optional). If not provided, synthetic data is used."
    )
    parser.add_argument(
        "--samples", type=int, default=5000,
        help="Number of synthetic samples to generate (default: 5000)"
    )
    args = parser.parse_args()

    ml_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(ml_dir, "models")
    visuals_dir = os.path.join(ml_dir, "visuals")

    print("=" * 55)
    print("  AgriSense - Crop Recommendation Model Training")
    print("=" * 55)

    # Step 1: Load or generate data
    if args.dataset:
        print(f"\n[1/4] Loading real dataset: {args.dataset}")
        df = load_real_dataset(args.dataset)
    else:
        print(f"\n[1/4] Generating synthetic dataset ({args.samples} samples)...")
        df = generate_synthetic_data(num_samples=args.samples)

    # Step 2: Train
    print("\n[2/4] Training models (RF, ExtraTrees, XGBoost)...")
    trained, le, results, best_name, X_test, y_test, y_pred = train_all_models(df)

    # Step 3: Save
    print("\n[3/4] Saving models...")
    save_models(trained, le, best_name, models_dir)

    # Step 4: Visualize
    print("\n[4/4] Generating visualizations...")
    save_visualizations(trained, le, best_name, results, X_test, y_test, y_pred, visuals_dir)

    print("\n" + "=" * 55)
    print("  [SUCCESS] Training complete!")
    print(f"  Best model: {best_name} - {results[best_name]['test_accuracy']}% accuracy")
    print("=" * 55 + "\n")


if __name__ == "__main__":
    main()
