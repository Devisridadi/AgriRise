"""
Application configuration settings.
Uses pydantic-settings for environment variable management.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict  # type: ignore
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application metadata
    APP_TITLE: str = "Integrated Crop & Fertilizer Recommendation System"
    APP_DESCRIPTION: str = """
    A Machine Learning-based system for:
    - Crop recommendation based on soil and climate parameters
    - Fertilizer recommendation for optimal crop growth
    - Soil correction advice for nutrient deficiencies
    """
    APP_VERSION: str = "1.0.0"
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "*"  # Allow all origins in development; restrict in production
    ]
    
    # ML Model paths (for future integration)
    CROP_MODEL_PATH: str = "ml/models/crop_model.pkl"
    FERTILIZER_MODEL_PATH: str = "ml/models/fertilizer_model.pkl"
    
    
    # Environment
    DEBUG: bool = True
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
