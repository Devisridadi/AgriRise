import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wheat, Droplets, Thermometer, CloudRain, Leaf, TrendingUp, Info, Loader2, AlertCircle, Beaker, Shovel, MapPin, FlaskConical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchWeatherData, getLocationCoords, getCoordsFromCity } from "@/services/WeatherService";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import wheatImage from "@/assets/wheat-field.jpg";
import riceImage from "@/assets/rice-field.jpg";
import cornImage from "@/assets/corn-field.jpg";
import cottonImage from "@/assets/cotton-field.jpg";
import chickpeaImage from "@/assets/chickpea-field.png";
import orchardImage from "@/assets/orchard-field.png";
import tropicalImage from "@/assets/tropical-field.png";
import coffeeImage from "@/assets/coffee-field.png";

const cropImages: Record<string, string> = {
  // Main grains & fibers
  wheat: wheatImage,
  rice: riceImage,
  maize: cornImage,
  corn: cornImage,
  cotton: cottonImage,
  jute: tropicalImage,
  coffee: coffeeImage,
  
  // Fruits
  watermelon: tropicalImage,
  muskmelon: tropicalImage,
  apple: orchardImage,
  orange: orchardImage,
  grapes: orchardImage,
  banana: tropicalImage,
  mango: orchardImage,
  pomegranate: orchardImage,
  papaya: tropicalImage,
  coconut: tropicalImage,
  
  // Legumes (using chickpea generated image for all pulses)
  chickpea: chickpeaImage,
  kidneybeans: chickpeaImage,
  pigeonpeas: chickpeaImage,
  mothbeans: chickpeaImage,
  mungbean: chickpeaImage,
  blackgram: chickpeaImage,
  lentil: chickpeaImage,
};

// Fallback to our local image if an unknown crop is returned
const fallbackImage = wheatImage;

const SUPPORTED_CROPS = [
  "Rice", "Maize", "Chickpea", "Kidneybeans", "Pigeonpeas", "Mothbeans",
  "Mungbean", "Blackgram", "Lentil", "Pomegranate", "Banana", "Mango",
  "Grapes", "Watermelon", "Muskmelon", "Apple", "Orange", "Papaya",
  "Coconut", "Cotton", "Jute", "Coffee", "Wheat"
];

const defaultValues = {
  nitrogen: 50,
  phosphorus: 50,
  potassium: 50,
  ph: 6.5,
  temperature: 25,
  rainfall: 100,
  humidity: 60,
  targetCrop: "",
};

// API endpoint
const API_ENDPOINT = `${API_BASE_URL}/api/predict`;

interface AlternativeCrop {
  name: string;
  suitability_score: number;
  data: string;
}

interface PredictionResult {
  crop: string;
  fertilizers: string;
  soil_correction: string;
  crop_health_data: string;
  priority_crops?: AlternativeCrop[];
  suitability?: {
    status: string;
    message: string;
    is_suitable: boolean;
    can_harvest: boolean;
    remedies: string[];
  };
  alternatives?: AlternativeCrop[];
  comparison?: Record<string, string>;
  suggestions?: {
    ph_adjustment?: string;
    nutrient_addition?: string;
    moisture_improvement?: string;
    organic_matter_correction?: string;
    organic_advice?: string;
  };
}

