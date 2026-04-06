const { getCropIdeal, CROP_IDEAL_REQUIREMENTS } = require("./cropData");

const predictCrop = (inputData) => {
    const { N, P, K, pH, temperature, humidity, rainfall } = inputData;

    // Simplified heuristic logic ported from Python
    if (rainfall > 200 && humidity > 70 && temperature > 20) {
        return "Rice";
    } else if (rainfall < 100 && temperature > 25) {
        return "Cotton";
    } else if (N > 80 && P > 40 && K > 40) {
        return "Maize";
    } else if (pH > 7.0 && temperature < 25) {
        return "Wheat";
    } else if (rainfall > 150 && N > 50) {
        return "Sugarcane";
    } else if (pH < 6.0 && humidity > 60) {
        return "Jute";
    } else if (temperature > 30 && rainfall < 150) {
        return "Millet";
    } else if (P > 50 && K > 50) {
        return "Chickpea";
    } else {
        return "Wheat"; // Default fallback
    }
};

const getFertilizerRecommendation = (inputData, cropName) => {
    const ideal = getCropIdeal(cropName);
    const recommendations = [];

    if (inputData.N < ideal.N[0]) {
        recommendations.push(`Apply Nitrogen-rich fertilizer (e.g., Urea) to reach the target of ${ideal.N[0]} kg/ha.`);
    }
    if (inputData.P < ideal.P[0]) {
        recommendations.push(`Apply Phosphorus fertilizer (e.g., DAP) to reach the target of ${ideal.P[0]} kg/ha.`);
    }
    if (inputData.K < ideal.K[0]) {
        recommendations.push(`Apply Potassium fertilizer (e.g., MOP) to reach the target of ${ideal.K[0]} kg/ha.`);
    }

    if (recommendations.length === 0) {
        return ["Soil nutrients are optimal for the recommended crop."];
    }
    return recommendations;
};

const getSoilCorrection = (inputData) => {
    const { pH } = inputData;
    if (pH < 6.0) {
        return "Soil is acidic. Apply lime (calcium carbonate) to increase pH.";
    } else if (pH > 7.5) {
        return "Soil is alkaline. Apply gypsum or sulfur to decrease pH.";
    } else {
        return "Soil pH is in the optimal range.";
    }
};

module.exports = { predictCrop, getFertilizerRecommendation, getSoilCorrection };
