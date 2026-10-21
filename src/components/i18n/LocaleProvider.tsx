"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  applyLocale,
  localizedHref,
  type Locale,
} from "@/lib/i18n/locale";
import { registerThaiText, type ThaiTextPack } from "@/lib/i18n/content/thai-text";
import { t as translate, type MessageKey } from "@/lib/i18n/index";

/** Packs for the active locale, outermost first. Nested scopes append. */
export const ThaiPackContext = createContext<readonly ThaiTextPack[]>([]);

type LocaleContextValue = {
  locale: Locale;
  t: (key: MessageKey) => string;
  href: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  thaiText,
  children,
}: {
  locale: Locale;
  /** Active locale's Thai-keyed pack. `useTx` reads it from context so SSR HTML is translated. */
  thaiText?: ThaiTextPack;
  children: ReactNode;
}) {
  registerThaiText(locale, thaiText);
  const packs = useMemo(
    () => (thaiText ? [thaiText] : []),
    [thaiText],
  );

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  const t = useCallback((key: MessageKey) => translate(locale, key), [locale]);
  const href = useCallback(
    (path: string) => localizedHref(locale, path),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, t, href }),
    [locale, t, href],
  );

  return (
    <LocaleContext.Provider value={value}>
      <ThaiPackContext.Provider value={packs}>{children}</ThaiPackContext.Provider>
    </LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocaleContext must be used within LocaleProvider");
  }
  return ctx;
}

/** Safe for components that may render outside the provider (falls back to Thai). */
export function useOptionalLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx) return ctx;
  return {
    locale: "th",
    t: (key) => translate("th", key),
    href: (path) => localizedHref("th", path),
  };
}
