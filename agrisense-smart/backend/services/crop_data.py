"""
Ideal soil and climate requirements for various crops.
Used for comparison analysis.
"""

# Format: (Min_N, Max_N, Min_P, Max_P, Min_K, Max_K, Min_pH, Max_pH, Min_Temp, Max_Temp, Min_Humidity, Max_Humidity, Min_Rainfall, Max_Rainfall)
CROP_REQUIREMENTS = {
    "Rice": {
        "N": (80, 100), "P": (35, 50), "K": (35, 45),
        "pH": (6.0, 7.0), "temperature": (20, 35), "humidity": (75, 85), "rainfall": (150, 250)
    },
    "Maize": {
        "N": (80, 100), "P": (40, 55), "K": (40, 50),
        "pH": (5.8, 7.0), "temperature": (21, 32), "humidity": (60, 75), "rainfall": (60, 110)
    },
    "Chickpea": {
        "N": (30, 50), "P": (50, 70), "K": (50, 70),
        "pH": (6.0, 7.5), "temperature": (15, 30), "humidity": (45, 60), "rainfall": (50, 95)
    },
    "Kidneybeans": {
        "N": (20, 40), "P": (55, 70), "K": (15, 25),
        "pH": (5.5, 6.0), "temperature": (15, 25), "humidity": (60, 70), "rainfall": (60, 100)
    },
    "Pigeonpeas": {
        "N": (10, 30), "P": (60, 80), "K": (15, 25),
        "pH": (5.0, 6.5), "temperature": (18, 35), "humidity": (45, 70), "rainfall": (90, 150)
    },
    "Mothbeans": {
        "N": (10, 30), "P": (40, 60), "K": (15, 25),
        "pH": (5.5, 7.5), "temperature": (24, 30), "humidity": (40, 60), "rainfall": (30, 70)
    },
    "Mungbean": {
        "N": (10, 30), "P": (40, 60), "K": (15, 25),
        "pH": (6.0, 7.5), "temperature": (27, 30), "humidity": (80, 90), "rainfall": (35, 60)
    },
    "Blackgram": {
        "N": (30, 50), "P": (60, 80), "K": (15, 25),
        "pH": (6.5, 7.5), "temperature": (25, 35), "humidity": (60, 70), "rainfall": (60, 75)
    },
    "Lentil": {
        "N": (10, 30), "P": (55, 70), "K": (15, 25),
        "pH": (5.5, 7.0), "temperature": (18, 30), "humidity": (60, 70), "rainfall": (40, 55)
    },
    "Pomegranate": {
        "N": (10, 40), "P": (10, 30), "K": (35, 45),
        "pH": (5.5, 7.5), "temperature": (18, 45), "humidity": (85, 95), "rainfall": (100, 115)
    },
    "Banana": {
        "N": (90, 110), "P": (75, 95), "K": (45, 55),
        "pH": (5.5, 6.5), "temperature": (25, 30), "humidity": (75, 85), "rainfall": (90, 115)
    },
    "Mango": {
        "N": (10, 40), "P": (15, 35), "K": (25, 35),
        "pH": (4.5, 7.0), "temperature": (27, 35), "humidity": (45, 55), "rainfall": (90, 100)
    },
    "Grapes": {
        "N": (10, 40), "P": (120, 145), "K": (190, 205),
        "pH": (5.5, 6.5), "temperature": (10, 40), "humidity": (80, 85), "rainfall": (65, 75)
    },
    "Watermelon": {
        "N": (80, 105), "P": (5, 25), "K": (45, 55),
        "pH": (6.0, 7.0), "temperature": (24, 27), "humidity": (80, 90), "rainfall": (40, 60)
    },
    "Muskmelon": {
        "N": (80, 105), "P": (5, 25), "K": (45, 55),
        "pH": (6.0, 7.0), "temperature": (27, 30), "humidity": (90, 95), "rainfall": (20, 30)
    },
    "Apple": {
        "N": (0, 40), "P": (120, 145), "K": (190, 205),
        "pH": (5.5, 6.5), "temperature": (21, 24), "humidity": (90, 95), "rainfall": (100, 125)
    },
    "Orange": {
        "N": (10, 40), "P": (5, 25), "K": (5, 15),
        "pH": (6.0, 8.0), "temperature": (10, 35), "humidity": (90, 95), "rainfall": (100, 120)
    },
    "Papaya": {
        "N": (40, 60), "P": (45, 65), "K": (45, 55),
        "pH": (6.5, 7.0), "temperature": (23, 44), "humidity": (90, 95), "rainfall": (240, 255)
    },
    "Coconut": {
        "N": (10, 40), "P": (10, 30), "K": (25, 35),
        "pH": (5.5, 6.5), "temperature": (25, 30), "humidity": (90, 99), "rainfall": (130, 225)
    },
    "Cotton": {
        "N": (10, 40), "P": (35, 60), "K": (15, 25),
        "pH": (6.0, 8.0), "temperature": (22, 26), "humidity": (75, 85), "rainfall": (60, 100)
    },
    "Jute": {
        "N": (60, 100), "P": (35, 55), "K": (35, 45),
        "pH": (6.0, 8.0), "temperature": (23, 27), "humidity": (70, 90), "rainfall": (150, 200)
    },
    "Coffee": {
        "N": (80, 110), "P": (15, 35), "K": (25, 35),
        "pH": (6.0, 7.5), "temperature": (23, 28), "humidity": (50, 60), "rainfall": (115, 190)
    }
}

ORGANIC_REMEDIES = {
    "N_deficiency": ["Add well-rotted compost or manure", "Plant nitrogen-fixing cover crops like clover", "Apply blood meal or fish emulsion"],
    "P_deficiency": ["Add bone meal or rock phosphate", "Apply composted bird manure", "Ensure proper soil pH for P availability"],
    "K_deficiency": ["Add wood ash (sparingly)", "Apply kelp meal or seaweed extract", "Add greensand to the soil"],
    "pH_low": ["Apply agricultural lime to raise pH", "Add crushed eggshells for minor adjustment"],
    "pH_high": ["Apply elemental sulfur to lower pH", "Add peat moss or pine needles as mulch"],
}

def get_crop_ideal(crop_name: str) -> dict:
    """Get ideal requirements for a specific crop, fallback to Rice if not found"""
    return CROP_REQUIREMENTS.get(crop_name.capitalize(), CROP_REQUIREMENTS["Rice"])
