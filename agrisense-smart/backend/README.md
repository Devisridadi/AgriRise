# Integrated Crop & Fertilizer Recommendation System - Backend

A production-ready FastAPI backend for the ML-based agriculture decision support system.

## 🌾 Features

- **Crop Recommendation**: Predicts optimal crops based on soil and climate parameters
- **Fertilizer Advisory**: Recommends fertilizers based on nutrient deficiencies
- **Soil Correction**: Provides soil amendment recommendations
- **RESTful API**: Clean, documented API with Swagger UI
- **Modular Architecture**: Separate services for easy ML model integration

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py               # Application configuration
├── requirements.txt        # Python dependencies
├── models/
│   ├── __init__.py
│   └── schemas.py          # Pydantic request/response models
├── routes/
│   ├── __init__.py
│   └── predict.py          # Prediction API endpoints
├── services/
│   ├── crop_service.py     # Crop recommendation logic
│   ├── fertilizer_service.py # Fertilizer recommendation logic
│   └── soil_correction_service.py # Soil correction logic
├── ml/
│   ├── __init__.py
│   ├── model_loader.py     # ML model loading utility
│   └── README.md           # ML integration guide
├── utils/
│   ├── __init__.py
│   └── validators.py       # Input validation utilities
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python main.py
```

### 4. Access the API

- **API Base URL**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📡 API Endpoints

### Main Prediction Endpoint

```http
POST /api/predict
Content-Type: application/json

{
  "N": 90,
  "P": 42,
  "K": 43,
  "pH": 6.5,
  "temperature": 25,
  "humidity": 80,
  "rainfall": 200
}
```

**Response:**
```json
{
  "crop": "Rice",
  "fertilizer": ["Urea", "DAP"],
  "soil_correction": "Soil parameters are within optimal ranges..."
}
```

### Individual Endpoints

- `POST /api/predict/crop` - Crop recommendation only
- `POST /api/predict/fertilizer` - Fertilizer recommendation only  
- `POST /api/predict/soil-correction` - Soil correction only

### Health Check

```http
GET /health
```

## 🔬 Integrating ML Models

### Step 1: Train Your Models

Use the provided dataset to train Random Forest / XGBoost models:

```python
# Example training script
from sklearn.ensemble import RandomForestClassifier
import joblib

# Train your model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, 'backend/ml/models/crop_model.pkl')
```

### Step 2: Place Models in `ml/models/`

```
ml/models/
├── crop_model.pkl
├── fertilizer_model.pkl
└── soil_model.pkl
```

### Step 3: Uncomment Model Loading Code

In `ml/model_loader.py`, uncomment the joblib loading code:

```python
import joblib
model = joblib.load(model_path)
self._models_cache["crop_model"] = model
return model
```

### Step 4: Update Service Prediction Logic

In each service file (e.g., `crop_service.py`), replace placeholder logic with:

```python
def predict_crop(self, input_data):
    features = self._prepare_features(input_data)
    prediction = self.model.predict([features])[0]
    return self._decode_prediction(prediction)
```

## 🛠️ Configuration

Create a `.env` file for custom settings:

```env
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
CROP_MODEL_PATH=ml/models/crop_model.pkl
```

## 📊 Input Parameters

| Parameter | Range | Unit | Description |
|-----------|-------|------|-------------|
| N | 0-140 | kg/ha | Nitrogen content |
| P | 0-145 | kg/ha | Phosphorus content |
| K | 0-205 | kg/ha | Potassium content |
| pH | 3.5-9.5 | - | Soil acidity/alkalinity |
| temperature | 8-45 | °C | Average temperature |
| humidity | 14-99 | % | Relative humidity |
| rainfall | 20-300 | mm | Annual rainfall |

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest tests/
```

### Sample Test

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_predict():
    response = client.post("/api/predict", json={
        "N": 90, "P": 42, "K": 43,
        "pH": 6.5, "temperature": 25,
        "humidity": 80, "rainfall": 200
    })
    assert response.status_code == 200
    data = response.json()
    assert "crop" in data
    assert "fertilizer" in data
    assert "soil_correction" in data
```

## 🚀 Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Checklist

- [ ] Set `DEBUG=false` in production
- [ ] Configure specific `ALLOWED_ORIGINS`
- [ ] Add authentication/API keys if needed
- [ ] Set up HTTPS
- [ ] Configure logging
- [ ] Add rate limiting

## 📚 Technologies

- **FastAPI** - Modern, fast web framework
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI server
- **Scikit-learn / XGBoost** - ML models (to be integrated)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of a final-year academic project.

---

**Note**: This backend currently uses placeholder logic. Replace with actual ML models for production use.
