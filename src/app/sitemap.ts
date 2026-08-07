import type { MetadataRoute } from "next";
import { DEMO_BLOG } from "@/lib/cms/blog-demo";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";
import { publishedBlog, publishedPortfolio } from "@/lib/cms/public-content";
import { readCmsCollection } from "@/lib/cms/cms-server";
import { productCatalog } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";
import type { BlogPost } from "@/lib/cms/blog-demo";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/products",
    "/portfolio",
    "/blog",
    "/quote",
    "/about",
    "/contact",
    "/privacy",
    "/cookies",
    "/terms",
  ];

  const productRoutes = productCatalog.flatMap((cat) => [
    `/products/${cat.slug}`,
    ...cat.children.map((child) => `/products/${cat.slug}/${child.slug}`),
  ]);

  const remotePortfolio = await readCmsCollection<PortfolioItem>("portfolio");
  const remoteBlog = await readCmsCollection<BlogPost>("blog");
  const portfolioRoutes = publishedPortfolio(
    remotePortfolio ?? DEMO_PORTFOLIO,
  ).map((item) => `/portfolio/${item.slug}`);
  const blogRoutes = publishedBlog(remoteBlog ?? DEMO_BLOG).map(
    (post) => `/blog/${post.slug}`,
  );

  return [
    ...staticRoutes,
    ...productRoutes,
    ...portfolioRoutes,
    ...blogRoutes,
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/products")
      ? ("weekly" as const)
      : path.startsWith("/blog") || path.startsWith("/portfolio")
        ? ("weekly" as const)
        : ("monthly" as const),
    priority:
      path === ""
        ? 1
        : path === "/quote"
          ? 0.9
          : path.startsWith("/products/")
            ? 0.8
            : 0.7,
  }));
}
