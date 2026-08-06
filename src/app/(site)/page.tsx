import { Hero } from "@/components/home/Hero";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductGrid } from "@/components/home/ProductGrid";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";

export default function HomePage() {
  return (
    <div className="bg-shell pb-3 sm:pb-4">
      <Hero />
      <FeatureStrip />
      <ProductGrid />
      <HomeBelowFold />
    </div>
  );
}
