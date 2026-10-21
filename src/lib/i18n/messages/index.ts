import type { Locale } from "@/lib/i18n/locale";
import { th } from "./th";
import { en } from "./en";
import { my } from "./my";
import { lo } from "./lo";
import { km } from "./km";
import { zhHans } from "./zh-Hans";
import { zhHant } from "./zh-Hant";

export { th, en, my, lo, km, zhHans, zhHant };

export const messages = {
  th,
  en,
  my,
  lo,
  km,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
} as const satisfies Record<Locale, { [K in keyof typeof th]: string }>;

export type MessageKey = keyof typeof th;
