import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/home/ProductGrid";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";
import { HomeFaq } from "@/components/home/HomeFaq";
import { CmsServerHydrator } from "@/components/cms/CmsServerHydrator";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadPublicCollection } from "@/lib/cms/cms-public-load";
import type { CatalogItem } from "@/lib/cms/catalogs-demo";
import type { HeroSlide } from "@/lib/cms/hero-slides-demo";
import type { PageSectionRecord } from "@/lib/cms/page-sections";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import type { Metadata } from "next";
import { langFromParams } from "@/lib/i18n/lang-param";
import { localizedHref } from "@/lib/i18n/locale";
import { getLocalBusinessJsonLd } from "@/lib/local-business-jsonld";
import { hreflangLanguages, indexableLocales } from "@/lib/seo/meta";

/** Each locale home owns its canonical and hreflang. The root layout must not pin every page to `/`. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return {
    alternates: {
      canonical: localizedHref(locale, "/"),
      languages: hreflangLanguages("/", indexableLocales("ui")),
    },
  };
}

/**
 * Home reads published CMS content on the server (ISR), like /portfolio.
 * Saving in /admin also calls revalidatePath("/"), so edits show right away;
 * the timer below is the safety net for changes made outside the admin UI.
 */
export const revalidate = 120;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = await langFromParams(params);
  const [portfolio, heroSlides, catalogs, pageSections] = await Promise.all([
    loadPublicCollection<PortfolioItem>("portfolio"),
    loadPublicCollection<HeroSlide>("hero-slides"),
    loadPublicCollection<CatalogItem>("catalogs"),
    loadPublicCollection<PageSectionRecord>("page-sections"),
  ]);

  return (
    <CmsServerHydrator
      data={{ portfolio, heroSlides, catalogs, pageSections }}
    >
      <div className="bg-shell pb-3 sm:pb-4">
        <JsonLd data={getLocalBusinessJsonLd(locale)} />
        {/* Wrapper scopes the sticky hero: it stays pinned while the product sheet slides over it, then releases. */}
        <div className="relative">
          <Hero pinned />
          <ProductGrid />
        </div>
        <HomeBelowFold />
        <HomeFaq locale={locale} />
      </div>
    </CmsServerHydrator>
  );
}
