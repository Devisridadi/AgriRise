import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Package, AlertCircle, CheckCircle, Droplets, Calendar, Scale, Search, MapPin, Loader2, Thermometer, CloudRain, FlaskConical, Wheat, Info, Shovel, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import fertilizerImage from "@/assets/fertilizer-application.jpg";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { fetchWeatherData, getLocationCoords, getCoordsFromCity } from "@/services/WeatherService";
import { API_BASE_URL } from "@/lib/api";

const crops = [
  { id: "Rice", name: "Rice" },
  { id: "Maize", name: "Maize" },
  { id: "Chickpea", name: "Chickpea" },
  { id: "Kidneybeans", name: "Kidneybeans" },
  { id: "Pigeonpeas", name: "Pigeonpeas" },
  { id: "Mothbeans", name: "Mothbeans" },
  { id: "Mungbean", name: "Mungbean" },
  { id: "Blackgram", name: "Blackgram" },
  { id: "Lentil", name: "Lentil" },
  { id: "Pomegranate", name: "Pomegranate" },
  { id: "Banana", name: "Banana" },
  { id: "Mango", name: "Mango" },
  { id: "Grapes", name: "Grapes" },
  { id: "Watermelon", name: "Watermelon" },
  { id: "Muskmelon", name: "Muskmelon" },
  { id: "Apple", name: "Apple" },
  { id: "Orange", name: "Orange" },
  { id: "Papaya", name: "Papaya" },
  { id: "Coconut", name: "Coconut" },
  { id: "Cotton", name: "Cotton" },
  { id: "Jute", name: "Jute" },
  { id: "Coffee", name: "Coffee" },
  { id: "Wheat", name: "Wheat" },
];

const fertilizerRecommendations: Record<string, any[]> = {
  rice: [
    { name: "Urea", quantity: "100-120 kg/ha", timing: "Split: 50% basal, 25% tillering, 25% panicle", method: "Broadcasting", color: "bg-crop-wheat" },
    { name: "DAP", quantity: "50-60 kg/ha", timing: "Basal application", method: "Band placement", color: "bg-secondary" },
    { name: "MOP", quantity: "40-50 kg/ha", timing: "Basal application", method: "Broadcasting", color: "bg-primary" },
  ],
  wheat: [
    { name: "Urea", quantity: "120-150 kg/ha", timing: "Split: 50% sowing, 25% first irrigation, 25% second irrigation", method: "Broadcasting", color: "bg-crop-wheat" },
    { name: "SSP", quantity: "75-100 kg/ha", timing: "At sowing", method: "Drilling", color: "bg-secondary" },
    { name: "MOP", quantity: "30-40 kg/ha", timing: "At sowing", method: "Drilling", color: "bg-primary" },
  ],
  maize: [
    { name: "Urea", quantity: "130-160 kg/ha", timing: "Split: 25% sowing, 50% knee-high, 25% tasseling", method: "Side dressing", color: "bg-crop-wheat" },
    { name: "DAP", quantity: "60-75 kg/ha", timing: "At sowing", method: "Band placement", color: "bg-secondary" },
    { name: "MOP", quantity: "50-60 kg/ha", timing: "At sowing", method: "Broadcasting", color: "bg-primary" },
  ],
  cotton: [
    { name: "Urea", quantity: "80-100 kg/ha", timing: "Split: 50% at sowing, 50% at flowering", method: "Side dressing", color: "bg-crop-wheat" },
    { name: "SSP", quantity: "100-125 kg/ha", timing: "At sowing", method: "Broadcasting", color: "bg-secondary" },
    { name: "MOP", quantity: "40-50 kg/ha", timing: "At sowing", method: "Broadcasting", color: "bg-primary" },
  ],
  sugarcane: [
    { name: "Urea", quantity: "200-250 kg/ha", timing: "Split: 3 doses at 45, 90, 120 days", method: "Side dressing", color: "bg-crop-wheat" },
    { name: "SSP", quantity: "150-200 kg/ha", timing: "At planting", method: "Furrow application", color: "bg-secondary" },
    { name: "MOP", quantity: "80-100 kg/ha", timing: "At planting", method: "Furrow application", color: "bg-primary" },
  ],
  potato: [
    { name: "Urea", quantity: "100-120 kg/ha", timing: "Split: 50% planting, 50% earthing up", method: "Broadcasting", color: "bg-crop-wheat" },
    { name: "DAP", quantity: "75-100 kg/ha", timing: "At planting", method: "Band placement", color: "bg-secondary" },
    { name: "MOP", quantity: "100-120 kg/ha", timing: "At planting", method: "Band placement", color: "bg-primary" },
  ],
};

