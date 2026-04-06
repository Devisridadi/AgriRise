"""
Prediction API endpoints.
Handles crop recommendation, fertilizer, and soil correction requests.
Integrates ML model predictions with Cloud Analytics Engine.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import SoilClimateInput, PredictionResponse
from services.crop_service import CropService
from services.fertilizer_service import FertilizerService
from services.soil_correction_service import SoilCorrectionService
from services.evaluation_service import EvaluationService
from services.analytics_engine import CloudAnalyticsService
from utils.validators import validate_input_ranges

router = APIRouter()

# Initialize services (models are loaded once at startup)
crop_service = CropService()
fertilizer_service = FertilizerService()
soil_correction_service = SoilCorrectionService()
evaluation_service = EvaluationService()
analytics_service = CloudAnalyticsService()


@router.post("/predict", response_model=PredictionResponse)
async def predict(input_data: SoilClimateInput) -> PredictionResponse:
    """
    Primary prediction endpoint.

    Accepts soil parameters (N, P, K, pH) and climate data
    (temperature, humidity, rainfall) to provide:
    - Top-3 ML crop recommendations with confidence scores
    - Fertilizer recommendations (ML-based)
    - Soil correction advice
    - Cloud Analytics detailed evaluation

    Args:
        input_data: SoilClimateInput with soil and climate parameters

    Returns:
        PredictionResponse with complete agronomic recommendations
    """
    try:
        # Validate input ranges
        validation_result = validate_input_ranges(input_data)
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid input: {validation_result['message']}"
            )

        # ── Step 1: ML Crop Prediction ────────────────────────────────
        top_crops = crop_service.get_top_crops(input_data, top_n=3)
        recommended_crop = top_crops[0]["name"] if top_crops else crop_service.predict_crop(input_data)
        confidence = top_crops[0]["confidence"] if top_crops else None

        # ── Step 2: Target Crop Evaluation ───────────────────────────
        suitability_data = None
        alternatives = None

        target = input_data.target_crop
        if target:
            suitability_data = evaluation_service.evaluate_suitability(input_data, target)
            if not suitability_data["is_suitable"]:
                alternatives = evaluation_service.get_top_alternatives(input_data)

        # Determine final crop to use for downstream recommendations
        final_crop = target if target else recommended_crop

        # ── Step 3: Fertilizer Recommendation (ML-based) ─────────────
        fertilizer_recommendations = fertilizer_service.recommend_fertilizer(
            input_data, final_crop
        )

        # ── Step 4: Soil Correction ───────────────────────────────────
        soil_correction = soil_correction_service.get_correction(input_data)

        # ── Step 5: Cloud Analytics Enrichment ──────────────────────────────────
        analytics_data = await analytics_service.get_analysis(input_data, final_crop)

        return PredictionResponse(
            crop=final_crop,
            fertilizers=", ".join(fertilizer_recommendations) if fertilizer_recommendations else "",
            soil_correction=soil_correction,
            confidence=confidence,
            top_crops=top_crops if top_crops else None,
            suitability=suitability_data,
            alternatives=alternatives,
            comparison=analytics_data.get("comparison"),
            suggestions=analytics_data.get("suggestions"),
            crop_health_data=analytics_data.get("crop_health_data"),
            priority_crops=analytics_data.get("priority_crops"),
            additional_info=analytics_data.get("error") if "error" in analytics_data else None,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/predict/crop")
async def predict_crop_only(input_data: SoilClimateInput) -> dict:
    """Get top-3 crop recommendations with confidence scores."""
    top_crops = crop_service.get_top_crops(input_data, top_n=3)
    if top_crops:
        return {
            "crop": top_crops[0]["name"],
            "confidence": top_crops[0]["confidence"],
            "top_crops": top_crops,
        }
    # Fallback
    crop = crop_service.predict_crop(input_data)
    return {"crop": crop, "confidence": None, "top_crops": []}


@router.post("/predict/fertilizer")
async def predict_fertilizer_only(input_data: SoilClimateInput) -> dict:
    """Get fertilizer recommendation for the predicted crop."""
    crop = crop_service.predict_crop(input_data)
    fertilizers = fertilizer_service.recommend_fertilizer(input_data, crop)
    return {"crop": crop, "fertilizer": fertilizers}


@router.post("/predict/soil-correction")
async def predict_soil_correction_only(input_data: SoilClimateInput) -> dict:
    """Get soil correction advice."""
    correction = soil_correction_service.get_correction(input_data)
    detailed = soil_correction_service.get_detailed_analysis(input_data)
    return {"soil_correction": correction, "detailed_analysis": detailed}


@router.get("/models/status")
async def get_model_status() -> dict:
    """Check which ML models are loaded and their file status."""
    from ml.model_loader import ModelLoader
    loader = ModelLoader()
    return {
        "models": loader.get_model_info(),
        "summary": loader.load_all_models(),
    }
