import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Target, ArrowRight, CheckCircle, Clock, Wifi, Smartphone, Satellite, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

const existingProblems = [
  {
    title: "Lack of Data-Driven Decisions",
    description: "Most farmers rely on traditional methods and intuition rather than scientific data analysis.",
  },
  {
    title: "Generic Recommendations",
    description: "Existing advisory systems provide one-size-fits-all suggestions without considering local conditions.",
  },
  {
    title: "No Integration of Parameters",
    description: "Crop, soil, and fertilizer recommendations are often provided in isolation.",
  },
  {
    title: "Limited Access to ML Technology",
    description: "Advanced machine learning tools are not accessible to small-scale farmers.",
  },
];

const ourSolutions = [
  {
    problem: "Lack of Data-Driven Decisions",
    solution: "ML-powered predictions based on 7 key soil and climate parameters",
  },
  {
    problem: "Generic Recommendations",
    solution: "Personalized suggestions based on actual soil test results and local weather",
  },
  {
    problem: "No Integration",
    solution: "Unified platform combining crop, soil, and fertilizer recommendations",
  },
  {
    problem: "Limited Access",
    solution: "Free, web-based tool accessible from any device",
  },
];

const futureEnhancements = [
  {
    icon: Cloud,
    title: "Real-Time Climate Integration",
    description: "Live weather data feeds for dynamic recommendation adjustments",
    timeline: "Phase 1",
    status: "planned",
  },
  {
    icon: Wifi,
    title: "IoT Sensor Integration",
    description: "Connect soil sensors for automated data collection and monitoring",
    timeline: "Phase 2",
    status: "planned",
  },
  {
    icon: Smartphone,
    title: "Mobile Application",
    description: "Native mobile app for offline access and field data collection",
    timeline: "Phase 2",
    status: "planned",
  },
  {
    icon: Satellite,
    title: "Satellite Imagery Analysis",
    description: "NDVI-based crop health monitoring using satellite data",
    timeline: "Phase 3",
    status: "future",
  },
  {
    icon: Target,
    title: "Precision Agriculture",
    description: "Zone-based variable rate fertilizer application recommendations",
    timeline: "Phase 3",
    status: "future",
  },
  {
    icon: Lightbulb,
    title: "AI Chatbot Assistant",
    description: "Conversational interface for farmer queries in local languages",
    timeline: "Phase 4",
    status: "future",
  },
];

export default function Research() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-gradient-earth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Research & Innovation
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Bridging the Research Gap
            </h1>
            <p className="text-lg text-muted-foreground">
              Understanding the limitations of existing systems and how AgriML addresses them with innovative solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Existing Problems */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Existing Challenges in Agriculture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Current agricultural decision support systems face several limitations that hinder effective farming practices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {existingProblems.map((problem, index) => (
              <Card key={index} className="shadow-card border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-destructive">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">{problem.title}</h3>
                      <p className="text-muted-foreground">{problem.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* How We Solve */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">How AgriML Addresses These Gaps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our integrated approach provides comprehensive solutions to each identified challenge.
            </p>
          </div>

          <div className="space-y-4 mb-16">
            {ourSolutions.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-4">
                <Card className="shadow-card flex-1 border-destructive/20">
                  <CardContent className="py-4 text-center">
                    <span className="text-muted-foreground">{item.problem}</span>
                  </CardContent>
                </Card>
                <ArrowRight className="w-6 h-6 text-primary hidden md:block" />
                <Card className="shadow-card flex-1 border-primary">
                  <CardContent className="py-4 text-center">
                    <span className="text-foreground font-medium">{item.solution}</span>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Roadmap */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Future Development Roadmap</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our vision for expanding AgriML's capabilities to serve farmers better.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futureEnhancements.map((enhancement, index) => (
              <Card key={index} className={cn(
                "shadow-card card-hover",
                enhancement.status === "planned" && "border-primary/30"
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      enhancement.status === "planned" ? "bg-primary/10" : "bg-muted"
                    )}>
                      <enhancement.icon className={cn(
                        "w-6 h-6",
                        enhancement.status === "planned" ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      enhancement.status === "planned"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted-foreground/10 text-muted-foreground"
                    )}>
                      {enhancement.timeline}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{enhancement.title}</CardTitle>
                  <CardDescription>{enhancement.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Timeline Visual */}
          <div className="mt-16">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {["Phase 1", "Phase 2", "Phase 3", "Phase 4"].map((phase, index) => (
                <div key={phase} className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full",
                    index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Clock className="w-4 h-4" />
                    <span className="font-medium text-sm">{phase}</span>
                  </div>
                  {index < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