const safetyTips = [
  "Store fertilizers in a cool, dry place away from direct sunlight",
  "Wear protective gloves when handling fertilizers",
  "Never mix different fertilizers unless recommended",
  "Apply fertilizers when soil is moist for better absorption",
  "Avoid application during heavy rainfall to prevent runoff",
  "Keep fertilizers away from water bodies to prevent contamination",
];

const API_ENDPOINT = `${API_BASE_URL}/api/predict`;

export default function Fertilizer() {
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [values, setValues] = useState({
    nitrogen: 40,
    phosphorus: 25,
    potassium: 60,
    ph: 6.5,
    temperature: 25,
    humidity: 60,
    rainfall: 100,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const updateValue = (key: keyof typeof values, val: number[]) => {
    setValues((prev) => ({ ...prev, [key]: val[0] }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLocating(true);
    try {
      const coords = await getCoordsFromCity(searchQuery);
      const intel = await fetchWeatherData(coords.lat, coords.lon);

      setValues({
        nitrogen: intel.nitrogen || values.nitrogen,
        phosphorus: intel.phosphorus || values.phosphorus,
        potassium: intel.potassium || values.potassium,
        ph: intel.ph || values.ph,
        temperature: intel.temperature || values.temperature,
        humidity: intel.humidity || values.humidity,
        rainfall: intel.rainfall > 0 ? Math.min(Math.max(intel.rainfall * 10, 20), 300) : values.rainfall,
      });

      setLocationName(coords.name);
      setSearchQuery(coords.name);
      toast.success(`Parameters auto-filled for ${coords.name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch details");
    } finally {
      setIsLocating(false);
    }
  };

  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }

    setIsLocating(true);
    try {
      const coords = await getLocationCoords();
      const intel = await fetchWeatherData(coords.lat, coords.lon);

      setValues({
        nitrogen: intel.nitrogen || values.nitrogen,
        phosphorus: intel.phosphorus || values.phosphorus,
        potassium: intel.potassium || values.potassium,
        ph: intel.ph || values.ph,
        temperature: intel.temperature || values.temperature,
        humidity: intel.humidity || values.humidity,
        rainfall: intel.rainfall > 0 ? Math.min(Math.max(intel.rainfall * 10, 20), 300) : values.rainfall,
      });

      if (intel.locationName) {
        setLocationName(intel.locationName);
        setSearchQuery(intel.locationName);
      } else {
        setLocationName("Current Location");
      }

      toast.success("GPS parameters auto-filled successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to retrieve location");
    } finally {
      setIsLocating(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!selectedCrop) {
      toast.error("Please select a crop first");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        N: values.nitrogen,
        P: values.phosphorus,
        K: values.potassium,
        pH: values.ph,
        temperature: values.temperature,
        humidity: values.humidity,
        rainfall: values.rainfall,
        target_crop: crops.find(c => c.id === selectedCrop)?.name
      };

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Recommendation failed");
      const data = await response.json();
      setResult(data);
      toast.success("Fertilizer recommendations generated!");
    } catch (err: any) {
      toast.error("Failed to get recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={fertilizerImage} alt="Fertilizer application" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/95 via-forest-dark/85 to-forest-dark/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4">
              Fertilizer Advisory
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              Optimize Your Fertilizer Usage
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Get precise fertilizer recommendations with optimal quantities, timing, and application methods for your crops.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Input Parameters */}
            <Card className="shadow-card lg:col-span-1">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Soil & Location</CardTitle>
                <CardDescription>Enter parameters for precise advice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto-fill from Location */}
                <div className="space-y-2 pb-4 border-b">
                  <label className="text-xs font-bold text-primary uppercase">Location Auto-fill</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button size="icon" variant="secondary" onClick={() => handleSearch()} disabled={isLocating}>
                      {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-1 text-xs"
                    onClick={handleAutoDetect}
                    disabled={isLocating}
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    Detect via GPS
                  </Button>
                </div>

                {/* Crop Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                    <Sprout size={14} />
                    Target Crop
                  </label>
                  <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select crop..." />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nitrogen */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Nitrogen (N)</span>
                    <span>{values.nitrogen} kg/ha</span>
                  </div>
                  <Slider value={[values.nitrogen]} onValueChange={(v) => updateValue("nitrogen", v)} max={140} step={1} />
                </div>

                {/* Phosphorus */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Phosphorus (P)</span>
                    <span>{values.phosphorus} kg/ha</span>
                  </div>
                  <Slider value={[values.phosphorus]} onValueChange={(v) => updateValue("phosphorus", v)} max={145} step={1} />
                </div>

                {/* Potassium */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Potassium (K)</span>
                    <span>{values.potassium} kg/ha</span>
                  </div>
                  <Slider value={[values.potassium]} onValueChange={(v) => updateValue("potassium", v)} max={205} step={1} />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleGetRecommendations}
                    className="w-full gap-2"
                    variant="hero"
                    disabled={isLoading || !selectedCrop}
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />}
                    Get AI Advisory
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Display */}
            <div className="lg:col-span-2 space-y-6">
              {result ? (
                <>
                  <Card className="shadow-card border-l-4 border-primary">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="font-serif text-2xl flex items-center gap-2 text-primary">
                          <CheckCircle className="w-6 h-6" />
                          AI Recommended Schedule
                        </CardTitle>
                      </div>
                      <CardDescription>Based on your soil nutrient levels and {crops.find(c => c.id === selectedCrop)?.name} requirements.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                          <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-2 uppercase tracking-wide">
                            <Scale className="w-4 h-4" />
                            Fertilizer Doses
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(result.fertilizer) ? (
                              result.fertilizer.map((rec: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-white text-xs border border-primary/20 rounded font-medium text-foreground">
                                  {rec}
                                </span>
                              ))
                            ) : (
                              <span className="px-2 py-1 bg-white text-xs border border-primary/20 rounded font-medium text-foreground">
                                {result.fertilizer || "No recommendation provided"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                          <h4 className="text-sm font-bold text-secondary-foreground flex items-center gap-2 mb-2 uppercase tracking-wide">
                            <Shovel className="w-4 h-4" />
                            Soil Correction
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {result.soil_correction}
                          </p>
                        </div>
                      </div>

                      {result.suggestions && (
                        <div className="space-y-4">
                          {/* Organic Farming Advice */}
                          {result.suggestions.organic_advice && (
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-2">
                                <span className="text-[10px] font-bold bg-green-200/50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                  AI GENERATED
                                </span>
                              </div>
                              <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-green-100">
                                  <Leaf className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="text-base font-bold text-green-900 mb-1">Organic Farming Advice</h4>
                                  <p className="text-sm text-green-800/80 leading-relaxed font-medium">
                                    {result.suggestions.organic_advice}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* AI Nutrient Optimization */}
                          {result.suggestions.nutrient_addition && (
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <FlaskConical className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-primary mb-1">Nutrient & Fertilizer Strategy</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {result.suggestions.nutrient_addition}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* pH Adjustment */}
                          {result.suggestions.ph_adjustment && (
                            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex gap-3">
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Droplets className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-orange-800 mb-1">Soil pH Correction (AI)</h4>
                                <p className="text-xs text-orange-700/80 leading-relaxed">
                                  {result.suggestions.ph_adjustment}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {result.comparison && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            NPK Gap & Climate Context
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.entries(result.comparison).slice(0, 4).map(([key, val]: [string, any]) => (
                              <div key={key} className="p-2 rounded bg-muted/50">
                                <span className="text-[10px] text-muted-foreground uppercase">{key} Gap</span>
                                <p className="text-xs font-bold truncate">{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="h-full flex items-center justify-center border-dashed border-2 bg-muted/20">
                  <div className="text-center p-12">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Scale className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-xl">No Analysis Generated</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                      Enter your soil and climate data on the left to receive AI-powered fertilizer recommendations.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>


          {/* Safety Tips */}
          <Card className="shadow-card bg-muted border-none">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-secondary" />
                Safety Tips & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {safetyTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
