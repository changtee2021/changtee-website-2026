import { CATEGORY_SUMMARY_EN, PILLAR_SUMMARY_EN } from "@/lib/i18n/cms-en";
import { findThaiText } from "@/lib/i18n/content/thai-text";
import {
  DEFAULT_LOCALE,
  MESSAGE_FALLBACK_LOCALE,
  type Locale,
} from "@/lib/i18n/locale";
import { messages, type MessageKey } from "@/lib/i18n/messages/index";

export type { Locale } from "@/lib/i18n/locale";
export type { MessageKey } from "@/lib/i18n/messages/index";
export {
  LOCALES,
  LOCALE_META,
  localizedHref,
  stripLocalePrefix,
  splitLocalePath,
  isLocale,
  localeFromPrefix,
} from "@/lib/i18n/locale";

/** Resolve UI copy for a locale (active → English → Thai). */
export function t(locale: Locale, key: MessageKey): string {
  return (
    messages[locale]?.[key] ??
    messages[MESSAGE_FALLBACK_LOCALE][key] ??
    messages[DEFAULT_LOCALE][key] ??
    key
  );
}

/**
 * CMS field in the active locale. Thai copy is looked up in the Thai-keyed packs;
 * an untouched Thai default falls back to its English default.
 */
export function localizedCms(
  locale: Locale,
  current: string | undefined,
  thaiDefault: string | undefined,
  englishDefault: string | undefined,
): string {
  const value = current ?? "";
  const source = value || thaiDefault || "";
  if (locale === "th") return source || englishDefault || "";
  const isDefault = !value || value === thaiDefault;
  if (locale === "en" && englishDefault && isDefault) return englishDefault;
  const translated = findThaiText(locale, source);
  if (translated) return translated;
  if (englishDefault && isDefault) return englishDefault;
  return source || englishDefault || "";
}

export function pickLocalized(
  locale: Locale,
  thai: string,
  english?: string | null,
  find?: (thai: string) => string | undefined,
): string {
  const lookup = (value: string) =>
    find ? find(value) : findThaiText(locale, value);
  if (locale === "th") return thai;
  if (locale !== "en") {
    const translated = lookup(thai);
    if (translated) return translated;
  }
  if (english?.trim()) return english;
  return lookup(thai) ?? thai;
}

export function catalogName(
  locale: Locale,
  item: { name: string; nameEn?: string },
  find?: (thai: string) => string | undefined,
): string {
  return pickLocalized(locale, item.name, item.nameEn, find);
}

export function pillarSummary(
  locale: Locale,
  pillar: { id: number; summary: string },
  find?: (thai: string) => string | undefined,
): string {
  return pickLocalized(locale, pillar.summary, PILLAR_SUMMARY_EN[pillar.id], find);
}

export function categorySummary(
  locale: Locale,
  category: { slug: string; summary: string },
  find?: (thai: string) => string | undefined,
): string {
  return pickLocalized(locale, category.summary, CATEGORY_SUMMARY_EN[category.slug], find);
}
