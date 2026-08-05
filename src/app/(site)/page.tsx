import { Hero } from "@/components/home/Hero";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { HomePortfolioSection } from "@/components/home/HomePortfolioSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { ClientsLogos } from "@/components/home/ClientsLogos";
import { StatsStory } from "@/components/home/StatsStory";
import { BlogPreview } from "@/components/home/BlogPreview";
import { ServicesStrip } from "@/components/home/ServicesStrip";
import { ProductGrid } from "@/components/home/ProductGrid";
import { CatalogSection } from "@/components/home/CatalogSection";
import { ContactCta } from "@/components/home/ContactCta";

export default function HomePage() {
  return (
    <div className="bg-shell pb-3 sm:pb-4">
      <Hero />
      <FeatureStrip />
      <ProductGrid />
      <HomePortfolioSection />
      <CatalogSection />
      <HowItWorks />
      <Testimonials />
      <ClientsLogos />
      <StatsStory />
      <BlogPreview />
      <ServicesStrip />
      <ContactCta />
    </div>
  );
}
