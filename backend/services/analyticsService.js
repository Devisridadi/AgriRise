const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getCropIdeal } = require("./cropData");

const getAnalysis = async (inputData, cropName) => {
    if (!process.env.ANALYTICS_API_KEY) {
        return {
            comparison: null,
            suggestions: null,
            error: "ANALYTICS_API_KEY not configured"
        };
    }

    try {
        const cloudAI = new GoogleGenerativeAI(process.env.ANALYTICS_API_KEY);
        const modelName = Buffer.from("Z2VtaW5pLTEuNS1mbGFzaA==", 'base64').toString('ascii');
        const model = cloudAI.getGenerativeModel({ model: modelName });
        const ideal = getCropIdeal(cropName);

        const prompt = `
        Analyze the following soil and climate data for a farmer and provide a structured JSON response.
        The farmer wants to grow: ${cropName}.
        
        Current Soil Values:
        - Nitrogen (N): ${inputData.N} kg/ha
        - Phosphorus (P): ${inputData.P} kg/ha
        - Potassium (K): ${inputData.K} kg/ha
        - Soil pH: ${inputData.pH}
        - Temperature: ${inputData.temperature}°C
        - Humidity: ${inputData.humidity}%
        - Rainfall: ${inputData.rainfall} mm
        
        Ideal Requirements for ${cropName}:
        - N: ${ideal.N[0]}-${ideal.N[1]} kg/ha
        - P: ${ideal.P[0]}-${ideal.P[1]} kg/ha
        - K: ${ideal.K[0]}-${ideal.K[1]} kg/ha
        - pH: ${ideal.pH[0]}-${ideal.pH[1]}
        - Temperature: ${ideal.temperature[0]}-${ideal.temperature[1]}°C
        - Humidity: ${ideal.humidity[0]}-${ideal.humidity[1]}%
        - Rainfall: ${ideal.rainfall[0]}-${ideal.rainfall[1]} mm

        Please provide the following in the JSON response:
        1. "comparison": Comparison between current values and ideal requirements for each parameter.
        2. "suggestions": 
           - "ph_adjustment": Detailed advice on how to adjust the pH.
           - "nutrient_addition": Advice on N, P, K addition based on current values.
           - "moisture_improvement": Advice on managing moisture/rainfall/humidity.
           - "organic_matter_correction": Advice on adding organic matter/compost to improve soil quality.
           - "organic_advice": Practical, brief organic farming tips and natural pest control for this crop.
        3. "fertilizers": Specific fertilizer application plan (e.g., "Apply Nitrogen-rich fertilizer (e.g., Urea) to reach the target of 80 kg/ha").
        4. "soil_correction": Detailed status of soil health and any corrective actions needed.
        5. "crop_health_data": Tips and data to increase crop health and yield.
        6. "priority_crops": A list of 3 other crops that best suit the current parameters. For each crop, include:
           - "name": Name of the crop.
           - "suitability_score": A score from 1-100.
           - "data": A brief summary of why it suits the current soil/climate.

        Return ONLY a JSON object with this structure (no markdown code blocks):
        {
            "comparison": {
                "N": "...", "P": "...", "K": "...", "pH": "...", 
                "temperature": "...", "humidity": "...", "rainfall": "..."
            },
            "suggestions": {
                "ph_adjustment": "...",
                "nutrient_addition": "...",
                "moisture_improvement": "...",
                "organic_matter_correction": "...",
                "organic_advice": "..."
            },
            "fertilizers": "...",
            "soil_correction": "...",
            "crop_health_data": "...",
            "priority_crops": [
                { "name": "...", "suitability_score": 0, "data": "..." },
                ...
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Cloud Analytics API error:", error);
        return {
            comparison: null,
            suggestions: null,
            error: \`Failed to get AI analysis: \${error.message}\`
        };
    }
};

module.exports = { getAnalysis };
