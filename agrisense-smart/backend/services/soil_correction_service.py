"""
Soil Correction Service.
Provides recommendations for correcting soil deficiencies.
"""

from models.schemas import SoilClimateInput
from ml.model_loader import ModelLoader


class SoilCorrectionService:
    """
    Service for analyzing soil conditions and providing 
    correction recommendations to optimize fertility.
    """
    
    def __init__(self):
        """Initialize the soil correction service"""
        self.model_loader = ModelLoader()
        self.model = None
        self._load_model()
        
        # pH thresholds
        self.ACIDIC_THRESHOLD = 6.0
        self.ALKALINE_THRESHOLD = 7.5
        self.OPTIMAL_PH_MIN = 6.0
        self.OPTIMAL_PH_MAX = 7.5
    
    def _load_model(self):
        """
        Load the trained soil correction model.
        # ML model will be integrated here
        """
        # Placeholder: Model loading will happen here
        # self.model = self.model_loader.load_soil_model()
        pass
    
    def get_correction(self, input_data: SoilClimateInput) -> str:
        """
        Analyze soil parameters and provide correction recommendations.
        
        Args:
            input_data: Current soil and climate parameters
            
        Returns:
            str: Soil correction recommendation
        """
        # ML model will be integrated here
        # features = self._prepare_features(input_data)
        # prediction = self.model.predict(features)
        # return self._generate_recommendation(prediction, input_data)
        
        # ============================================================
        # PLACEHOLDER LOGIC - Replace with actual ML model prediction
        # ============================================================
        
        corrections = []
        
        pH = input_data.pH
        N, P, K = input_data.N, input_data.P, input_data.K
        
        # pH corrections
        if pH < self.ACIDIC_THRESHOLD:
            severity = "strongly " if pH < 5.0 else ""
            corrections.append(
                f"Soil is {severity}acidic (pH {pH}). "
                f"Apply agricultural lime (calcium carbonate) at "
                f"{self._calculate_lime_rate(pH)} kg/ha to raise pH. "
                f"Consider using dolomitic lime for magnesium-deficient soils."
            )
        elif pH > self.ALKALINE_THRESHOLD:
            severity = "strongly " if pH > 8.5 else ""
            corrections.append(
                f"Soil is {severity}alkaline (pH {pH}). "
                f"Apply eleite sulfur or gypsum to lower pH. "
                f"Incorporate organic matter like compost or peat moss."
            )
        
        # Nutrient deficiency corrections
        if N < 40:
            corrections.append(
                f"Nitrogen is low ({N} kg/ha). "
                f"Apply organic manure, green manure, or nitrogen-fixing cover crops. "
                f"Consider crop rotation with legumes."
            )
        
        if P < 30:
            corrections.append(
                f"Phosphorus is deficient ({P} kg/ha). "
                f"Apply rock phosphate or bone meal for organic correction. "
                f"Ensure pH is optimal for phosphorus availability."
            )
        
        if K < 35:
            corrections.append(
                f"Potassium is low ({K} kg/ha). "
                f"Apply wood ash, kelp meal, or potassium sulfate. "
                f"Avoid excessive nitrogen which can inhibit K uptake."
            )
        
        # If no corrections needed
        if not corrections:
            return (
                "Soil parameters are within optimal ranges. "
                "Maintain current practices with regular organic matter addition. "
                "Consider periodic soil testing to monitor nutrient levels."
            )
        
        return " | ".join(corrections)
    
    def _calculate_lime_rate(self, current_ph: float) -> int:
        """
        Calculate approximate lime application rate.
        
        # This will be enhanced with soil texture data from ML model
        """
        # Simplified calculation - actual rates depend on soil texture
        ph_deficit = 6.5 - current_ph
        
        if ph_deficit <= 0:
            return 0
        elif ph_deficit < 0.5:
            return 500
        elif ph_deficit < 1.0:
            return 1000
        elif ph_deficit < 1.5:
            return 1500
        else:
            return 2000
    
    def _prepare_features(self, input_data: SoilClimateInput) -> list:
        """
        Prepare feature array for ML model input.
        
        # ML model integration point
        """
        return [
            input_data.N,
            input_data.P,
            input_data.K,
            input_data.pH,
            input_data.temperature,
            input_data.humidity,
            input_data.rainfall
        ]
    
    def get_detailed_analysis(self, input_data: SoilClimateInput) -> dict:
        """
        Get detailed soil analysis with individual component scores.
        
        # ML model will enhance this analysis
        """
        return {
            "ph_status": self._analyze_ph(input_data.pH),
            "nitrogen_status": self._analyze_nutrient(input_data.N, 40, 80, "N"),
            "phosphorus_status": self._analyze_nutrient(input_data.P, 30, 60, "P"),
            "potassium_status": self._analyze_nutrient(input_data.K, 35, 70, "K"),
            "overall_fertility": self._calculate_fertility_score(input_data)
        }
    
    def _analyze_ph(self, ph: float) -> dict:
        """Analyze pH level"""
        if ph < 5.5:
            return {"level": "Very Acidic", "status": "critical", "score": 20}
        elif ph < 6.0:
            return {"level": "Acidic", "status": "warning", "score": 50}
        elif ph <= 7.5:
            return {"level": "Optimal", "status": "good", "score": 100}
        elif ph <= 8.0:
            return {"level": "Slightly Alkaline", "status": "warning", "score": 70}
        else:
            return {"level": "Alkaline", "status": "critical", "score": 30}
    
    def _analyze_nutrient(
        self, 
        value: float, 
        low: float, 
        high: float, 
        name: str
    ) -> dict:
        """Analyze nutrient level"""
        if value < low * 0.5:
            return {"level": "Very Low", "status": "critical", "score": 20}
        elif value < low:
            return {"level": "Low", "status": "warning", "score": 50}
        elif value <= high:
            return {"level": "Optimal", "status": "good", "score": 100}
        else:
            return {"level": "High", "status": "info", "score": 80}
    
    def _calculate_fertility_score(self, input_data: SoilClimateInput) -> int:
        """Calculate overall fertility score (0-100)"""
        ph_score = self._analyze_ph(input_data.pH)["score"]
        n_score = self._analyze_nutrient(input_data.N, 40, 80, "N")["score"]
        p_score = self._analyze_nutrient(input_data.P, 30, 60, "P")["score"]
        k_score = self._analyze_nutrient(input_data.K, 35, 70, "K")["score"]
        
        return int((ph_score + n_score + p_score + k_score) / 4)
