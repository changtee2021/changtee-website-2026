import type { Locale } from "@/lib/i18n/locale";
import type { ThaiTextPack } from "./index";
import * as productKeys from "./products/keys";
import { TEXT as PRODUCTS_EN } from "./products/en";
import { TEXT as PRODUCTS_KM } from "./products/km";
import { TEXT as PRODUCTS_LO } from "./products/lo";
import { TEXT as PRODUCTS_MY } from "./products/my";
import { TEXT as PRODUCTS_ZH_HANS } from "./products/zh-Hans";
import { TEXT as PRODUCTS_ZH_HANT } from "./products/zh-Hant";
import * as blogKeys from "./blog/keys";
import { TEXT as BLOG_EN } from "./blog/en";
import { TEXT as BLOG_KM } from "./blog/km";
import { TEXT as BLOG_LO } from "./blog/lo";
import { TEXT as BLOG_MY } from "./blog/my";
import { TEXT as BLOG_ZH_HANS } from "./blog/zh-Hans";
import { TEXT as BLOG_ZH_HANT } from "./blog/zh-Hant";

/**
 * Page-scoped Thai-keyed packs (server components only). Each page passes just its own
 * strings to `ThaiTextScope`, so the shared client bundle does not grow with every product.
 */
type Section = {
  KEYS: string[];
  PAGES: Record<string, number[]>;
  text: Record<Exclude<Locale, "th">, string[]>;
};

const SECTIONS = {
  products: {
    ...productKeys,
    text: {
      en: PRODUCTS_EN,
      my: PRODUCTS_MY,
      lo: PRODUCTS_LO,
      km: PRODUCTS_KM,
      "zh-Hans": PRODUCTS_ZH_HANS,
      "zh-Hant": PRODUCTS_ZH_HANT,
    },
  },
  blog: {
    ...blogKeys,
    text: {
      en: BLOG_EN,
      my: BLOG_MY,
      lo: BLOG_LO,
      km: BLOG_KM,
      "zh-Hans": BLOG_ZH_HANS,
      "zh-Hant": BLOG_ZH_HANT,
    },
  },
} satisfies Record<string, Section>;

export function sectionThaiText(
  section: keyof typeof SECTIONS,
  locale: Locale,
  pageId: string,
): ThaiTextPack | undefined {
  if (locale === "th") return undefined;
  const { KEYS, PAGES, text } = SECTIONS[section];
  const indexes = PAGES[pageId];
  if (!indexes) return undefined;
  const values = text[locale];
  const pack: ThaiTextPack = {};
  for (const i of indexes) {
    if (values[i]) pack[KEYS[i]] = values[i];
  }
  return Object.keys(pack).length ? pack : undefined;
}
