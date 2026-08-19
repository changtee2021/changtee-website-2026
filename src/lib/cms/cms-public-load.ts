import { DEMO_BLOG, type BlogPost } from "@/lib/cms/blog-demo";
import {
  DEMO_PORTFOLIO,
  normalizePortfolioItem,
  type PortfolioItem,
} from "@/lib/cms/portfolio-demo";
import { readCmsCollection } from "@/lib/cms/cms-server";
import { readLocalCmsCollection } from "@/lib/cms/cms-local-store";
import { publishedBlog, publishedPortfolio } from "@/lib/cms/public-content";

async function loadCollection<T>(collection: "blog" | "portfolio") {
  const remote = await readCmsCollection<T>(collection);
  if (remote && remote.length > 0) return remote;
  const local = await readLocalCmsCollection<T>(collection);
  if (local && local.length > 0) return local;
  return null;
}

/** Server-side: CMS collection or seed fallback */
export async function loadBlogPosts(): Promise<BlogPost[]> {
  const items = await loadCollection<BlogPost>("blog");
  if (items && items.length > 0) return items;
  return DEMO_BLOG;
}

export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await loadCollection<PortfolioItem>("portfolio");
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
