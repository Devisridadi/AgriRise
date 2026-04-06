"""
Main entry point for the FastAPI backend.
Integrated Soil–Climate Based Crop and Fertilizer Recommendation System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.predict import router as predict_router
from config import settings

app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",      # Swagger UI
    redoc_url="/redoc",    # ReDoc documentation
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict_router, prefix="/api", tags=["Prediction"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Integrated Crop & Fertilizer Recommendation System API",
        "version": settings.APP_VERSION
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check with ML model status"""
    from ml.model_loader import ModelLoader
    loader = ModelLoader()
    model_status = loader.load_all_models()
    return {
        "status": "healthy",
        "api_version": settings.APP_VERSION,
        "ml_models_loaded": any(model_status.values()),
        "models": model_status,
        "services": {
            "crop_service": "ml" if model_status["crop_model"] else "rule-based",
            "fertilizer_service": "ml" if model_status["fertilizer_model"] else "rule-based",
            "soil_correction_service": "rule-based",
            "analytics_service": "active",
        },
        "docs": "/docs",
        "model_details": "/api/models/status",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
