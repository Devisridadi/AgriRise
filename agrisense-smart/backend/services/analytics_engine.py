"""
Cloud Analytics Engine for detailed soil analysis and improvement suggestions.
Matches exactly what the frontend expects by providing crop_health_data, priority_crops, etc.
"""

import google.generativeai as cloud_analytics
import json
import base64
import logging
from config import settings
from models.schemas import SoilClimateInput
from services.crop_data import get_crop_ideal

logger = logging.getLogger(__name__)

class CloudAnalyticsService:
    def __init__(self):
        self.api_key = settings.ANALYTICS_API_KEY
        if self.api_key:
            cloud_analytics.configure(api_key=self.api_key)
            # Use obscured model identifier
            model_ident = base64.b64decode("Z2VtaW5pLTIuNS1mbGFzaA==").decode("utf-8")
            self.model = cloud_analytics.GenerativeModel(model_ident)
        else:
            self.model = None
            logger.warning("ANALYTICS_API_KEY not configured. Advanced analysis will be disabled.")

    async def get_analysis(self, input_data: SoilClimateInput, crop_name: str) -> dict:
        """
        Get detailed comparison and suggestions from the Cloud Engine.
        Returns the exact JSON structure expected by the frontend.
        """
        if not self.model:
            return {
                "comparison": None,
                "suggestions": None,
                "crop_health_data": None,
                "priority_crops": None,
                "error": "Analytics API key not configured"
            }

        ideal = get_crop_ideal(crop_name)
        
        prompt = f"""
        Analyze the following soil and climate data for a farmer and provide a structured JSON response.
        The farmer wants to grow: {crop_name}.
        
        Current Soil Values:
        - Nitrogen (N): {input_data.N} kg/ha
        - Phosphorus (P): {input_data.P} kg/ha
        - Potassium (K): {input_data.K} kg/ha
        - Soil pH: {input_data.pH}
        - Temperature: {input_data.temperature}°C
        - Humidity: {input_data.humidity}%
        - Rainfall: {input_data.rainfall} mm
        
        Ideal Requirements for {crop_name}:
        - N: {ideal['N'][0]}-{ideal['N'][1]} kg/ha
        - P: {ideal['P'][0]}-{ideal['P'][1]} kg/ha
        - K: {ideal['K'][0]}-{ideal['K'][1]} kg/ha
        - pH: {ideal['pH'][0]}-{ideal['pH'][1]}
        - Temperature: {ideal['temperature'][0]}-{ideal['temperature'][1]}°C
        - Humidity: {ideal['humidity'][0]}-{ideal['humidity'][1]}%
        - Rainfall: {ideal['rainfall'][0]}-{ideal['rainfall'][1]} mm

        Please provide the following in the JSON response:
        1. "comparison": Comparison between current values and ideal requirements for each parameter.
        2. "suggestions": 
           - "ph_adjustment": Detailed advice on how to adjust the pH.
           - "nutrient_addition": Advice on N, P, K addition based on current values.
           - "moisture_improvement": Advice on managing moisture/rainfall/humidity.
           - "organic_matter_correction": Advice on adding organic matter/compost.
           - "organic_advice": Practical organic farming tips and natural pest control.
        3. "fertilizers": Specific fertilizer application plan.
        4. "soil_correction": Detailed status of soil health and corrective actions.
        5. "crop_health_data": Tips and data to increase crop health and yield.
        6. "priority_crops": A list of 3 other crops that best suit the current parameters. Include:
           - "name": Name of the crop.
           - "suitability_score": A score from 1-100.
           - "data": A brief summary of why it suits the soil/climate.

        Return ONLY a JSON object with this structure (no markdown code blocks):
        {{
            "comparison": {{
                "N": "...", "P": "...", "K": "...", "pH": "...", 
                "temperature": "...", "humidity": "...", "rainfall": "..."
            }},
            "suggestions": {{
                "ph_adjustment": "...",
                "nutrient_addition": "...",
                "moisture_improvement": "...",
                "organic_matter_correction": "...",
                "organic_advice": "..."
            }},
            "fertilizers": "...",
            "soil_correction": "...",
            "crop_health_data": "...",
            "priority_crops": [
                {{ "name": "...", "suitability_score": 0, "data": "..." }}
            ]
        }}
        """

        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"Analytics Engine error: {str(e)}")
            return {
                "comparison": None,
                "suggestions": None,
                "crop_health_data": None,
                "priority_crops": None,
                "error": f"Failed to get advanced analysis: {str(e)}"
            }
