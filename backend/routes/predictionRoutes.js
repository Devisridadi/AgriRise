const express = require("express");
const router = express.Router();
const predictionController = require("../controllers/predictionController");
const locationController = require("../controllers/locationController");

// @route   POST /api/predict
router.post("/predict", predictionController.getPrediction);

// @route   POST /api/location-intel
router.post("/location-intel", locationController.getIntel);

module.exports = router;
