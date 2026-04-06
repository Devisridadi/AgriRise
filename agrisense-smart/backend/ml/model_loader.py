"""
ML Model Loader Utility.
Handles loading and caching of trained ML models.
"""

import os
import logging
from typing import Optional, Any, List, Dict

logger = logging.getLogger(__name__)


class ModelLoader:
    """
    Singleton utility for loading and caching ML models.
    Supports scikit-learn (.pkl) and XGBoost models.
    """

    _instance = None
    _models_cache: dict = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(__file__), "models")

    # ─────────────────────────────────────────────
    # Crop Model
    # ─────────────────────────────────────────────

    def load_crop_model(self) -> Optional[Any]:
        """
        Load the crop recommendation model (Random Forest / XGBoost).
        Input features: [N, P, K, pH, temperature, humidity, rainfall]
        Output: crop class probabilities
        """
        if "crop_model" in self._models_cache:
            return self._models_cache["crop_model"]

        model_path = os.path.join(self.models_dir, "crop_model.pkl")
        encoder_path = os.path.join(self.models_dir, "label_encoder.pkl")

        if os.path.exists(model_path):
            try:
                import joblib
                model = joblib.load(model_path)
                self._models_cache["crop_model"] = model
                logger.info("Crop model loaded successfully.")

                if os.path.exists(encoder_path):
                    self._models_cache["label_encoder"] = joblib.load(encoder_path)
                    logger.info("Label encoder loaded successfully.")

                return model
            except Exception as e:
                logger.error(f"Failed to load crop model: {e}")
                return None

        logger.warning(f"Crop model not found at {model_path}. Run ml/train_models.py to train.")
        return None

    def load_fertilizer_model(self) -> Optional[Any]:
        """
        Load the fertilizer recommendation model.
        Input features: [N, P, K, temperature, humidity, pH]
        Output: fertilizer class
        """
        if "fertilizer_model" in self._models_cache:
            return self._models_cache["fertilizer_model"]

        model_path = os.path.join(self.models_dir, "fertilizer_model.pkl")
        encoder_path = os.path.join(self.models_dir, "fertilizer_encoder.pkl")

        if os.path.exists(model_path):
            try:
                import joblib
                model = joblib.load(model_path)
                self._models_cache["fertilizer_model"] = model
                logger.info("Fertilizer model loaded successfully.")

                if os.path.exists(encoder_path):
                    self._models_cache["fertilizer_encoder"] = joblib.load(encoder_path)
                    logger.info("Fertilizer encoder loaded successfully.")

                return model
            except Exception as e:
                logger.error(f"Failed to load fertilizer model: {e}")
                return None

        logger.warning(f"Fertilizer model not found at {model_path}. Run ml/train_fertilizer.py to train.")
        return None

    def load_soil_model(self) -> Optional[Any]:
        """
        Load the soil correction model (optional).
        Currently uses rule-based logic in SoilCorrectionService.
        """
        if "soil_model" in self._models_cache:
            return self._models_cache["soil_model"]

        model_path = os.path.join(self.models_dir, "soil_model.pkl")
        if os.path.exists(model_path):
            try:
                import joblib
                model = joblib.load(model_path)
                self._models_cache["soil_model"] = model
                return model
            except Exception as e:
                logger.error(f"Failed to load soil model: {e}")
        return None

    # ─────────────────────────────────────────────
    # Top Crop Predictions with Confidence
    # ─────────────────────────────────────────────

    def predict_top_crops(self, features: List[float], top_n: int = 3) -> List[Dict]:
        """
        Return top-N crop predictions with confidence scores.

        Args:
            features: [N, P, K, pH, temperature, humidity, rainfall]
            top_n: Number of top predictions to return

        Returns:
            List of dicts: [{"name": "Rice", "confidence": 91.5}, ...]
        """
        model = self.load_crop_model()
        encoder = self._models_cache.get("label_encoder")

        if model is None or encoder is None:
            return []

        try:
            import numpy as np
            X = np.array(features).reshape(1, -1)

            if hasattr(model, "predict_proba"):
                proba = model.predict_proba(X)[0]
                top_indices = proba.argsort()[::-1][:top_n]
                return [
                    {
                        "name": str(encoder.classes_[i]),
                        "confidence": round(float(proba[i]) * 100, 2)
                    }
                    for i in top_indices
                ]
            else:
                # Models without predict_proba (rare)
                pred = model.predict(X)[0]
                return [{"name": str(encoder.classes_[pred]), "confidence": 100.0}]

        except Exception as e:
            logger.error(f"Top crop prediction failed: {e}")
            return []

    # ─────────────────────────────────────────────
    # Bulk Load / Status
    # ─────────────────────────────────────────────

    def load_all_models(self) -> dict:
        """Load all available models at startup."""
        return {
            "crop_model": self.load_crop_model() is not None,
            "fertilizer_model": self.load_fertilizer_model() is not None,
            "soil_model": self.load_soil_model() is not None,
        }

    def get_model_info(self) -> dict:
        """Return metadata about model availability and paths."""
        def _status(key):
            return "loaded" if key in self._models_cache else "not loaded"

        return {
            "crop_model": {
                "path": os.path.join(self.models_dir, "crop_model.pkl"),
                "status": _status("crop_model"),
                "type": "Random Forest / XGBoost Classifier",
                "features": ["N", "P", "K", "pH", "temperature", "humidity", "rainfall"],
                "exists": os.path.exists(os.path.join(self.models_dir, "crop_model.pkl")),
            },
            "fertilizer_model": {
                "path": os.path.join(self.models_dir, "fertilizer_model.pkl"),
                "status": _status("fertilizer_model"),
                "type": "Random Forest Classifier",
                "features": ["N", "P", "K", "temperature", "humidity", "pH"],
                "exists": os.path.exists(os.path.join(self.models_dir, "fertilizer_model.pkl")),
            },
            "soil_model": {
                "path": os.path.join(self.models_dir, "soil_model.pkl"),
                "status": _status("soil_model"),
                "type": "Rule-based (ML optional)",
                "features": ["N", "P", "K", "pH"],
                "exists": os.path.exists(os.path.join(self.models_dir, "soil_model.pkl")),
            },
        }
