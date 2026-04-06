import { Wheat, FlaskConical, Sprout, Cloud, BarChart3, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Wheat,
    title: "Crop Recommendation",
    description: "Get AI-powered suggestions for the best crops based on your soil nutrients, climate, and regional conditions.",
    color: "text-crop-wheat",
    bgColor: "bg-crop-wheat/10",
  },
  {
    icon: FlaskConical,
    title: "Soil Fertility Analysis",
    description: "Comprehensive assessment of soil health with detailed nutrient status and deficiency indicators.",
    color: "text-soil",
    bgColor: "bg-soil/10",
  },
  {
    icon: Sprout,
    title: "Fertilizer Dosage",
    description: "Precise fertilizer recommendations with optimal quantities and application methods for maximum efficiency.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Cloud,
    title: "Climate-Aware Decisions",
    description: "Weather-integrated predictions considering rainfall, temperature, and humidity patterns.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Brain,
    title: "ML-Powered Insights",
    description: "Advanced ensemble models including Random Forest and XGBoost for accurate predictions.",
    color: "text-forest",
    bgColor: "bg-forest/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-earth section-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Comprehensive Agricultural Intelligence
          </h2>
          <p className="text-lg text-muted-foreground">
            Our integrated system provides end-to-end support for modern farming decisions, from soil analysis to harvest optimization.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "group p-8 rounded-2xl bg-card border border-border shadow-soft card-hover",
                "animate-fade-up"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                feature.bgColor
              )}>
                <feature.icon className={cn("w-7 h-7", feature.color)} />
              </div>
              <h3 className="font-semibold text-xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
