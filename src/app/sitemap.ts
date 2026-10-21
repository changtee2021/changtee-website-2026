import type { MetadataRoute } from "next";
import { DEMO_BLOG } from "@/lib/cms/blog-demo";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";
import { publishedBlog, publishedPortfolio } from "@/lib/cms/public-content";
import { readCmsCollection } from "@/lib/cms/cms-server";
import { LEARN_ENABLED, LEARN_SHEETS } from "@/lib/learn";
import { productCatalog } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";
import { localizedHref, type Locale } from "@/lib/i18n/locale";
import { productIndexableLocales } from "@/lib/i18n/content/product-overlays";
import { hreflangLanguages, indexableLocales } from "@/lib/seo/meta";
import { blogIndexableLocales } from "@/lib/i18n/content/thai-text/sections.server";
import { areaPath, serviceAreas } from "@/lib/service-areas";
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

/** One sitemap URL per indexable locale, each carrying the full hreflang set. */
function entry(
  base: string,
  path: string,
  opts: {
    lastModified?: string | Date | null;
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
    locales?: Locale[];
  },
): SitemapEntry[] {
  const lastModified = opts.lastModified
    ? new Date(opts.lastModified)
    : undefined;
  const locales = opts.locales ?? indexableLocales("ui");
  const bare = path || "/";
  const languages = locales.length > 1 ? hreflangLanguages(bare, locales) : null;
  return locales.map((locale) => {
    const localized = localizedHref(locale, bare);
    return {
      url: localized === "/" ? base : `${base}${localized}`,
      ...(lastModified && !Number.isNaN(lastModified.getTime())
        ? { lastModified }
        : {}),
      changeFrequency: opts.changeFrequency,
      priority: opts.priority,
      ...(languages ? { alternates: { languages } } : {}),
    };
  });
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
    ...(LEARN_ENABLED
      ? [{ path: "/learn", changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    { path: "/quote", changeFrequency: "monthly", priority: 0.9 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/visit-factory", changeFrequency: "monthly", priority: 0.6 },
    { path: "/careers", changeFrequency: "weekly", priority: 0.6 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  const productRoutes = productCatalog.flatMap((cat) => [
    ...entry(base, `/products/${cat.slug}`, {
      changeFrequency: "weekly",
      priority: 0.8,
    }),
    ...cat.children.flatMap((child) =>
      entry(base, `/products/${cat.slug}/${child.slug}`, {
        changeFrequency: "weekly",
        priority: 0.8,
        locales: productIndexableLocales(cat.slug, child.slug),
      }),
    ),
  ]);
  const cmsLocales = indexableLocales("cms");

  const [remotePortfolio, remoteBlog] = await Promise.all([
    readCmsWithinTimeout<PortfolioItem>("portfolio"),
    readCmsWithinTimeout<BlogPost>("blog"),
  ]);
  const portfolioItems = publishedPortfolio(remotePortfolio ?? DEMO_PORTFOLIO);
  const blogItems = publishedBlog(remoteBlog ?? DEMO_BLOG);

  return [
    ...staticRoutes.flatMap((r) =>
      entry(base, r.path, {
        changeFrequency: r.changeFrequency,
        priority: r.priority,
      }),
    ),
    ...(LEARN_ENABLED ? LEARN_SHEETS : []).flatMap((sheet) =>
      entry(base, `/learn/${sheet.slug}`, {
        changeFrequency: "monthly",
        priority: 0.7,
        locales: cmsLocales,
      }),
    ),
    ...productRoutes,
    ...portfolioItems.flatMap((item) =>
      entry(base, `/portfolio/${item.slug}`, {
        lastModified: item.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        locales: cmsLocales,
      }),
    ),
    ...blogItems.flatMap((post) =>
      entry(base, `/blog/${post.slug}`, {
        lastModified: post.updatedAt || post.publishedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        locales: blogIndexableLocales(post.slug),
      }),
    ),
    ...(serviceAreas(portfolioItems).length
      ? entry(base, "/areas", {
          changeFrequency: "weekly",
          priority: 0.6,
          locales: ["th"],
        })
      : []),
    ...serviceAreas(portfolioItems).flatMap((area) =>
      entry(base, areaPath(area.name), {
        changeFrequency: "weekly",
        priority: 0.6,
        locales: ["th"],
      }),
    ),
  ];
}
