import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

/** Absolute site origin without trailing slash. */
export function siteOrigin(): string {
  return siteConfig.url.replace(/\/$/, "");
}

/** Path for Open Graph / Twitter when a page has no own image. */
export function defaultOgImagePath(): string {
  return siteConfig.ogImage;
}

export function absoluteUrl(path = "/"): string {
  const origin = siteOrigin();
  if (!path || path === "/") return `${origin}/`;
  return path.startsWith("http")
    ? path
    : `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Relative canonical path (Next resolves via metadataBase). */
export function canonicalPath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  robots?: Metadata["robots"];
  keywords?: string | string[];
};

/** Shared title/description/canonical/OG/Twitter for public pages. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  robots,
  keywords,
}: PageMetaInput): Metadata {
  const canonical = canonicalPath(path);
  const ogImage = image?.trim() || defaultOgImagePath();
  const url = absoluteUrl(canonical === "/" ? "/" : canonical);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url,
      type,
      locale: "th_TH",
      siteName: siteConfig.name,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots,
  };
}
