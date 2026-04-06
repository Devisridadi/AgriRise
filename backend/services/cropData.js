/**
 * Ideal soil and climate requirements for various crops.
 */
const CROP_IDEAL_REQUIREMENTS = {
    "Rice": {
        "N": [80, 100], "P": [35, 50], "K": [35, 45],
        "pH": [6.0, 7.0], "temperature": [20, 35], "humidity": [75, 85], "rainfall": [150, 250]
    },
    "Wheat": {
        "N": [90, 110], "P": [40, 50], "K": [30, 40],
        "pH": [6.5, 7.5], "temperature": [10, 25], "humidity": [50, 65], "rainfall": [50, 100]
    },
    "Maize": {
        "N": [80, 100], "P": [40, 55], "K": [40, 50],
        "pH": [5.8, 7.0], "temperature": [21, 32], "humidity": [60, 75], "rainfall": [60, 110]
    },
    "Cotton": {
        "N": [60, 80], "P": [40, 50], "K": [30, 45],
        "pH": [6.5, 8.0], "temperature": [25, 35], "humidity": [45, 60], "rainfall": [40, 90]
    },
    "Sugarcane": {
        "N": [100, 130], "P": [50, 70], "K": [60, 80],
        "pH": [6.0, 7.5], "temperature": [20, 35], "humidity": [70, 85], "rainfall": [110, 200]
    },
    "Chickpea": {
        "N": [30, 50], "P": [50, 70], "K": [50, 70],
        "pH": [6.0, 7.5], "temperature": [15, 30], "humidity": [45, 60], "rainfall": [50, 95]
    }
};

const getCropIdeal = (cropName) => {
    return CROP_IDEAL_REQUIREMENTS[cropName] || CROP_IDEAL_REQUIREMENTS["Rice"];
};

module.exports = { getCropIdeal, CROP_IDEAL_REQUIREMENTS };
