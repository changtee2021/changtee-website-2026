import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  localizedHref,
  type Locale,
} from "@/lib/i18n/locale";
import { tx } from "@/lib/i18n/content/thai-text/server";
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

/**
 * Content that is fully translated for every locale (UI shell).
 * CMS-backed pages stay Thai (+ optional EN) until translated.
 */
export type TranslationScope = "ui" | "cms" | "product";

/** Locales that may be indexed / listed in hreflang for this content kind. */
export function indexableLocales(scope: TranslationScope = "ui"): Locale[] {
  if (scope === "ui") return [...LOCALES];
  if (scope === "product") {
    // Product overlays land gradually; EN uses nameEn/summaries, TH is canonical.
    return ["th", "en"];
  }
  // CMS (blog / portfolio / learn): Thai only until per-locale content exists
  return ["th"];
}

export function hreflangLanguages(
  barePath: string,
  locales: Locale[],
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[LOCALE_META[locale].hreflang] = absoluteUrl(
      localizedHref(locale, barePath),
    );
  }
  // x-default → English (international fallback)
  if (locales.includes("en")) {
    languages["x-default"] = absoluteUrl(localizedHref("en", barePath));
  } else if (locales.includes(DEFAULT_LOCALE)) {
    languages["x-default"] = absoluteUrl(localizedHref(DEFAULT_LOCALE, barePath));
  }
  return languages;
}

type PageMetaInput = {
  title: string;
  description: string;
  /** Thai-canonical path without locale prefix, e.g. `/products/outdoor-factory`. */
  path: string;
  image?: string | null;
  type?: "website" | "article";
  robots?: Metadata["robots"];
  keywords?: string | string[];
  locale?: Locale;
  /** Defaults to `ui`. Use `cms` / `product` to limit hreflang + indexing. */
  translationScope?: TranslationScope;
  /** Overrides `translationScope` when the page knows exactly which locales exist. */
  indexable?: Locale[];
};

/** Shared title/description/canonical/OG/Twitter for public pages. */
export function pageMetadata({
  title: thaiTitle,
  description: thaiDescription,
  path,
  image,
  type = "website",
  robots,
  keywords,
  locale = DEFAULT_LOCALE,
  translationScope = "ui",
  indexable,
}: PageMetaInput): Metadata {
  const title = tx(locale, thaiTitle);
  const description = tx(locale, thaiDescription);
  const bare = canonicalPath(path);
  const localizedPath = localizedHref(locale, bare);
  const canonical = canonicalPath(localizedPath);
  const ogImage = image?.trim() || defaultOgImagePath();
  const url = absoluteUrl(canonical === "/" ? "/" : canonical);
  const isDefaultOg =
    ogImage === defaultOgImagePath() || ogImage.endsWith(defaultOgImagePath());
  const ogImageEntry = isDefaultOg
    ? {
        url: ogImage,
        alt: title,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
      }
    : { url: ogImage, alt: title };

  const allowed = indexable ?? indexableLocales(translationScope);
  const isIndexable = allowed.includes(locale);
  const languages = isIndexable
    ? hreflangLanguages(bare, allowed)
    : undefined;

  const resolvedRobots: Metadata["robots"] =
    robots ??
    (isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: true });

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title,
      description,
      url,
      type,
      locale: LOCALE_META[locale].ogLocale,
      siteName: siteConfig.name,
      images: [ogImageEntry],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: resolvedRobots,
  };
}
