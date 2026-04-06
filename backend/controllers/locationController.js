const locationIntelligence = require("../services/locationIntelligence");

exports.getIntel = async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return res.status(400).json({ error: "Latitude and longitude are required" });
        }

        const data = await locationIntelligence.getLocationIntelligence(lat, lon);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
