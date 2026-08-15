"use client";

import dynamic from "next/dynamic";
import { SectionLoader } from "@/components/ui/section-loader";

const HomePortfolioSection = dynamic(
  () =>
    import("@/components/home/HomePortfolioSection").then((m) => ({
      default: m.HomePortfolioSection,
    })),
  { ssr: false, loading: () => <SectionLoader /> },
);
const HomeInstallVideosSection = dynamic(
  () =>
    import("@/components/home/HomeInstallVideosSection").then((m) => ({
      default: m.HomeInstallVideosSection,
    })),
  { ssr: false, loading: () => <SectionLoader /> },
);
const StatsStory = dynamic(
  () =>
    import("@/components/home/StatsStory").then((m) => ({
      default: m.StatsStory,
    })),
  { ssr: false, loading: () => <SectionLoader /> },
);
const Testimonials = dynamic(
  () =>
    import("@/components/home/Testimonials").then((m) => ({
      default: m.Testimonials,
    })),
  { ssr: false, loading: () => <SectionLoader /> },
);
const CatalogSection = dynamic(
  () =>
    import("@/components/home/CatalogSection").then((m) => ({
      default: m.CatalogSection,
    })),
  { ssr: false, loading: () => <SectionLoader /> },
);
const LearnTeaser = dynamic(
  () =>
    import("@/components/learn/LearnTeaser").then((m) => ({
      default: m.LearnTeaser,
    })),
  { ssr: false, loading: () => <SectionLoader /> },
);
const BlogPreview = dynamic(
  () =>
    import("@/components/home/BlogPreview").then((m) => ({
      default: m.BlogPreview,
    })),
  { ssr: false, loading: () => <SectionLoader /> },
);
const ContactCta = dynamic(
  () =>
    import("@/components/home/ContactCta").then((m) => ({
      default: m.ContactCta,
    })),
  { ssr: false, loading: () => <SectionLoader /> },
);

/**
 * Client-only below-fold chunks — first paint stays hero + product grid.
 *
 * Order: products (above) → portfolio → videos → story (incl. logos) →
 * reviews → catalog → learn → blog → final CTA.
 */
export function HomeBelowFold() {
  return (
    <>
      <HomePortfolioSection />
      <HomeInstallVideosSection />
      <StatsStory />
      <Testimonials />
      <CatalogSection />
      <LearnTeaser />
      <BlogPreview />
      <ContactCta />
    </>
  );
}
