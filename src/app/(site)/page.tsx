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
import { getLocalBusinessJsonLd } from "@/lib/local-business-jsonld";

/**
 * Home reads published CMS content on the server (ISR), like /portfolio.
 * Saving in /admin also calls revalidatePath("/"), so edits show right away;
 * the timer below is the safety net for changes made outside the admin UI.
 */
export const revalidate = 120;

export default async function HomePage() {
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
        <JsonLd data={getLocalBusinessJsonLd()} />
        {/* Wrapper scopes the sticky hero: it stays pinned while the product sheet slides over it, then releases. */}
        <div className="relative">
          <Hero pinned />
          <ProductGrid />
        </div>
        <HomeBelowFold />
        <HomeFaq />
      </div>
    </CmsServerHydrator>
  );
}
