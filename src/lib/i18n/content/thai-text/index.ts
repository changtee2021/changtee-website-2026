import type { Locale } from "@/lib/i18n/locale";

/**
 * Translations keyed by the exact Thai copy (CMS defaults, demo content, UI strings).
 * Content edited in admin to a new Thai string has no entry and renders as-is
 * until it is added to the packs.
 *
 * Packs are registered, not imported, so client bundles never carry all six locales:
 * the server registers everything via `./server`, and `LocaleProvider` registers the
 * active locale's pack that the `[lang]` layout passes down.
 */
const DICTS: Partial<Record<Locale, Record<string, string>>> = {};

export type ThaiTextPack = Record<string, string>;

export function registerThaiText(locale: Locale, pack: ThaiTextPack | undefined) {
  if (!pack || locale === "th") return;
  const current = DICTS[locale];
  if (current === pack) return;
  DICTS[locale] = current ? { ...current, ...pack } : pack;
}

/** Translation for `thai` in `locale`, or `undefined` when there is none. */
export function findThaiText(locale: Locale, thai: string): string | undefined {
  if (!thai || locale === "th") return undefined;
  return DICTS[locale]?.[thai];
}

/** Thai copy in the active locale; falls back to the Thai original. */
export function tx(locale: Locale, thai: string): string {
  return findThaiText(locale, thai) ?? thai;
}

/** `tx` plus `{name}` placeholder substitution. */
export function txf(
  locale: Locale,
  thai: string,
  vars: Record<string, string | number>,
): string {
  return tx(locale, thai).replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
