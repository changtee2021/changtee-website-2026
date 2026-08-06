import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Hero";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductGrid } from "@/components/home/ProductGrid";

/** Below-fold sections — code-split so the first paint stays light (admin works; home was OOM-heavy). */
const HomePortfolioSection = dynamic(
  () =>
    import("@/components/home/HomePortfolioSection").then((m) => ({
      default: m.HomePortfolioSection,
    })),
  { ssr: true },
);
const CatalogSection = dynamic(
  () =>
    import("@/components/home/CatalogSection").then((m) => ({
      default: m.CatalogSection,
    })),
  { ssr: true },
);
const HowItWorks = dynamic(
  () =>
    import("@/components/home/HowItWorks").then((m) => ({
      default: m.HowItWorks,
    })),
  { ssr: true },
);
const Testimonials = dynamic(
  () =>
    import("@/components/home/Testimonials").then((m) => ({
      default: m.Testimonials,
    })),
  { ssr: true },
);
const ClientsLogos = dynamic(
  () =>
    import("@/components/home/ClientsLogos").then((m) => ({
      default: m.ClientsLogos,
    })),
  { ssr: true },
);
const StatsStory = dynamic(
  () =>
    import("@/components/home/StatsStory").then((m) => ({
      default: m.StatsStory,
    })),
  { ssr: true },
);
const BlogPreview = dynamic(
  () =>
    import("@/components/home/BlogPreview").then((m) => ({
      default: m.BlogPreview,
    })),
  { ssr: true },
);
const ServicesStrip = dynamic(
  () =>
    import("@/components/home/ServicesStrip").then((m) => ({
      default: m.ServicesStrip,
    })),
  { ssr: true },
);
const ContactCta = dynamic(
  () =>
    import("@/components/home/ContactCta").then((m) => ({
      default: m.ContactCta,
    })),
  { ssr: true },
);

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
