import { CATEGORY_SUMMARY_EN, PILLAR_SUMMARY_EN } from "@/lib/i18n/cms-en";
import { messages, type MessageKey } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";

export type { Locale } from "@/lib/i18n/locale";
export type { MessageKey } from "@/lib/i18n/messages";

/** New UI copy must be added in both `th` and `en` in messages.ts. */
export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key] ?? messages.th[key];
}

/** Prefer English when the live value is still the Thai default. */
export function localizedCms(
  locale: Locale,
  current: string | undefined,
  thaiDefault: string | undefined,
  englishDefault: string | undefined,
): string {
  const value = current ?? "";
  if (locale === "en" && englishDefault && (!value || value === thaiDefault)) {
    return englishDefault;
  }
  return value || thaiDefault || englishDefault || "";
}

export function pickLocalized(
  locale: Locale,
  thai: string,
  english?: string | null,
): string {
  if (locale === "en" && english?.trim()) return english;
  return thai;
}

export function catalogName(
  locale: Locale,
  item: { name: string; nameEn?: string },
): string {
  return pickLocalized(locale, item.name, item.nameEn);
}

export function pillarSummary(
  locale: Locale,
  pillar: { id: number; summary: string },
): string {
  return pickLocalized(locale, pillar.summary, PILLAR_SUMMARY_EN[pillar.id]);
}

export function categorySummary(
  locale: Locale,
  category: { slug: string; summary: string },
): string {
  return pickLocalized(locale, category.summary, CATEGORY_SUMMARY_EN[category.slug]);
}
