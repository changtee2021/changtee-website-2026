import type { MetadataRoute } from "next";
import { productCatalog } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/products",
    "/portfolio",
    "/sale-gallery",
    "/blog",
    "/estimate",
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

  return [...staticRoutes, ...productRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/products") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/quote" || path === "/estimate" ? 0.9 : 0.7,
  }));
}
