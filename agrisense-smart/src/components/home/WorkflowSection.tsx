import { ArrowRight, FileInput, MapPin, Cpu, Leaf, FlaskConical } from "lucide-react";
import soilTestingImage from "@/assets/soil-testing.jpg";

const steps = [
  {
    icon: FileInput,
    title: "Soil Data Input",
    description: "Farmer enters numeric soil values: pH, N, P, K, moisture, organic matter (no soil type).",
  },
  {
    icon: MapPin,
    title: "Location & Climate",
    description: "Farmer selects State & District OR GPS auto-detect. System fetches real-time climate data: temp, rain, humidity.",
  },
  {
    icon: Cpu,
    title: "ML Crop Recommendation",
    description: "ML model predicts suitable crops based on soil + climate features. Farmer chooses one crop to grow.",
  },
  {
    icon: Leaf,
    title: "Soil Correction",
    description: "System compares soil values with crop's ideal requirements. Suggests pH adjustment, nutrient addition, organic correction.",
  },
  {
    icon: FlaskConical,
    title: "Fertilizer Recommendation",
    description: "Calculates fertilizer type, quantity, and timing based on current soil vs crop requirements.",
  },
];

export function WorkflowSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={soilTestingImage}
                alt="Soil testing and analysis"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl shadow-elevated p-6 border border-border max-w-[250px] animate-float">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">ML Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground">Processing multiple key parameters for accurate predictions</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Project Flow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
              From Soil Sample to Smart Decision
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Our streamlined process transforms raw soil data into actionable agricultural intelligence through these key stages.
            </p>

            {/* Steps */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-semibold text-lg text-foreground mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
