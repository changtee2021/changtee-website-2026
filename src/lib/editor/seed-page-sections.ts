import { ensurePageSections } from "@/lib/cms/demo-store";
import {
  PRODUCT_PAGE_KEY,
  seedHomeSectionRecords,
  seedProductSectionRecords,
} from "@/lib/cms/page-sections";
import {
  seedAboutSectionRecords,
  seedBlogPostSectionRecords,
  seedContactSectionRecords,
  seedPortfolioItemSectionRecords,
} from "@/lib/cms/page-sections/templates";

/** Client-safe seed of missing section rows (does not overwrite existing). */
export function seedSectionsForPageKey(pageKey: string) {
  if (pageKey === "home") ensurePageSections(seedHomeSectionRecords());
  if (pageKey === PRODUCT_PAGE_KEY) {
    ensurePageSections(seedProductSectionRecords());
  }
  if (pageKey === "about") ensurePageSections(seedAboutSectionRecords());
  if (pageKey === "contact") ensurePageSections(seedContactSectionRecords());
  if (pageKey === "blogPost") ensurePageSections(seedBlogPostSectionRecords());
  if (pageKey === "portfolioItem") {
    ensurePageSections(seedPortfolioItemSectionRecords());
  }
}
