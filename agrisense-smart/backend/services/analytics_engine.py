"""
Local Analytics Engine for detailed soil analysis and improvement suggestions.
Matches exactly what the frontend expects by providing crop_health_data, priority_crops, etc.
"""

import logging
from typing import Dict, Any, List

# Added type: ignore to squash IDE specific Pylance workspace resolution errors
from models.schemas import SoilClimateInput  # type: ignore
from services.crop_data import get_crop_ideal, CROP_REQUIREMENTS  # type: ignore

logger = logging.getLogger(__name__)

class CloudAnalyticsService:
    def __init__(self):
        pass

    async def get_analysis(self, input_data: SoilClimateInput, crop_name: str) -> dict:
        """
        Get detailed algorithmic comparison and suggestions natively using python logic.
        Returns the exact JSON structure expected by the frontend.
        """
        ideal = get_crop_ideal(crop_name)
        
        # 1. Generate Comparison
        comparison = {}
        def check_status(val, r_min, r_max, unit):
            if val < r_min: return f"Below ideal range ({r_min}-{r_max} {unit}). Needs Supplementation."
            if val > r_max: return f"Above ideal range ({r_min}-{r_max} {unit}). Might risk toxicity."
            return f"Optimal! Within range ({r_min}-{r_max} {unit})."

        comparison["N"] = check_status(input_data.N, ideal['N'][0], ideal['N'][1], "kg/ha")
        comparison["P"] = check_status(input_data.P, ideal['P'][0], ideal['P'][1], "kg/ha")
        comparison["K"] = check_status(input_data.K, ideal['K'][0], ideal['K'][1], "kg/ha")
        comparison["pH"] = check_status(input_data.pH, ideal['pH'][0], ideal['pH'][1], "")
        comparison["temperature"] = check_status(input_data.temperature, ideal['temperature'][0], ideal['temperature'][1], "°C")
        comparison["humidity"] = check_status(input_data.humidity, ideal['humidity'][0], ideal['humidity'][1], "%")
        comparison["rainfall"] = check_status(input_data.rainfall, ideal['rainfall'][0], ideal['rainfall'][1], "mm")

        # 2. Suggestions
        ph_adj = "Apply lime if too acidic; apply sulfur if too alkaline." if (input_data.pH < ideal['pH'][0] or input_data.pH > ideal['pH'][1]) else "pH is perfectly balanced. Maintain your current practices."
        nut_add = []
        if input_data.N < ideal['N'][0]: nut_add.append("Nitrogen (N)")
        if input_data.P < ideal['P'][0]: nut_add.append("Phosphorus (P)")
        if input_data.K < ideal['K'][0]: nut_add.append("Potassium (K)")
        nut_str = f"Add {', '.join(nut_add)} through enriched natural compost or synthetic mixes to match ideal demands." if nut_add else "Nutrients are balanced. No major additions needed."
        
        moisture = "Increase irrigation frequency." if input_data.rainfall < ideal['rainfall'][0] else ("Improve drainage." if input_data.rainfall > ideal['rainfall'][1] else "Water levels are ideal. Keep up current watering schedule.")
        
        suggestions = {
            "ph_adjustment": ph_adj,
            "nutrient_addition": nut_str,
            "moisture_improvement": moisture,
            "organic_matter_correction": "Incorporate well-rotted manure, compost, or cover crops annually to maintain soil biology.",
            "organic_advice": "Focus on crop rotation and organic mulch to retain soil structure and suppress weeds naturally."
        }

        # 3. Fertilizers Plan
        fert_plan = f"Depending on the exact growth stage of {crop_name}, apply a balanced NPK mix favoring your deficiencies. "
        if nut_add:
            fert_plan += f"Prioritize inputs rich in {', '.join([n.split()[0] for n in nut_add])}. Split applications during vegetative and flowering stages for maximum efficiency."
        else:
            fert_plan += "Stick to maintenance dosages using slow-release organic fertilizers."

        # 4. Soil Correction
        soil_diffs = []
        if input_data.pH < ideal['pH'][0]: soil_diffs.append("acidic tendencies")
        if input_data.pH > ideal['pH'][1]: soil_diffs.append("alkaline tendencies")
        if input_data.N < ideal['N'][0]: soil_diffs.append("nitrogen deficiency")
        if not soil_diffs:
            soil_corr = "Your soil structure is healthy. Continue periodic lab testing to prevent future depletion."
        else:
            soil_corr = f"Corrective measures needed for: {', '.join(soil_diffs)}. Address these prior to the onset of the main growing season."

        # 5. Crop Health Data
        health_data = f"With {input_data.temperature}°C average weather, {crop_name} yields best when planted on time. Ensure continuous monitoring for local pest outbreaks common at {input_data.humidity}% humidity."

        # 6. Priority Crops
        def score_crop(c_ideal, data):
            sc = 100
            if data.N < c_ideal['N'][0] or data.N > c_ideal['N'][1]: sc -= 10
            if data.P < c_ideal['P'][0] or data.P > c_ideal['P'][1]: sc -= 10
            if data.K < c_ideal['K'][0] or data.K > c_ideal['K'][1]: sc -= 10
            if data.pH < c_ideal['pH'][0] or data.pH > c_ideal['pH'][1]: sc -= 20
            if data.temperature < c_ideal['temperature'][0] or data.temperature > c_ideal['temperature'][1]: sc -= 20
            if data.rainfall < c_ideal['rainfall'][0] or data.rainfall > c_ideal['rainfall'][1]: sc -= 15
            return max(10, sc)

        scored_crops: List[Dict[str, Any]] = []
        for crp, c_ideal in CROP_REQUIREMENTS.items():
            if crp.lower() == crop_name.lower():
                continue
            sc = score_crop(c_ideal, input_data)
            scored_crops.append({
                "name": crp,
                "suitability_score": sc,
                "data": f"Matches {sc}% of optimal growing parameters (especially NPK and climate alignment)."
            })
        
        # Sort and get top 3
        scored_crops.sort(key=lambda x: x['suitability_score'], reverse=True)
        priority_crops = scored_crops[:3]  # type: ignore

        return {
            "comparison": comparison,
            "suggestions": suggestions,
            "fertilizers": fert_plan,
            "soil_correction": soil_corr,
            "crop_health_data": health_data,
            "priority_crops": priority_crops
        }
