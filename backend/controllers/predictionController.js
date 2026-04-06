const axios = require('axios');

// Simple in-memory cache for prediction results
const resultBuffer = new Map();

// URL of the Python ML FastAPI backend
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

exports.getPrediction = async (req, res) => {
    try {
        const inputData = req.body;
        const targetCrop = inputData.target_crop || inputData.targetCrop;
        
        // Generate cache key from all relevant input parameters
        const cacheKey = JSON.stringify({
            N: inputData.N,
            P: inputData.P,
            K: inputData.K,
            pH: inputData.pH,
            temperature: inputData.temperature,
            humidity: inputData.humidity,
            rainfall: inputData.rainfall,
            targetCrop: targetCrop || null
        });

        // Check cache
        if (resultBuffer.has(cacheKey)) {
            console.log("Serving prediction from cache");
            return res.status(200).json(resultBuffer.get(cacheKey));
        }

        // Forward the exact request to the Python FastAPI backend
        // which now handles the ML models and Cloud Analytics enrichment directly.
        const response = await axios.post(`${PYTHON_API_URL}/api/predict`, {
            ...inputData,
            target_crop: targetCrop
        });

        const pythonData = response.data;

        // The Python API returns exactly the format the React frontend expects
        // (crop, fertilizer, soil_correction, comparison, suggestions, crop_health_data, priority_crops)
        
        // Cache the result
        resultBuffer.set(cacheKey, pythonData);

        res.status(200).json(pythonData);
    } catch (error) {
        console.error("Prediction proxy error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to generate prediction from ML Engine" });
    }
};
