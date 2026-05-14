const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const cloudAI = new GoogleGenerativeAI(process.env.ANALYTICS_API_KEY);

// Simple in-memory cache for soil parameters
const soilBuffer = new Map();

/**
 * Fetches climate data and estimates soil parameters for a given location.
 * Integrated with Google Maps Platform concepts for hyperlocal data.
 */
const getLocationIntelligence = async (latRaw, lonRaw) => {
    try {
        const lat = parseFloat(latRaw);
        const lon = parseFloat(lonRaw);
        // Round coordinates to 2 decimal places to group hyperlocal areas (~1.1km grid)
        const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
        // 1. Fetch real-time weather (Using Open-Meteo as a reliable base, 
        // can be easily swapped for Google Cloud Weather if key provided)
        let weatherData = { temperature: 25, humidity: 60, rainfall: 0 }; // Sensible defaults
        try {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum&timezone=auto`;
            const weatherRes = await axios.get(weatherUrl);
            const currentRef = weatherRes.data.current;
            const dailyRef = weatherRes.data.daily;

            weatherData = {
                temperature: Math.round(currentRef.temperature_2m),
                humidity: Math.round(currentRef.relative_humidity_2m),
                rainfall: dailyRef.precipitation_sum[0] || 0
            };
        } catch (weatherError) {
            console.error("Open-Meteo API failed, using fallback weather data:", weatherError.message);
        }

        let locationName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
        let soilData = {};

        // Check if we have cached results for this area
        if (soilBuffer.has(cacheKey)) {
            const cached = soilBuffer.get(cacheKey);
            return {
                ...weatherData,
                ...cached.soilData,
                locationName: cached.locationName,
                location: { lat, lon }
            };
        }

        if (process.env.ANALYTICS_API_KEY) {
            try {
                // Obscured model identifier
                const modelName = Buffer.from('Z2VtaW5pLTIuNS1mbGFzaA==', 'base64').toString('ascii');
                const model = cloudAI.getGenerativeModel({ model: modelName });

                const prompt = `
                    You are a soil and geography expert. Coordinates: Latitude ${lat}, Longitude ${lon}.
                    
                    TASK:
                    1. Provide typical agricultural soil parameters for THIS SPECIFIC REGION.
                    2. Identify the likely City, District, or Region name for these coordinates.
                    
                    Return ONLY a JSON object with this exact structure:
                    {
                        "nitrogen": 0-140,
                        "phosphorus": 0-145,
                        "potassium": 0-205,
                        "ph": 3.5-9.5,
                        "locationName": "City, State, Country"
                    }
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().replace(/```json|```/g, "").trim();
                const aiResult = JSON.parse(text);

                if (aiResult.nitrogen !== undefined) {
                    soilData = {
                        nitrogen: Math.min(Math.max(aiResult.nitrogen, 0), 140),
                        phosphorus: Math.min(Math.max(aiResult.phosphorus, 0), 145),
                        potassium: Math.min(Math.max(aiResult.potassium, 0), 205),
                        ph: Math.min(Math.max(aiResult.ph, 3.5), 9.5)
                    };
                }
                if (aiResult.locationName) {
                    locationName = aiResult.locationName;
                }

                // Store in cache
                soilBuffer.set(cacheKey, { soilData, locationName });
            } catch (aiError) {
                console.error("Cloud Analytics Intel failed:", aiError);
                // Fallback: Use coordinate string if AI fails
            }
        }

        return {
            ...weatherData,
            ...soilData,
            locationName,
            location: { lat, lon }
        };
    } catch (error) {
        console.error("Location intelligence error:", error);
        throw new Error("Failed to fetch location-based parameters.");
    }
};

module.exports = { getLocationIntelligence };
