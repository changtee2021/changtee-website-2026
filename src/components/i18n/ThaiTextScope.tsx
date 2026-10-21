"use client";

import { useContext, useMemo, type ReactNode } from "react";
import { ThaiPackContext } from "@/components/i18n/LocaleProvider";
import { registerThaiText, type ThaiTextPack } from "@/lib/i18n/content/thai-text";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Adds one page's Thai-keyed strings on top of the layout pack.
 * Wrap the content that calls `useTx` — a sibling cannot see this context.
 */
export function ThaiTextScope({
  locale,
  pack,
  children,
}: {
  locale: Locale;
  pack?: ThaiTextPack;
  children?: ReactNode;
}) {
  registerThaiText(locale, pack);
  const parent = useContext(ThaiPackContext);
  const next = useMemo(
    () => (pack ? [...parent, pack] : parent),
    [parent, pack],
  );
  if (!pack) return children ?? null;
  return <ThaiPackContext.Provider value={next}>{children}</ThaiPackContext.Provider>;
}
