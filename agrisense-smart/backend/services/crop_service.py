"""
Crop Recommendation Service.
Uses trained ML models (RandomForest/XGBoost) for prediction.
Falls back to rule-based logic if model is not available.
"""

from typing import List, Dict, Optional
from models.schemas import SoilClimateInput
from ml.model_loader import ModelLoader


class CropService:
    """
    Service for predicting the most suitable crop based on
    soil and climate conditions.
    """

    FEATURE_ORDER = ["N", "P", "K", "pH", "temperature", "humidity", "rainfall"]

    def __init__(self):
        self.model_loader = ModelLoader()
        self.model = self.model_loader.load_crop_model()

    def _prepare_features(self, input_data: SoilClimateInput) -> List[float]:
        """Extract features in the exact order the model was trained on."""
        return [
            input_data.N,
            input_data.P,
            input_data.K,
            input_data.pH,
            input_data.temperature,
            input_data.humidity,
            input_data.rainfall,
        ]

    # ─────────────────────────────────────────────
    # Primary Prediction — Returns single best crop
    # ─────────────────────────────────────────────

    def predict_crop(self, input_data: SoilClimateInput) -> str:
        """
        Predict the single best crop. Uses ML model if available,
        otherwise falls back to rule-based logic.
        """
        if self.model:
            top = self.get_top_crops(input_data, top_n=1)
            if top:
                return top[0]["name"]

        return self._rule_based_fallback(input_data)

    # ─────────────────────────────────────────────
    # Top-N Predictions with Confidence
    # ─────────────────────────────────────────────

    def get_top_crops(self, input_data: SoilClimateInput, top_n: int = 3) -> List[Dict]:
        """
        Return top-N crops with confidence percentages.

        Returns:
            [{"name": "Rice", "confidence": 91.52}, ...]
        """
        if self.model is None:
            # Reload in case model was trained after server start
            self.model = self.model_loader.load_crop_model()

        if self.model:
            features = self._prepare_features(input_data)
            return self.model_loader.predict_top_crops(features, top_n=top_n)

        return []

    # ─────────────────────────────────────────────
    # Confidence Score
    # ─────────────────────────────────────────────

    def get_confidence(self, input_data: SoilClimateInput) -> Optional[float]:
        """
        Return the confidence score (0-100) for the top prediction.
        Returns None if model is not available.
        """
        top = self.get_top_crops(input_data, top_n=1)
        if top:
            return top[0]["confidence"]
        return None

    # ─────────────────────────────────────────────
    # Rule-Based Fallback
    # ─────────────────────────────────────────────

    def _rule_based_fallback(self, input_data: SoilClimateInput) -> str:
        """
        Simple rule-based crop prediction used when ML model is unavailable.
        """
        N, P, K = input_data.N, input_data.P, input_data.K
        pH = input_data.pH
        temp = input_data.temperature
        humidity = input_data.humidity
        rainfall = input_data.rainfall

        if rainfall > 200 and humidity > 70 and temp > 20:
            return "Rice"
        elif rainfall < 100 and temp > 25:
            return "Cotton"
        elif N > 80 and P > 40 and K > 40:
            return "Maize"
        elif pH > 7.0 and temp < 25:
            return "Wheat"
        elif rainfall > 150 and N > 50:
            return "Sugarcane"
        elif pH < 6.0 and humidity > 60:
            return "Jute"
        elif temp > 30 and rainfall < 150:
            return "Millet"
        elif P > 50 and K > 50:
            return "Chickpea"
        else:
            return "Wheat"
