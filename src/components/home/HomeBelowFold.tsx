"use client";

import dynamic from "next/dynamic";

const HomePortfolioSection = dynamic(
  () =>
    import("@/components/home/HomePortfolioSection").then((m) => ({
      default: m.HomePortfolioSection,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);
const CatalogSection = dynamic(
  () =>
    import("@/components/home/CatalogSection").then((m) => ({
      default: m.CatalogSection,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);
const HowItWorks = dynamic(
  () =>
    import("@/components/home/HowItWorks").then((m) => ({
      default: m.HowItWorks,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);
const Testimonials = dynamic(
  () =>
    import("@/components/home/Testimonials").then((m) => ({
      default: m.Testimonials,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);
const ClientsLogos = dynamic(
  () =>
    import("@/components/home/ClientsLogos").then((m) => ({
      default: m.ClientsLogos,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);
const StatsStory = dynamic(
  () =>
    import("@/components/home/StatsStory").then((m) => ({
      default: m.StatsStory,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);
const BlogPreview = dynamic(
  () =>
    import("@/components/home/BlogPreview").then((m) => ({
      default: m.BlogPreview,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);
const ServicesStrip = dynamic(
  () =>
    import("@/components/home/ServicesStrip").then((m) => ({
      default: m.ServicesStrip,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);
const ContactCta = dynamic(
  () =>
    import("@/components/home/ContactCta").then((m) => ({
      default: m.ContactCta,
    })),
  { ssr: false, loading: () => <div className="min-h-[10rem]" aria-hidden /> },
);

/** Client-only below-fold chunks — first paint stays hero + product grid. */
export function HomeBelowFold() {
  return (
    <>
      <HomePortfolioSection />
      <CatalogSection />
      <HowItWorks />
      <Testimonials />
      <ClientsLogos />
      <StatsStory />
      <BlogPreview />
      <ServicesStrip />
      <ContactCta />
    </>
  );
}
