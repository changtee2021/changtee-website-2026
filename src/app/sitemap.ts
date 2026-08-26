import type { MetadataRoute } from "next";
import { DEMO_BLOG } from "@/lib/cms/blog-demo";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";
import { publishedBlog, publishedPortfolio } from "@/lib/cms/public-content";
import { readCmsCollection } from "@/lib/cms/cms-server";
import { LEARN_SHEETS } from "@/lib/learn";
import { productCatalog } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";
import type { BlogPost } from "@/lib/cms/blog-demo";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";

type SitemapEntry = MetadataRoute.Sitemap[number];

/** Serve cached XML and refresh in the background — crawlers must never wait on the CMS. */
export const revalidate = 600;

const CMS_READ_TIMEOUT_MS = 3000;

/**
 * A hanging CMS read runs the route to its function timeout, which crawlers see
 * as a 5xx sitemap. Give up early and fall back to the seed content instead.
 */
async function readCmsWithinTimeout<T>(
  collection: "portfolio" | "blog",
): Promise<T[] | null> {
  return Promise.race([
    readCmsCollection<T>(collection).catch((err) => {
      console.error("sitemap: CMS read failed, using seed fallback", {
        collection,
        err,
      });
      return null;
    }),
    new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), CMS_READ_TIMEOUT_MS),
    ),
  ]);
}

function entry(
  base: string,
  path: string,
  opts: {
    lastModified?: string | Date | null;
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
  },
): SitemapEntry {
  const lastModified = opts.lastModified
    ? new Date(opts.lastModified)
    : undefined;
  return {
    url: `${base}${path}`,
    ...(lastModified && !Number.isNaN(lastModified.getTime())
      ? { lastModified }
      : {}),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticRoutes: Array<{
    path: string;
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "monthly", priority: 1 },
    { path: "/products", changeFrequency: "weekly", priority: 0.8 },
    { path: "/portfolio", changeFrequency: "weekly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { path: "/learn", changeFrequency: "weekly", priority: 0.8 },
    { path: "/quote", changeFrequency: "monthly", priority: 0.9 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/visit-factory", changeFrequency: "monthly", priority: 0.6 },
    { path: "/careers", changeFrequency: "weekly", priority: 0.6 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes = productCatalog.flatMap((cat) => [
    entry(base, `/products/${cat.slug}`, {
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    ...cat.children.map((child) =>
      entry(base, `/products/${cat.slug}/${child.slug}`, {
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
  ]);

  const [remotePortfolio, remoteBlog] = await Promise.all([
    readCmsWithinTimeout<PortfolioItem>("portfolio"),
    readCmsWithinTimeout<BlogPost>("blog"),
  ]);
  const portfolioItems = publishedPortfolio(remotePortfolio ?? DEMO_PORTFOLIO);
  const blogItems = publishedBlog(remoteBlog ?? DEMO_BLOG);

  return [
    ...staticRoutes.map((r) =>
      entry(base, r.path, {
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      }),
    ),
    ...LEARN_SHEETS.map((sheet) =>
      entry(base, `/learn/${sheet.slug}`, {
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
    ...productRoutes,
    ...portfolioItems.map((item) =>
      entry(base, `/portfolio/${item.slug}`, {
        lastModified: item.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
    ...blogItems.map((post) =>
      entry(base, `/blog/${post.slug}`, {
        lastModified: post.updatedAt || post.publishedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
  ];
}
