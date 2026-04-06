"""
Evaluation Service.
Compares soil/climate inputs with crop requirements and suggests remedies or alternatives.
"""

from typing import List, Dict, Any, Optional
from models.schemas import SoilClimateInput
from services.crop_data import CROP_REQUIREMENTS, ORGANIC_REMEDIES

class EvaluationService:
    """
    Evaluates how well a specific crop fits the current environmental conditions.
    """

    def evaluate_suitability(self, input_data: SoilClimateInput, target_crop: str) -> Dict[str, Any]:
        """
        Main entry point for evaluating crop suitability.
        """
        if target_crop not in CROP_REQUIREMENTS:
            return {
                "is_suitable": False,
                "status": "Unknown Crop",
                "message": f"Requirements for '{target_crop}' are not available.",
                "remedies": [],
                "can_harvest": False
            }

        reqs = CROP_REQUIREMENTS[target_crop]
        remedies = []
        is_suitable = True
        can_harvest = True # Assume true unless climate is way off
        
        # 1. Check Soil Nutrients (Fixable with fertilizers)
        for nutrient in ["N", "P", "K"]:
            val = getattr(input_data, nutrient)
            min_val, max_val = reqs[nutrient]
            if val < min_val:
                is_suitable = False
                remedies.extend(ORGANIC_REMEDIES.get(f"{nutrient}_deficiency", [f"Apply organic {nutrient} source."]))
            elif val > max_val:
                # High nutrient is less of a "fix" but worth noting
                pass

        # 2. Check pH (Fixable)
        ph_val = input_data.pH
        ph_min, ph_max = reqs["pH"]
        if ph_val < ph_min:
            is_suitable = False
            remedies.extend(ORGANIC_REMEDIES["pH_low"])
        elif ph_val > ph_max:
            is_suitable = False
            remedies.extend(ORGANIC_REMEDIES["pH_high"])

        # 3. Check Climate (Hard to fix -> "Non-harvestable")
        climate_issues = []
        if input_data.temperature < reqs["temperature"][0] - 5 or input_data.temperature > reqs["temperature"][1] + 5:
            can_harvest = False
            climate_issues.append("Extreme temperature difference")
        
        if input_data.rainfall < reqs["rainfall"][0] * 0.5 or input_data.rainfall > reqs["rainfall"][1] * 2:
            can_harvest = False
            climate_issues.append("Severe rainfall mismatch")

        if not can_harvest:
            is_suitable = False

        return {
            "is_suitable": is_suitable,
            "can_harvest": can_harvest,
            "status": "Excellent" if is_suitable else ("Manageable" if can_harvest else "Not Suitable"),
            "message": "Crop is well-suited for your soil." if is_suitable else 
                       ("Soil adjustment required." if can_harvest else f"Poor fit: {', '.join(climate_issues)}"),
            "remedies": remedies if not is_suitable else [],
            "ideal_values": reqs
        }

    def get_top_alternatives(self, input_data: SoilClimateInput, count: int = 4) -> List[Dict[str, Any]]:
        """
        Suggests top crops based on a simple score and returns their ideal requirements.
        """
        scores = []
        for crop, reqs in CROP_REQUIREMENTS.items():
            score = 0
            # Basic scoring based on how many parameters are in range
            for param in ["N", "P", "K", "pH", "temperature", "humidity", "rainfall"]:
                val = getattr(input_data, param)
                if reqs[param][0] <= val <= reqs[param][1]:
                    score += 1
            scores.append({
                "name": crop,
                "score": score,
                "requirements": reqs
            })
        
        # Sort by score descending
        scores.sort(key=lambda x: x["score"], reverse=True)
        return scores[:count]