export default function CropRecommendation() {
  const [values, setValues] = useState(defaultValues);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hoveredCrop, setHoveredCrop] = useState<AlternativeCrop | null>(null);

  const handleManualSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualLocation.trim()) return;

    setIsLocating(true);
    try {
      const coords = await getCoordsFromCity(manualLocation);
      const weather = await fetchWeatherData(coords.lat, coords.lon);

      const newValues = {
        ...values,
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall > 0 ? Math.min(Math.max(weather.rainfall * 10, 20), 300) : values.rainfall,
        nitrogen: weather.nitrogen || values.nitrogen,
        phosphorus: weather.phosphorus || values.phosphorus,
        potassium: weather.potassium || values.potassium,
        ph: weather.ph || values.ph
      };
      
      setValues(newValues);
      setManualLocation(coords.name); // Keep the official location name instead of clearing it

      toast({
        title: `Location: ${coords.name}`,
        description: `Weather data updated. Running prediction...`,
      });
      
      // Auto trigger prediction
      await handlePredict(newValues);
    } catch (err: any) {
      toast({
        title: "Search failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleAutoDetect = async () => {
    setIsLocating(true);
    try {
      const coords = await getLocationCoords();
      const weather = await fetchWeatherData(coords.lat, coords.lon);

      const newValues = {
        ...values,
        temperature: weather.temperature,
        humidity: weather.humidity,
        rainfall: weather.rainfall > 0 ? Math.min(Math.max(weather.rainfall * 10, 20), 300) : values.rainfall,
        nitrogen: weather.nitrogen || values.nitrogen,
        phosphorus: weather.phosphorus || values.phosphorus,
        potassium: weather.potassium || values.potassium,
        ph: weather.ph || values.ph
      };

      setValues(newValues);

      if (weather.locationName) {
        setManualLocation(weather.locationName);
      }

      toast({
        title: "Location detected",
        description: `Running prediction for ${weather.locationName || 'your current location'}...`,
      });
      
      // Auto trigger prediction
      await handlePredict(newValues);
    } catch (err: any) {
      toast({
        title: "Location detection failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handlePredict = async (overrideValues?: typeof values) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const currentVals = overrideValues || values;
    const payload = {
      N: currentVals.nitrogen,
      P: currentVals.phosphorus,
      K: currentVals.potassium,
      pH: currentVals.ph,
      temperature: currentVals.temperature,
      humidity: currentVals.humidity,
      rainfall: currentVals.rainfall,
      target_crop: currentVals.targetCrop || null
    };

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data: PredictionResult = await response.json();
      setResult(data);
      toast({
        title: "Prediction Complete",
        description: `Recommended crop: ${data.crop}`,
      });

      // Send email report if user is logged in
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          await fetch(`${API_BASE_URL}/api/auth/send-report`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              report: data
            }),
          });
          toast({
            title: "Report Emailed",
            description: "A detailed report has been sent to your registered email.",
          });
        } catch (emailErr) {
          console.error("Failed to send email report", emailErr);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get prediction. Please try again.";
      setError(errorMessage);
      toast({
        title: "Prediction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateValue = (key: keyof typeof values, val: number[]) => {
    setValues((prev) => ({ ...prev, [key]: val[0] }));
  };

  const getCropImage = (cropName: string) => {
    const key = cropName.toLowerCase();
    return cropImages[key] || fallbackImage;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 bg-gradient-earth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Crop Recommendation
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Find the Best Crop for Your Land
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your soil nutrient levels and climate conditions to receive AI-powered crop recommendations with fertilizer and soil correction advice.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Form */}
            <div>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Soil & Climate Parameters</CardTitle>
                  <CardDescription>Enter parameters manually or use location-based data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location & Crop Selection Row */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Crop Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                          <Wheat size={14} />
                          Target Crop (Optional)
                        </label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          value={values.targetCrop}
                          onChange={(e) => setValues(prev => ({ ...prev, targetCrop: e.target.value }))}
                          disabled={isLoading}
                        >
                          <option value="">AI Prediction (Best Fit)</option>
                          {SUPPORTED_CROPS.map(crop => (
                            <option key={crop} value={crop}>{crop}</option>
                          ))}
                        </select>
                      </div>

                      {/* Climate Auto-detect */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                          <MapPin size={14} />
                          Local Climate
                        </label>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleAutoDetect}
                          disabled={isLocating || isLoading}
                          className="w-full h-10 gap-2 font-medium"
                        >
                          {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                          Detect via GPS
                        </Button>
                      </div>
                    </div>

                    <div className="h-px bg-primary/10" />

                    {/* Manual Search */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                        <Search size={14} />
                        Search Location
                      </label>
                      <form onSubmit={handleManualSearch} className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            placeholder="Enter city name..."
                            value={manualLocation}
                            onChange={(e) => setManualLocation(e.target.value)}
                            disabled={isLocating || isLoading}
                            className="pl-9 h-10 bg-background"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={!manualLocation || isLocating}
                          className="h-10 px-6"
                        >
                          {isLocating ? <Loader2 size={16} className="animate-spin" /> : "Fetch"}
                        </Button>
                      </form>
                    </div>
                  </div>

                  <div className="space-y-6 pt-2">
                    {/* Nitrogen */}
                    {/* Nitrogen */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 font-medium text-foreground">
                          <Leaf className="w-4 h-4 text-primary" />
                          Nitrogen (N)
                        </label>
                        <span className="text-sm text-muted-foreground">{values.nitrogen} kg/ha</span>
                      </div>
                      <Slider
                        value={[values.nitrogen]}
                        onValueChange={(val) => updateValue("nitrogen", val)}
                        max={140}
                        step={1}
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Phosphorus */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 font-medium text-foreground">
                          <Leaf className="w-4 h-4 text-secondary" />
                          Phosphorus (P)
                        </label>
                        <span className="text-sm text-muted-foreground">{values.phosphorus} kg/ha</span>
                      </div>
                      <Slider
                        value={[values.phosphorus]}
                        onValueChange={(val) => updateValue("phosphorus", val)}
                        max={145}
                        step={1}
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Potassium */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 font-medium text-foreground">
                          <Leaf className="w-4 h-4 text-accent" />
                          Potassium (K)
                        </label>
                        <span className="text-sm text-muted-foreground">{values.potassium} kg/ha</span>
                      </div>
                      <Slider
                        value={[values.potassium]}
                        onValueChange={(val) => updateValue("potassium", val)}
                        max={205}
                        step={1}
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    {/* pH */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 font-medium text-foreground">
                          <Droplets className="w-4 h-4 text-accent" />
                          pH Value
                        </label>
                        <span className="text-sm text-muted-foreground">{values.ph.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[values.ph]}
                        onValueChange={(val) => updateValue("ph", val)}
                        min={3.5}
                        max={9.5}
                        step={0.1}
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Temperature */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 font-medium text-foreground">
                          <Thermometer className="w-4 h-4 text-destructive" />
                          Temperature
                        </label>
                        <span className="text-sm text-muted-foreground">{values.temperature}°C</span>
                      </div>
                      <Slider
                        value={[values.temperature]}
                        onValueChange={(val) => updateValue("temperature", val)}
                        min={8}
                        max={45}
                        step={1}
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Rainfall */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 font-medium text-foreground">
                          <CloudRain className="w-4 h-4 text-accent" />
                          Rainfall
                        </label>
                        <span className="text-sm text-muted-foreground">{values.rainfall} mm</span>
                      </div>
                      <Slider
                        value={[values.rainfall]}
                        onValueChange={(val) => updateValue("rainfall", val)}
                        min={20}
                        max={300}
                        step={5}
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Humidity */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 font-medium text-foreground">
                          <Droplets className="w-4 h-4 text-accent" />
                          Humidity
                        </label>
                        <span className="text-sm text-muted-foreground">{values.humidity}%</span>
                      </div>
                      <Slider
                        value={[values.humidity]}
                        onValueChange={(val) => updateValue("humidity", val)}
                        min={14}
                        max={99}
                        step={1}
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handlePredict}
                    size="lg"
                    className="w-full"
                    variant="hero"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Wheat className="w-5 h-5" />
                        Predict Best Crop
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div>
              {/* Error State */}
              {error && (
                <Card className="shadow-card border-destructive/50 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">Prediction Error</h3>
                        <p className="text-muted-foreground">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={handlePredict}
                          disabled={isLoading}
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Loading State */}
              {isLoading && (
                <Card className="shadow-card h-full flex items-center justify-center min-h-[500px]">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                    <h3 className="font-semibold text-xl text-foreground mb-2">Analyzing Your Data</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Our ML model is processing your soil and climate parameters...
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Result State */}
              {result && !isLoading && (
                <Card className="shadow-card overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={getCropImage(result.crop)}
                      alt={result.crop}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/90 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-primary-foreground/70 mb-1">Recommended Crop</p>
                          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground capitalize">
                            {result.crop}
                          </h2>
                        </div>
                        <div className="hidden sm:block text-right">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-accent" />
                            <span className="text-lg font-semibold text-accent">Best Match</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    {/* TOP PRIORITY: Organic Farming Advice */}
                    {result.suggestions?.organic_advice && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="p-6 rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-white border-2 border-green-500/20 shadow-xl shadow-green-500/5 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-3 z-10">
                          <span className="text-[10px] font-black bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
                            <Leaf size={10} />
                            PRIMARY ORGANIC STRATEGY
                          </span>
                        </div>

                        <div className="flex gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                            <Leaf className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-black text-green-900 mb-2 font-serif">
                              Organic Recommendation
                            </h4>
                            <p className="text-base text-green-800 leading-relaxed font-semibold">
                              {result.suggestions.organic_advice}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* NEW: Crop Health & Growth Data */}
                    {result.crop_health_data && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 shadow-sm"
                      >
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-blue-900 mb-1">Crop Health & Yield Data</h4>
                            <p className="text-sm text-blue-800/80 leading-relaxed">
                              {result.crop_health_data}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Suitability Analysis (If target crop selected) */}
                    {result.suitability && (
                      <div className={`p-5 rounded-xl border ${result.suitability.is_suitable
                        ? 'bg-green-50 border-green-200'
                        : result.suitability.can_harvest
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            <Info className={`w-5 h-5 ${result.suitability.is_suitable ? 'text-green-600' : result.suitability.can_harvest ? 'text-amber-600' : 'text-red-600'
                              }`} />
                            Crop Suitability: {result.suitability.status}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">{result.suitability.message}</p>

                        {/* Organic Remedies List */}
                        {result.suitability.remedies.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                              <Leaf size={14} className="text-primary" />
                              Natural Remedies & Improvement:
                            </h4>
                            <ul className="grid gap-2">
                              {result.suitability.remedies.map((remedy, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 bg-white/50 p-2 rounded-lg border border-black/5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                                  {remedy}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive Priority Crops Section */}
                    {result.priority_crops && result.priority_crops.length > 0 && (
                      <div className="relative p-6 rounded-3xl bg-primary/5 border border-primary/10">
                        <h4 className="text-sm font-black text-primary mb-4 flex items-center gap-2 uppercase tracking-widest">
                          <TrendingUp size={18} />
                          Priority Crops (Hover for Details)
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {result.priority_crops.map((alt, idx) => (
                            <div
                              key={idx}
                              className="relative"
                              onMouseEnter={() => setHoveredCrop(alt as any)}
                              onMouseLeave={() => setHoveredCrop(null)}
                            >
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 rounded-xl bg-white border-2 border-primary/20 hover:border-primary text-sm font-bold text-primary shadow-sm capitalize transition-colors"
                              >
                                {alt.name}
                              </motion.button>

                              {/* Interactive Hover Tooltip */}
                              {hoveredCrop?.name === alt.name && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 z-50 pointer-events-none"
                                >
                                  <div className="bg-white rounded-2xl shadow-2xl border border-primary/20 p-4 ring-4 ring-primary/5">
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="text-xs font-black text-primary uppercase">Suitability</span>
                                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Score: {alt.suitability_score}/100</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                      {(alt as any).data}
                                    </p>
                                    <div className="mt-3 pt-2 border-t border-primary/10 text-[9px] text-center text-primary italic font-medium">
                                      Optimized for current soil parameters
                                    </div>
                                  </div>
                                  <div className="w-3 h-3 bg-white rotate-45 border-b border-r border-primary/20 mx-auto -mt-1.5" />
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Analysis Analysis */}
                    {result.comparison && (
                      <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                          <Beaker className="w-5 h-5" />
                          Detailed Lab Analysis
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(result.comparison).map(([key, val]) => (
                            <div key={key} className="p-3 rounded-lg bg-white/50 border border-primary/10">
                              <span className="text-xs font-bold text-muted-foreground uppercase">{key}</span>
                              <p className="text-sm font-medium text-foreground mt-1">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Suggestions - Multilingual */}
                    {result.suggestions && (
                      <div className="space-y-4 pt-4 border-t border-primary/10">
                        <h3 className="font-bold text-xl flex items-center gap-3 text-secondary-foreground">
                          <FlaskConical className="w-6 h-6 text-secondary" />
                          Comprehensive Soil Lab Strategy
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {result.suggestions.ph_adjustment && (
                            <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 flex gap-3 hover:bg-secondary/10 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                <Droplets className="w-5 h-5 text-secondary" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-secondary-foreground mb-1 uppercase tracking-tighter">pH Control</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                  {result.suggestions.ph_adjustment}
                                </p>
                              </div>
                            </div>
                          )}

                          {result.suggestions.nutrient_addition && (
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3 hover:bg-primary/10 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Leaf className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-primary mb-1 uppercase tracking-tighter">Nutrient Balance</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                  {result.suggestions.nutrient_addition}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fertilizer Recommendations */}
                    {result.fertilizers && (
                      <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                          <Beaker className="w-5 h-5" />
                          Fertilizer Application Plan
                        </h3>
                        <p className="text-sm font-medium text-foreground leading-relaxed bg-white/50 p-3 rounded-lg border border-primary/10">
                          {result.fertilizers}
                        </p>
                      </div>
                    )}

                    {/* Soil Correction Advice */}
                    {result.soil_correction && (
                      <div className="p-5 rounded-xl bg-secondary/5 border border-secondary/20 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-secondary">
                          <Shovel className="w-5 h-5" />
                          Soil Correction & Health Status
                        </h3>
                        <p className="text-sm font-medium text-foreground leading-relaxed bg-white/50 p-3 rounded-lg border border-secondary/10">
                          {result.soil_correction}
                        </p>
                      </div>
                    )}

                    {/* Input Summary */}
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Input Parameters Used
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">N:</span> <span className="font-medium">{values.nitrogen}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">P:</span> <span className="font-medium">{values.phosphorus}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">K:</span> <span className="font-medium">{values.potassium}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">pH:</span> <span className="font-medium">{values.ph}</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Temp:</span> <span className="font-medium">{values.temperature}°C</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">Rain:</span> <span className="font-medium">{values.rainfall}mm</span>
                        </div>
                        <div className="p-2 rounded bg-muted/50 col-span-2">
                          <span className="text-muted-foreground">Humidity:</span> <span className="font-medium">{values.humidity}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!result && !isLoading && !error && (
                <Card className="shadow-card h-full flex items-center justify-center min-h-[500px]">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                      <Wheat className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-xl text-foreground mb-2">No Prediction Yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Adjust the soil and climate parameters, then click "Predict Best Crop" to get your recommendation.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
