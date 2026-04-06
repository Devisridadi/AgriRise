import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { WorkflowSection } from "@/components/home/WorkflowSection";
import { CropsShowcase } from "@/components/home/CropsShowcase";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <CropsShowcase />
      <CTASection />
    </Layout>
  );
};

export default Index;
