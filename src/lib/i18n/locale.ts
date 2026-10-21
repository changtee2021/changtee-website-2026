/**
 * Public-site locales. URL prefixes are lowercase; BCP-47 codes for Chinese
 * use the canonical casing (`zh-Hans` / `zh-Hant`).
 */
export const LOCALE_STORAGE_KEY = "changtee.lang";
export const LOCALE_COOKIE = "changtee.lang";
export const LOCALE_EVENT = "changtee-locale";
export const LOCALES = [
  "th",
  "en",
  "my",
  "lo",
  "km",
  "zh-Hans",
  "zh-Hant",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "th";

/** Fallback when a message key is missing in the active locale. */
export const MESSAGE_FALLBACK_LOCALE: Locale = "en";

export type LocaleMeta = {
  /** BCP-47 / app locale id */
  id: Locale;
  /** Path prefix without leading slash. Empty for Thai (canonical URLs stay unprefixed). */
  prefix: string;
  /** hreflang value for <link rel="alternate"> */
  hreflang: string;
  /** Open Graph locale */
  ogLocale: string;
  /** Native label for the language switcher */
  nativeLabel: string;
  /** Short label (header chip) */
  shortLabel: string;
  /** HTML lang attribute */
  htmlLang: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  th: {
    id: "th",
    prefix: "",
    hreflang: "th",
    ogLocale: "th_TH",
    nativeLabel: "ไทย",
    shortLabel: "TH",
    htmlLang: "th",
  },
  en: {
    id: "en",
    prefix: "en",
    hreflang: "en",
    ogLocale: "en_US",
    nativeLabel: "English",
    shortLabel: "EN",
    htmlLang: "en",
  },
  my: {
    id: "my",
    prefix: "my",
    hreflang: "my",
    ogLocale: "my_MM",
    nativeLabel: "မြန်မာ",
    shortLabel: "MY",
    htmlLang: "my",
  },
  lo: {
    id: "lo",
    prefix: "lo",
    hreflang: "lo",
    ogLocale: "lo_LA",
    nativeLabel: "ລາວ",
    shortLabel: "LO",
    htmlLang: "lo",
  },
  km: {
    id: "km",
    prefix: "km",
    hreflang: "km",
    ogLocale: "km_KH",
    nativeLabel: "ខ្មែរ",
    shortLabel: "KM",
    htmlLang: "km",
  },
  "zh-Hans": {
    id: "zh-Hans",
    prefix: "zh-hans",
    hreflang: "zh-Hans",
    ogLocale: "zh_CN",
    nativeLabel: "简体中文",
    shortLabel: "简",
    htmlLang: "zh-Hans",
  },
  "zh-Hant": {
    id: "zh-Hant",
    prefix: "zh-hant",
    hreflang: "zh-Hant",
    ogLocale: "zh_TW",
    nativeLabel: "繁體中文",
    shortLabel: "繁",
    htmlLang: "zh-Hant",
  },
};

/** URL prefixes that carry a non-default locale (excludes Thai). */
export const LOCALE_PREFIXES = LOCALES.map((l) => LOCALE_META[l].prefix).filter(
  Boolean,
) as string[];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Map a URL segment (`zh-hans`) to a Locale (`zh-Hans`). */
export function localeFromPrefix(prefix: string | null | undefined): Locale | null {
  if (!prefix) return null;
  const lower = prefix.toLowerCase();
  for (const id of LOCALES) {
    if (LOCALE_META[id].prefix === lower) return id;
  }
  return null;
}

/** Parse the first path segment; returns locale + remaining pathname. */
export function splitLocalePath(pathname: string): {
  locale: Locale | null;
  pathnameWithoutLocale: string;
} {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { locale: null, pathnameWithoutLocale: "/" };
  }
  const maybe = localeFromPrefix(segments[0]);
  if (!maybe) {
    return { locale: null, pathnameWithoutLocale: path };
  }
  const rest = "/" + segments.slice(1).join("/");
  return {
    locale: maybe,
    pathnameWithoutLocale: rest === "/" ? "/" : rest.replace(/\/$/, "") || "/",
  };
}

/**
 * Build a localized public href.
 * Thai stays unprefixed; others get `/{prefix}{path}`.
 * External URLs, mailto/tel, and hash-only links are returned unchanged.
 */
export function localizedHref(locale: Locale, path: string): string {
  if (!path) return localizedHref(locale, "/");
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("#") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  // Already locale-prefixed → leave as-is
  const { locale: existing } = splitLocalePath(path);
  if (existing) return path;

  const qIndex = path.indexOf("?");
  const hashIndex = path.indexOf("#");
  let pathname = path;
  let suffix = "";
  if (qIndex >= 0 || hashIndex >= 0) {
    const cut = Math.min(
      qIndex >= 0 ? qIndex : Infinity,
      hashIndex >= 0 ? hashIndex : Infinity,
    );
    pathname = path.slice(0, cut);
    suffix = path.slice(cut);
  }

  const normalized =
    !pathname || pathname === "/"
      ? "/"
      : pathname.startsWith("/")
        ? pathname
        : `/${pathname}`;
  const prefix = LOCALE_META[locale].prefix;
  if (!prefix) return `${normalized}${suffix}`;
  if (normalized === "/") return `/${prefix}${suffix}`;
  return `/${prefix}${normalized}${suffix}`;
}

/** Strip a locale prefix from a pathname (returns Thai-canonical path). */
export function stripLocalePrefix(pathname: string): string {
  return splitLocalePath(pathname).pathnameWithoutLocale;
}

export function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveLocale(stored: Locale | null): Locale {
  return stored ?? DEFAULT_LOCALE;
}

export function applyLocale(locale: Locale) {
  const root = document.documentElement;
  root.lang = LOCALE_META[locale].htmlLang;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* ignore */
  }
}

const PREFIX_TO_HTML_LANG = Object.fromEntries(
  LOCALES.filter((id) => LOCALE_META[id].prefix).map((id) => [
    LOCALE_META[id].prefix,
    LOCALE_META[id].htmlLang,
  ]),
);

/**
 * Inline script — sets <html lang> before paint from the URL prefix only.
 * The root layout stays static (`lang="th"`) so pages keep ISR; reading the
 * locale header there would force every page dynamic.
 */
export const localeInitScript = `(function(){try{var p=(location.pathname.split("/").filter(Boolean)[0]||"").toLowerCase();var m=${JSON.stringify(PREFIX_TO_HTML_LANG)};document.documentElement.lang=m[p]||"th"}catch(e){}})();`;
