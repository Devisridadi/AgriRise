"""
Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class SoilClimateInput(BaseModel):
    """
    Input schema for soil and climate parameters.
    All values should be within realistic agricultural ranges.
    """
    N: float = Field(
        ..., 
        ge=0, 
        le=140, 
        description="Nitrogen content in soil (kg/ha)",
        examples=[90]
    )
    P: float = Field(
        ..., 
        ge=0, 
        le=145, 
        description="Phosphorus content in soil (kg/ha)",
        examples=[42]
    )
    K: float = Field(
        ..., 
        ge=0, 
        le=205, 
        description="Potassium content in soil (kg/ha)",
        examples=[43]
    )
    pH: float = Field(
        ..., 
        ge=3.5, 
        le=9.5, 
        description="Soil pH value",
        examples=[6.5],
        alias="ph"  # Accept both 'pH' and 'ph'
    )
    temperature: float = Field(
        ..., 
        ge=8, 
        le=45, 
        description="Average temperature in Celsius",
        examples=[25]
    )
    humidity: float = Field(
        ..., 
        ge=14, 
        le=99, 
        description="Relative humidity percentage",
        examples=[80]
    )
    rainfall: float = Field(
        ..., 
        ge=20, 
        le=300, 
        description="Average rainfall in mm",
        examples=[200]
    )
    target_crop: Optional[str] = Field(
        None,
        description="Optional specific crop to evaluate against soil values"
    )
    
    class Config:
        populate_by_name = True  # Allow using alias names
        json_schema_extra = {
            "example": {
                "N": 90,
                "P": 42,
                "K": 43,
                "pH": 6.5,
                "temperature": 25,
                "humidity": 80,
                "rainfall": 200
            }
        }


class PredictionResponse(BaseModel):
    """
    Response schema containing crop recommendation, 
    fertilizer suggestions, and soil correction advice.
    """
    crop: str = Field(
        ..., 
        description="Recommended crop based on soil and climate conditions",
        examples=["Rice"]
    )
    fertilizers: str = Field(
        ..., 
        description="Recommended fertilizers formulation",
        examples=["Urea, DAP, NPK 20-20-0"]
    )
    soil_correction: str = Field(
        ..., 
        description="Soil correction recommendation",
        examples=["Apply lime to increase soil pH"]
    )
    
    # Cloud Analytics Output fields
    comparison: Optional[dict] = Field(
        None,
        description="Detailed comparison between current soil values and ideal requirements"
    )
    suggestions: Optional[dict] = Field(
        None,
        description="Specific suggestions for soil improvement (pH, nutrients, moisture, organic matter, and health advice)"
    )
    
    # ML Model Output
    confidence: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="Confidence score of the primary crop prediction (%)"
    )
    top_crops: Optional[List[dict]] = Field(
        None,
        description="Top-3 ML predictions with confidence: [{name, confidence}]"
    )

    # Optional fields
    additional_info: Optional[str] = Field(
        None,
        description="Additional recommendations or error notes"
    )
    suitability: Optional[dict] = Field(
        None,
        description="Suitability analysis results"
    )
    alternatives: Optional[List[dict]] = Field(
        None,
        description="Alternative suitable crops with their ideal requirements"
    )
    crop_health_data: Optional[str] = Field(
        None,
        description="Tips and data to increase crop health and yield"
    )
    priority_crops: Optional[List[dict]] = Field(
        None,
        description="A list of 3 other alternative crops based on soil conditions"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "crop": "Rice",
                "fertilizer": ["Urea", "DAP"],
                "soil_correction": "Apply lime to increase soil pH",
                "confidence": 85.5,
                "additional_info": "Consider water management for paddy cultivation"
            }
        }
