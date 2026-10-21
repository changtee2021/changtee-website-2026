"use client";

import { useCallback, useContext } from "react";
import { ThaiPackContext, useOptionalLocale } from "@/components/i18n/LocaleProvider";
import { findThaiText } from "@/lib/i18n/content/thai-text";

/**
 * Client hook for Thai-keyed copy.
 * Reads the pack from React context (the prop the server passed in) so the
 * first HTML matches the active locale. Module `tx()` is only a fallback —
 * Next can SSR a child client component with a different module copy.
 */
export function useTx() {
  const { locale } = useOptionalLocale();
  const packs = useContext(ThaiPackContext);
  const find = useCallback(
    (thai: string) => {
      if (!thai || locale === "th") return undefined;
      for (let i = packs.length - 1; i >= 0; i--) {
        const hit = packs[i]?.[thai];
        if (hit) return hit;
      }
      return findThaiText(locale, thai);
    },
    [locale, packs],
  );
  const translate = useCallback((thai: string) => find(thai) ?? thai, [find]);
  const format = useCallback(
    (thai: string, vars: Record<string, string | number>) =>
      translate(thai).replace(/\{(\w+)\}/g, (match, key: string) =>
        key in vars ? String(vars[key]) : match,
      ),
    [translate],
  );
  return { tx: translate, txf: format, find, locale };
}
