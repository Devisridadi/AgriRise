import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import wheatImage from "@/assets/wheat-field.jpg";
import riceImage from "@/assets/rice-field.jpg";
import cornImage from "@/assets/corn-field.jpg";
import cottonImage from "@/assets/cotton-field.jpg";

const crops = [
  { name: "Wheat", image: wheatImage, conditions: "Low humidity, cool climate" },
  { name: "Rice", image: riceImage, conditions: "High rainfall, warm climate" },
  { name: "Maize", image: cornImage, conditions: "Moderate rainfall, fertile soil" },
  { name: "Cotton", image: cottonImage, conditions: "Warm climate, well-drained soil" },
];

export function CropsShowcase() {
  return (
    <section className="py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Supported Crops
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Explore Our Supported Crops
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/crop-recommendation">
              View All Crops
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {crops.map((crop, index) => (
            <div
              key={crop.name}
              className="group relative rounded-2xl overflow-hidden shadow-card card-hover animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[4/5]">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/90 via-forest-dark/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-serif text-2xl font-bold text-primary-foreground mb-2">{crop.name}</h3>
                <p className="text-sm text-primary-foreground/70">{crop.conditions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
