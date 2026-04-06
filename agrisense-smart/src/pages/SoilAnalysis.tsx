import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { FlaskConical, Leaf, AlertTriangle, CheckCircle, Info, ArrowRight, Search, MapPin, Loader2, Thermometer, CloudRain, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import soilImage from "@/assets/soil-testing.jpg";
import { toast } from "sonner";
import { fetchWeatherData, getLocationCoords, getCoordsFromCity } from "@/services/WeatherService";

const getNutrientStatus = (value: number, optimal: { min: number; max: number }) => {
  if (value < optimal.min) return { status: "deficient", label: "Deficient", color: "text-destructive" };
  if (value > optimal.max) return { status: "excess", label: "Excess", color: "text-secondary" };
  return { status: "optimal", label: "Optimal", color: "text-primary" };
};

const getPhStatus = (ph: number) => {
  if (ph < 6.0) return { status: "acidic", label: "Acidic", color: "text-secondary" };
  if (ph > 7.5) return { status: "alkaline", label: "Alkaline", color: "text-accent" };
  return { status: "neutral", label: "Neutral", color: "text-primary" };
};

// Deterministic random number generator based on string seed
const generateSoilData = (location: string) => {
  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = location.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Consistent pseudo-random values
  const n = (Math.abs(hash) % 100) + 20; // 20-120
  const p = (Math.abs(hash >> 2) % 80) + 10; // 10-90
  const k = (Math.abs(hash >> 4) % 120) + 20; // 20-140
  const ph = ((Math.abs(hash >> 6) % 40) + 45) / 10; // 4.5 - 8.5

  return { nitrogen: n, phosphorus: p, potassium: k, ph };
};

export default function SoilAnalysis() {
  const [values, setValues] = useState({
    nitrogen: 40,
    phosphorus: 25,
    potassium: 60,
    ph: 5.5,
    temperature: 25,
    humidity: 60,
    rainfall: 100,
  });
  const [analyzed, setAnalyzed] = useState(false);

  // Location Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);

  const updateValue = (key: keyof typeof values, val: number[]) => {
    setValues((prev) => ({ ...prev, [key]: val[0] }));
    setAnalyzed(false);
  };

  const handleAnalyze = () => setAnalyzed(true);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
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

      if (coords.name) {
        setLocationName(coords.name);
        setSearchQuery(coords.name);
      }
      setAnalyzed(true);
      toast.success(`Soil and climate data retrieved for ${coords.name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };
  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
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

      setAnalyzed(true);
      toast.success(`Soil and climate data auto-filled for ${intel.locationName || 'current location'}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to retrieve location");
    } finally {
      setLoading(false);
    }
  };
  const nutrients = [
    { key: "nitrogen" as const, label: "Nitrogen (N)", unit: "kg/ha", optimal: { min: 40, max: 80 }, max: 140 },
    { key: "phosphorus" as const, label: "Phosphorus (P)", unit: "kg/ha", optimal: { min: 20, max: 50 }, max: 145 },
    { key: "potassium" as const, label: "Potassium (K)", unit: "kg/ha", optimal: { min: 40, max: 80 }, max: 205 },
  ];

  const phStatus = getPhStatus(values.ph);

  const corrections = analyzed ? [
    values.ph < 6.0 && {
      title: "Apply Agricultural Lime",
      description: "Add lime to raise soil pH to the optimal range (6.0-7.0)",
      dosage: "2-3 tonnes/hectare",
      icon: AlertTriangle,
      priority: "high",
    },
    values.ph > 7.5 && {
      title: "Apply Sulfur or Organic Matter",
      description: "Add eleite sulfur or organic compost to lower pH",
      dosage: "500-1000 kg/hectare",
      icon: AlertTriangle,
      priority: "medium",
    },
    values.nitrogen < 40 && {
      title: "Nitrogen Enrichment Required",
      description: "Apply nitrogen-rich fertilizers or grow leguminous cover crops",
      dosage: "Urea: 20-40 kg/hectare",
      icon: Leaf,
      priority: "high",
    },
    values.phosphorus < 20 && {
      title: "Phosphorus Supplementation",
      description: "Apply DAP or single superphosphate",
      dosage: "SSP: 25-50 kg/hectare",
      icon: Leaf,
      priority: "medium",
    },
    values.potassium < 40 && {
      title: "Potassium Application Needed",
      description: "Apply Muriate of Potash (MOP)",
      dosage: "MOP: 15-30 kg/hectare",
      icon: Leaf,
      priority: "medium",
    },
  ].filter(Boolean) : [];

  const isFertile = values.nitrogen >= 40 && values.phosphorus >= 20 && values.potassium >= 40 && values.ph >= 6.0 && values.ph <= 7.5;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 bg-gradient-earth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Soil Analysis
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Understand Your Soil Health
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Get comprehensive soil fertility analysis with nutrient status indicators and personalized correction recommendations.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>NPK Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>pH Assessment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Correction Tips</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-elevated">
                <img src={soilImage} alt="Soil testing" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input */}
            <Card className="shadow-card lg:col-span-1 border-primary/20">
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center justify-between">
                  Enter Soil Data
                  {locationName && <span className="text-xs font-sans font-normal text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">Source: {locationName}</span>}
                </CardTitle>
                <CardDescription>Adjust values or fetch from location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Location Search Box */}
                <div className="space-y-2 pb-4 border-b border-border/50">
                  <label className="text-sm font-medium">Auto-fill from Location</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type city (e.g. Mumbai)..."
                      className="bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button size="icon" variant="secondary" onClick={() => handleSearch(undefined)} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-xs text-muted-foreground hover:text-primary"
                    onClick={handleGeolocation}
                    disabled={loading}
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    Use My Current Location
                  </Button>
                </div>

                {nutrients.map((nutrient) => (
                  <div key={nutrient.key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{nutrient.label}</span>
                      <span className="text-muted-foreground">{values[nutrient.key].toFixed(0)} {nutrient.unit}</span>
                    </div>
                    <Slider
                      value={[values[nutrient.key]]}
                      onValueChange={(val) => updateValue(nutrient.key, val)}
                      max={nutrient.max}
                      step={1}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">pH Level</span>
                    <span className="text-muted-foreground">{values.ph.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[values.ph]}
                    onValueChange={(val) => updateValue("ph", val)}
                    min={3.5}
                    max={9.5}
                    step={0.1}
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-destructive" />
                      Temperature
                    </span>
                    <span className="text-muted-foreground">{values.temperature}°C</span>
                  </div>
                  <Slider
                    value={[values.temperature]}
                    onValueChange={(val) => updateValue("temperature", val)}
                    min={8}
                    max={45}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-accent" />
                      Rainfall
                    </span>
                    <span className="text-muted-foreground">{values.rainfall} mm</span>
                  </div>
                  <Slider
                    value={[values.rainfall]}
                    onValueChange={(val) => updateValue("rainfall", val)}
                    min={20}
                    max={300}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-accent" />
                      Humidity
                    </span>
                    <span className="text-muted-foreground">{values.humidity}%</span>
                  </div>
                  <Slider
                    value={[values.humidity]}
                    onValueChange={(val) => updateValue("humidity", val)}
                    min={14}
                    max={99}
                    step={1}
                  />
                </div>
                <Button onClick={handleAnalyze} variant="hero" className="w-full">
                  <FlaskConical className="w-4 h-4" />
                  Analyze Soil
                </Button>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="shadow-card lg:col-span-1">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Nutrient Status</CardTitle>
                <CardDescription>Current levels vs optimal range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {nutrients.map((nutrient) => {
                  const status = getNutrientStatus(values[nutrient.key], nutrient.optimal);
                  const percent = (values[nutrient.key] / nutrient.max) * 100;
                  return (
                    <div key={nutrient.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{nutrient.label}</span>
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                          status.status === "optimal" ? "bg-primary/10 text-primary" :
                            status.status === "deficient" ? "bg-destructive/10 text-destructive" :
                              "bg-secondary/10 text-secondary"
                        )}>
                          {status.label}
                        </span>
                      </div>
                      <Progress value={percent} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Optimal: {nutrient.optimal.min}-{nutrient.optimal.max} {nutrient.unit}
                      </p>
                    </div>
                  );
                })}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">pH Level</span>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                      phStatus.status === "neutral" ? "bg-primary/10 text-primary" :
                        phStatus.status === "acidic" ? "bg-secondary/10 text-secondary" :
                          "bg-accent/10 text-accent"
                    )}>
                      {phStatus.label}
                    </span>
                  </div>
                  <div className="relative h-3 bg-gradient-to-r from-destructive via-primary to-accent rounded-full">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-background shadow-lg"
                      style={{ left: `${((values.ph - 3.5) / 6) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Acidic (3.5)</span>
                    <span>Neutral (7.0)</span>
                    <span>Alkaline (9.5)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fertility Status */}
            <Card className={cn("shadow-card lg:col-span-1", analyzed && (isFertile ? "border-primary" : "border-secondary"))}>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Soil Health</CardTitle>
                <CardDescription>Overall fertility assessment</CardDescription>
              </CardHeader>
              <CardContent>
                {analyzed ? (
                  <div className="text-center">
                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
                      isFertile ? "bg-primary/10" : "bg-secondary/10"
                    )}>
                      {isFertile ? (
                        <CheckCircle className="w-12 h-12 text-primary" />
                      ) : (
                        <AlertTriangle className="w-12 h-12 text-secondary" />
                      )}
                    </div>
                    <h3 className={cn("text-2xl font-bold mb-2", isFertile ? "text-primary" : "text-secondary")}>
                      {isFertile ? "Fertile Soil" : "Needs Improvement"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {isFertile
                        ? "Your soil has optimal nutrient levels for most crops."
                        : "Some nutrient levels need correction for optimal crop growth."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Click "Analyze Soil" to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Corrections */}
          {analyzed && corrections.length > 0 && (
            <div className="mt-12">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Soil Correction Recommendations</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {corrections.map((correction: any, index) => (
                  <Card key={index} className="shadow-card">
                    <CardContent className="pt-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                        correction.priority === "high" ? "bg-destructive/10" : "bg-secondary/10"
                      )}>
                        <correction.icon className={cn("w-6 h-6",
                          correction.priority === "high" ? "text-destructive" : "text-secondary"
                        )} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{correction.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{correction.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium">{correction.dosage}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {analyzed && corrections.length === 0 && (
            <div className="mt-12 text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">No Corrections Needed!</h2>
              <p className="text-muted-foreground">Your soil is in excellent condition for most crops.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
