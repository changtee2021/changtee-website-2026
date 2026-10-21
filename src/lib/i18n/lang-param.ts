import { notFound } from "next/navigation";
import {
  isLocale,
  localeFromPrefix,
  LOCALES,
  type Locale,
} from "@/lib/i18n/locale";

/** Params for `app/[lang]/…` routes. */
export type LangParams = { lang: string };

export function generateLangStaticParams(): LangParams[] {
  return LOCALES.map((lang) => ({ lang: localeToParam(lang) }));
}

/** Locale id → URL segment (`zh-Hans` → `zh-hans`). */
export function localeToParam(locale: Locale): string {
  if (locale === "zh-Hans") return "zh-hans";
  if (locale === "zh-Hant") return "zh-hant";
  return locale;
}

/** URL segment → Locale (`zh-hans` → `zh-Hans`, `th` → `th`). */
export function resolveLangParam(lang: string | undefined | null): Locale {
  if (!lang) notFound();
  if (isLocale(lang)) return lang;
  const fromPrefix = localeFromPrefix(lang);
  if (fromPrefix) return fromPrefix;
  notFound();
}

export async function langFromParams(
  params: Promise<LangParams> | LangParams,
): Promise<Locale> {
  const { lang } = await params;
  return resolveLangParam(lang);
}
