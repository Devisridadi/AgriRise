import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, GitBranch, BarChart3, Database, Cpu, Zap, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import techImage from "@/assets/smart-farming-tech.jpg";

const algorithms = [
  {
    name: "Random Forest",
    icon: GitBranch,
    description: "Ensemble method combining multiple decision trees for robust predictions",
    accuracy: 92,
    features: ["Handles non-linear relationships", "Feature importance ranking", "Resistant to overfitting"],
  },
  {
    name: "XGBoost",
    icon: Zap,
    description: "Gradient boosting algorithm optimized for speed and performance",
    accuracy: 94,
    features: ["High predictive accuracy", "Handles missing values", "Built-in regularization"],
  },
  {
    name: "Ensemble Model",
    icon: Brain,
    description: "Combined model leveraging strengths of multiple algorithms",
    accuracy: 95,
    features: ["Best overall accuracy", "Reduced variance", "More reliable predictions"],
  },
];

const accuracyData = [
  { name: "Decision Tree", accuracy: 85 },
  { name: "SVM", accuracy: 88 },
  { name: "Random Forest", accuracy: 92 },
  { name: "XGBoost", accuracy: 94 },
  { name: "Ensemble", accuracy: 95 },
];

const datasetFeatures = [
  { name: "Nitrogen (N)", type: "Numeric", range: "0-140 kg/ha" },
  { name: "Phosphorus (P)", type: "Numeric", range: "5-145 kg/ha" },
  { name: "Potassium (K)", type: "Numeric", range: "5-205 kg/ha" },
  { name: "Temperature", type: "Numeric", range: "8-45°C" },
  { name: "Humidity", type: "Numeric", range: "14-99%" },
  { name: "pH", type: "Numeric", range: "3.5-9.5" },
  { name: "Rainfall", type: "Numeric", range: "20-300 mm" },
];

export default function Technology() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={techImage} alt="Smart farming technology" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/95 via-forest-dark/85 to-forest-dark/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4">
              Technology Stack
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              The ML Models Behind AgriML
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Explore the machine learning algorithms and data science techniques powering our agricultural intelligence system.
            </p>
          </div>
        </div>
      </section>

      {/* Algorithms Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Machine Learning Algorithms</h2>
            <p className="text-muted-foreground">
              Our system employs state-of-the-art ensemble methods for accurate crop and soil predictions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {algorithms.map((algo, index) => (
              <Card key={algo.name} className={cn(
                "shadow-card card-hover",
                index === 2 && "border-primary"
              )}>
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <algo.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-xl">{algo.name}</CardTitle>
                  <CardDescription>{algo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-semibold text-primary">{algo.accuracy}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${algo.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {algo.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Accuracy Comparison Chart */}
          <Card className="shadow-card mb-16">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Model Accuracy Comparison
              </CardTitle>
              <CardDescription>Performance comparison across different ML algorithms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[80, 100]} unit="%" />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Accuracy']}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Why Ensemble Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                Why Ensemble Methods Excel
              </h2>
              <p className="text-muted-foreground mb-6">
                Ensemble methods combine predictions from multiple models to achieve better accuracy than any single model alone. This approach is particularly effective in agricultural prediction where data can be noisy and complex.
              </p>
              <div className="space-y-4">
                {[
                  "Reduces overfitting by averaging multiple models",
                  "Captures diverse patterns in agricultural data",
                  "More robust to outliers and noisy measurements",
                  "Provides confidence intervals for predictions",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold">Ensemble Model</h3>
                  <p className="text-muted-foreground">Final prediction layer</p>
                </div>
                <div className="flex justify-center gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <GitBranch className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Random Forest</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">XGBoost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dataset Section */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Dataset Features
              </CardTitle>
              <CardDescription>Input features used for model training and prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Feature</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasetFeatures.map((feature) => (
                      <tr key={feature.name} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{feature.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {feature.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{feature.range}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
