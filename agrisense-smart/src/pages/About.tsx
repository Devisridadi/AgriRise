import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Lightbulb, Users, TrendingUp, Heart, Globe, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";

const objectives = [
  "Develop an ML-based system for accurate crop recommendation",
  "Create soil health analysis with correction suggestions",
  "Implement fertilizer dosage prediction algorithms",
  "Design a user-friendly interface accessible to farmers",
  "Achieve prediction accuracy above 90%",
  "Enable data-driven agricultural decision making",
];

const impacts = [
  {
    icon: TrendingUp,
    title: "Increased Yield",
    description: "Up to 25% improvement in crop yields through optimized recommendations",
  },
  {
    icon: Heart,
    title: "Reduced Waste",
    description: "30% reduction in fertilizer wastage through precise dosage calculations",
  },
  {
    icon: Users,
    title: "Farmer Empowerment",
    description: "Enabling small-scale farmers with access to advanced agricultural technology",
  },
  {
    icon: Globe,
    title: "Sustainable Farming",
    description: "Promoting environmentally conscious farming practices through data-driven insights",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Agriculture" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-dark/95 via-forest-dark/85 to-forest-dark/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4">
              About Project
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              Transforming Agriculture with AI
            </h1>
            <p className="text-lg text-primary-foreground/80">
              A research initiative aimed at empowering farmers with machine learning-based decision support for sustainable and profitable farming.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
                The Challenge
              </span>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Problem Statement</h2>
              <p className="text-muted-foreground mb-4">
                Traditional farming practices often lead to suboptimal crop selection, inefficient fertilizer usage, and degraded soil health. Farmers lack access to data-driven insights that could significantly improve their yields and reduce input costs.
              </p>
              <p className="text-muted-foreground mb-4">
                The disconnect between agricultural research and practical farming creates a gap where valuable scientific knowledge remains inaccessible to those who need it most – the farmers.
              </p>
              <p className="text-muted-foreground">
                Climate change further complicates decision-making, requiring adaptive strategies that consider changing weather patterns and their impact on crop suitability.
              </p>
            </div>
            <Card className="shadow-elevated">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Lightbulb className="w-7 h-7 text-secondary" />
                </div>
                <CardTitle className="font-serif text-2xl">Project Motivation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This project was born from the vision to bridge the gap between advanced machine learning technology and practical agricultural needs. By making data science accessible to farmers, we aim to revolutionize how farming decisions are made, leading to better outcomes for farmers, consumers, and the environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Goals
            </span>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Project Objectives</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Clear, measurable goals that guide our development and ensure we deliver real value to farmers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((objective, index) => (
              <Card key={index} className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-foreground font-medium">{objective}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Impact */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
              Making a Difference
            </span>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Real-World Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              How AgriML is designed to create meaningful change in agricultural communities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map((impact, index) => (
              <Card key={index} className="shadow-card card-hover text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <impact.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{impact.title}</h3>
                  <p className="text-sm text-muted-foreground">{impact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold mb-6">A Machine Learning Research Initiative</h2>
            <p className="text-primary-foreground/80 max-w-3xl mx-auto mb-8">
              This project represents a significant contribution to the field of agricultural informatics, combining expertise in machine learning, soil science, and agricultural economics to create a practical solution for modern farming challenges.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <div>
                <p className="text-4xl font-bold">22+</p>
                <p className="text-primary-foreground/70">Crop Types</p>
              </div>
              <div>
                <p className="text-4xl font-bold">95%</p>
                <p className="text-primary-foreground/70">Accuracy</p>
              </div>
              <div>
                <p className="text-4xl font-bold">7</p>
                <p className="text-primary-foreground/70">Input Parameters</p>
              </div>
              <div>
                <p className="text-4xl font-bold">3</p>
                <p className="text-primary-foreground/70">ML Models</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
