import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

/** Absolute site origin without trailing slash. */
export function siteOrigin(): string {
  return siteConfig.url.replace(/\/$/, "");
}

/** Default share image dimensions (public/images/generated/ct-hero-living.webp). */
export const DEFAULT_OG_IMAGE_WIDTH = 1536;
export const DEFAULT_OG_IMAGE_HEIGHT = 1024;

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
  const isDefaultOg = ogImage === defaultOgImagePath() || ogImage.endsWith(defaultOgImagePath());
  const ogImageEntry = isDefaultOg
    ? {
        url: ogImage,
        alt: title,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
      }
    : { url: ogImage, alt: title };

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
      images: [ogImageEntry],
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
