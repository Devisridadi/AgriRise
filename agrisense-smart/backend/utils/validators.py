"""
Input validation utilities.
Additional validation beyond Pydantic schema validation.
"""

from models.schemas import SoilClimateInput


def validate_input_ranges(input_data: SoilClimateInput) -> dict:
    """
    Validate that input values are within realistic agricultural ranges.
    
    This provides additional validation beyond Pydantic's schema validation,
    checking for scientifically reasonable value combinations.
    
    Args:
        input_data: SoilClimateInput object to validate
        
    Returns:
        dict: {"valid": bool, "message": str}
    """
    warnings = []
    
    # Check for unusual nutrient combinations
    if input_data.N > 100 and input_data.P < 20:
        warnings.append(
            "Unusual N:P ratio detected. Very high nitrogen with low phosphorus "
            "may indicate measurement error."
        )
    
    if input_data.K > 150 and input_data.N < 30:
        warnings.append(
            "Unusual K:N ratio detected. Very high potassium with low nitrogen "
            "is uncommon in agricultural soils."
        )
    
    # Check for climate-soil consistency
    if input_data.rainfall < 50 and input_data.humidity > 80:
        warnings.append(
            "Low rainfall with high humidity is unusual. "
            "Please verify climate data accuracy."
        )
    
    if input_data.temperature > 40 and input_data.humidity > 90:
        warnings.append(
            "Extreme temperature with very high humidity is rare. "
            "Please verify measurements."
        )
    
    # pH extremes warning
    if input_data.pH < 4.5 or input_data.pH > 9.0:
        warnings.append(
            f"Extreme pH value ({input_data.pH}) detected. "
            "Most crops cannot grow well at this pH level."
        )
    
    # If any critical validation fails
    critical_errors = []
    
    # Check for zero values in essential nutrients
    if input_data.N == 0 and input_data.P == 0 and input_data.K == 0:
        critical_errors.append(
            "All nutrient values are zero. Please check soil test results."
        )
    
    if critical_errors:
        return {
            "valid": False,
            "message": " ".join(critical_errors)
        }
    
    if warnings:
        return {
            "valid": True,
            "message": " ".join(warnings),
            "has_warnings": True
        }
    
    return {
        "valid": True,
        "message": "All inputs are within expected ranges.",
        "has_warnings": False
    }


def validate_crop_climate_match(crop: str, temperature: float, rainfall: float) -> dict:
    """
    Validate if the predicted crop is suitable for the given climate.
    
    # This will be enhanced with ML-based validation
    
    Args:
        crop: Predicted crop name
        temperature: Average temperature in Celsius
        rainfall: Annual rainfall in mm
        
    Returns:
        dict: {"suitable": bool, "reason": str}
    """
    # Crop climate requirements (simplified)
    crop_requirements = {
        "rice": {"temp_min": 20, "temp_max": 35, "rain_min": 150},
        "wheat": {"temp_min": 10, "temp_max": 25, "rain_min": 50},
        "maize": {"temp_min": 18, "temp_max": 32, "rain_min": 80},
        "cotton": {"temp_min": 21, "temp_max": 37, "rain_min": 50},
        "sugarcane": {"temp_min": 20, "temp_max": 35, "rain_min": 150},
        "jute": {"temp_min": 24, "temp_max": 35, "rain_min": 150},
        "chickpea": {"temp_min": 15, "temp_max": 30, "rain_min": 40},
        "millet": {"temp_min": 20, "temp_max": 40, "rain_min": 25},
    }
    
    crop_lower = crop.lower()
    
    if crop_lower not in crop_requirements:
        return {
            "suitable": True,
            "reason": "Climate validation not available for this crop."
        }
    
    req = crop_requirements[crop_lower]
    
    issues = []
    
    if temperature < req["temp_min"]:
        issues.append(f"Temperature ({temperature}°C) is below minimum ({req['temp_min']}°C)")
    elif temperature > req["temp_max"]:
        issues.append(f"Temperature ({temperature}°C) exceeds maximum ({req['temp_max']}°C)")
    
    if rainfall < req["rain_min"]:
        issues.append(f"Rainfall ({rainfall}mm) is below minimum requirement ({req['rain_min']}mm)")
    
    if issues:
        return {
            "suitable": False,
            "reason": "; ".join(issues)
        }
    
    return {
        "suitable": True,
        "reason": f"Climate conditions are suitable for {crop} cultivation."
    }


def sanitize_input(input_data: SoilClimateInput) -> SoilClimateInput:
    """
    Sanitize and normalize input values.
    
    Args:
        input_data: Raw input data
        
    Returns:
        Sanitized SoilClimateInput
    """
    # Round values to reasonable precision
    return SoilClimateInput(
        N=round(input_data.N, 1),
        P=round(input_data.P, 1),
        K=round(input_data.K, 1),
        pH=round(input_data.pH, 2),
        temperature=round(input_data.temperature, 1),
        humidity=round(input_data.humidity, 1),
        rainfall=round(input_data.rainfall, 1)
    )
