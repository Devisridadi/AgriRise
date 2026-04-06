"""
Fertilizer Recommendation Service.
Uses trained ML model (RandomForest) for fertilizer prediction.
Falls back to rule-based NPK logic if model is not available.
"""

from typing import List
from models.schemas import SoilClimateInput
from ml.model_loader import ModelLoader


class FertilizerService:
    """
    Service for recommending fertilizers based on soil condition and target crop.
    """

    FEATURE_ORDER = ["N", "P", "K", "temperature", "humidity"]

    def __init__(self):
        self.model_loader = ModelLoader()
        self.model = self.model_loader.load_fertilizer_model()

        # Optimal nutrient thresholds
        self.N_LOW = 50
        self.P_LOW = 35
        self.K_LOW = 40

    def _prepare_features(self, input_data: SoilClimateInput) -> List[float]:
        """Prepare feature array for fertilizer model."""
        return [
            input_data.N,
            input_data.P,
            input_data.K,
            input_data.temperature,
            input_data.humidity,
        ]

    # ─────────────────────────────────────────────
    # Primary Recommendation
    # ─────────────────────────────────────────────

    def recommend_fertilizer(
        self,
        input_data: SoilClimateInput,
        target_crop: str
    ) -> List[str]:
        """
        Recommend fertilizers. Uses ML model if available, else rule-based fallback.

        Returns:
            List[str]: Recommended fertilizer names
        """
        # Try ML model first
        ml_result = self._ml_predict(input_data)
        if ml_result:
            # Combine ML primary recommendation with crop-specific supplement
            crop_specific = self._get_crop_specific_fertilizer(target_crop)
            if crop_specific and crop_specific not in ml_result:
                ml_result.append(crop_specific)
            return ml_result

        # Fallback to rule-based
        return self._rule_based_recommend(input_data, target_crop)

    # ─────────────────────────────────────────────
    # ML Prediction
    # ─────────────────────────────────────────────

    def _ml_predict(self, input_data: SoilClimateInput) -> List[str]:
        """Use trained ML model for fertilizer recommendation."""
        if self.model is None:
            # Try reloading in case model was trained after server start
            self.model = self.model_loader.load_fertilizer_model()

        if self.model is None:
            return []

        try:
            import numpy as np
            encoder = self.model_loader._models_cache.get("fertilizer_encoder")
            if encoder is None:
                return []

            features = self._prepare_features(input_data)
            X = np.array(features).reshape(1, -1)

            if hasattr(self.model, "predict_proba"):
                proba = self.model.predict_proba(X)[0]
                top_idx = proba.argsort()[::-1][:2]  # Top 2 fertilizer recommendations
                return [
                    str(encoder.classes_[i])
                    for i in top_idx
                    if proba[i] > 0.1  # Only include if confidence > 10%
                ]
            else:
                pred = self.model.predict(X)[0]
                return [str(encoder.classes_[pred])]

        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Fertilizer ML prediction failed: {e}")
            return []

    # ─────────────────────────────────────────────
    # Rule-Based Fallback
    # ─────────────────────────────────────────────

    def _rule_based_recommend(
        self,
        input_data: SoilClimateInput,
        target_crop: str
    ) -> List[str]:
        """Rule-based fertilizer recommendations based on NPK deficiencies."""
        recommendations = []
        N, P, K = input_data.N, input_data.P, input_data.K

        if N < self.N_LOW:
            recommendations.append("Urea")
            if N < 30:
                recommendations.append("Ammonium Sulphate")

        if P < self.P_LOW:
            recommendations.append("DAP (Di-Ammonium Phosphate)")
            if P < 20:
                recommendations.append("SSP (Single Super Phosphate)")

        if K < self.K_LOW:
            recommendations.append("MOP (Muriate of Potash)")
            if K < 25:
                recommendations.append("SOP (Sulphate of Potash)")

        if N < 50 and P < 40 and K < 40:
            recommendations.append("NPK Complex (10-26-26)")

        if not recommendations:
            recommendations.append("Organic Manure (maintenance dose)")

        crop_specific = self._get_crop_specific_fertilizer(target_crop)
        if crop_specific and crop_specific not in recommendations:
            recommendations.append(crop_specific)

        return recommendations

    def _get_crop_specific_fertilizer(self, crop: str) -> str:
        """Crop-specific micronutrient / secondary fertilizer supplement."""
        crop_fertilizers = {
            "Rice": "Zinc Sulphate",
            "Wheat": "NPK 12-32-16",
            "Maize": "NPK 20-20-0",
            "Cotton": "Potash",
            "Sugarcane": "Urea + MOP",
            "Jute": "Nitrogen-rich fertilizer",
            "Chickpea": "Rhizobium culture",
            "Millet": "DAP",
            "Banana": "NPK 8-24-24",
            "Coffee": "Ammonium Nitrate",
            "Coconut": "NPK 13-0-45",
            "Mango": "NPK 10-10-10",
            "Grapes": "Potassium Sulphate",
            "Papaya": "Calcium Nitrate",
            "Orange": "Magnesium Sulphate",
        }
        return crop_fertilizers.get(crop, "")
