import type { Locale } from "@/lib/i18n/locale";
import { THAI_TEXT_EN } from "./en";
import { THAI_TEXT_KM } from "./km";
import { THAI_TEXT_LO } from "./lo";
import { THAI_TEXT_MY } from "./my";
import { THAI_TEXT_ZH_HANS } from "./zh-Hans";
import { THAI_TEXT_ZH_HANT } from "./zh-Hant";
import { registerThaiText, type ThaiTextPack } from "./index";

/** Server components only — importing this from a client component ships every locale. */
const PACKS: Record<Exclude<Locale, "th">, ThaiTextPack> = {
  en: THAI_TEXT_EN,
  my: THAI_TEXT_MY,
  lo: THAI_TEXT_LO,
  km: THAI_TEXT_KM,
  "zh-Hans": THAI_TEXT_ZH_HANS,
  "zh-Hant": THAI_TEXT_ZH_HANT,
};

for (const [locale, pack] of Object.entries(PACKS)) {
  registerThaiText(locale as Locale, pack);
}

export function thaiTextPack(locale: Locale): ThaiTextPack | undefined {
  return locale === "th" ? undefined : PACKS[locale];
}

export { findThaiText, tx, txf } from "./index";
