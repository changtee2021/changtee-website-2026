import { localizedHref, type Locale } from "@/lib/i18n/locale";

/** Lead running number assigned by the database, e.g. Q69-0001. */
export const QUOTE_NO_PATTERN = /^Q\d{2}-\d{4,}$/;

export function isQuoteNo(value: unknown): value is string {
  return typeof value === "string" && QUOTE_NO_PATTERN.test(value);
}

export function thankYouHref(quoteNo?: string | null, locale: Locale = "th") {
  const path = isQuoteNo(quoteNo)
    ? `/thank-you?no=${encodeURIComponent(quoteNo)}`
    : "/thank-you";
  return localizedHref(locale, path);
}
