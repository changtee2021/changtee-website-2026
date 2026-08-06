import { Hero } from "@/components/home/Hero";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductGrid } from "@/components/home/ProductGrid";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLocalBusinessJsonLd } from "@/lib/local-business-jsonld";

export default function HomePage() {
  return (
    <div className="bg-shell pb-3 sm:pb-4">
      <JsonLd data={getLocalBusinessJsonLd()} />
      <Hero />
      <FeatureStrip />
      <ProductGrid />
      <HomeBelowFold />
    </div>
  );
}
