# Machine Learning Models

This directory contains the trained ML models for the crop recommendation system.

## Model Files to Add

Place your trained models in the `models/` subdirectory:

```
ml/
├── models/
│   ├── crop_model.pkl          # Crop recommendation model
│   ├── fertilizer_model.pkl    # Fertilizer recommendation model
│   └── soil_model.pkl          # Soil correction model
├── model_loader.py             # Model loading utility
└── README.md                   # This file
```

## Expected Model Formats

### 1. Crop Recommendation Model (`crop_model.pkl`)

- **Algorithm**: Random Forest / XGBoost Classifier
- **Input Features** (7 features):
  - N (Nitrogen): 0-140 kg/ha
  - P (Phosphorus): 0-145 kg/ha
  - K (Potassium): 0-205 kg/ha
  - pH: 3.5-9.5
  - Temperature: 8-45°C
  - Humidity: 14-99%
  - Rainfall: 20-300 mm

- **Output**: Class label (0-21 for 22 crops)
- **Label Mapping**:
  ```python
  crops = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
           'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate',
           'banana', 'mango', 'grapes', 'watermelon', 'muskmelon',
           'apple', 'orange', 'papaya', 'coconut', 'cotton',
           'jute', 'coffee']
  ```

### 2. Fertilizer Recommendation Model (`fertilizer_model.pkl`)

- **Algorithm**: Random Forest / XGBoost / Rule-based hybrid
- **Input Features**:
  - N, P, K (current soil levels)
  - pH
  - Target crop (encoded)
  
- **Output**: Fertilizer type or deficiency classification

### 3. Soil Correction Model (`soil_model.pkl`)

- **Algorithm**: Classification model or decision tree
- **Input Features**: N, P, K, pH
- **Output**: Correction type classification

## Training Your Models

### Sample Training Code (Crop Model)

```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

# Load dataset
data = pd.read_csv('Crop_recommendation.csv')

# Features and target
X = data[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = data['label']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'crop_model.pkl')

print(f"Model accuracy: {model.score(X_test, y_test):.4f}")
```

## Loading Models in the Application

Once your models are trained and placed in the `models/` directory, uncomment the loading code in `model_loader.py`:

```python
# In load_crop_model():
import joblib
model = joblib.load(model_path)
self._models_cache["crop_model"] = model
return model
```

## Datasets

Recommended datasets for training:
- Crop Recommendation Dataset: [Kaggle](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset)
- Fertilizer Prediction Dataset: [Kaggle](https://www.kaggle.com/datasets/gdabhishek/fertilizer-prediction)

## Notes

- Models are cached after first load to improve performance
- The `ModelLoader` class uses a singleton pattern
- Placeholder logic is used until actual models are integrated
