import { DEMO_BLOG, type BlogPost } from "@/lib/cms/blog-demo";
import {
  DEMO_PORTFOLIO,
  normalizePortfolioItem,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";
import { readCmsCollection } from "@/lib/cms/cms-server";
import { publishedBlog, publishedPortfolio } from "@/lib/cms/public-content";

/** Server-side: CMS collection or seed fallback */
export async function loadBlogPosts(): Promise<BlogPost[]> {
  const items = await readCmsCollection<BlogPost>("blog");
  if (items && items.length > 0) return items;
  return DEMO_BLOG;
}

export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await readCmsCollection<PortfolioItem>("portfolio");
  if (items && items.length > 0) return items.map(normalizePortfolioItem);
  return DEMO_PORTFOLIO;
}

export async function loadPublishedBlogSlugs(): Promise<{ slug: string }[]> {
  return publishedBlog(await loadBlogPosts()).map((p) => ({ slug: p.slug }));
}

export async function loadPublishedPortfolioSlugs(): Promise<
  { slug: string }[]
> {
  return publishedPortfolio(await loadPortfolioItems()).map((i) => ({
    slug: i.slug,
  }));
}
