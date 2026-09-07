"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  LOCALE_EVENT,
  LOCALE_STORAGE_KEY,
  applyLocale,
  getStoredLocale,
  resolveLocale,
  type Locale,
} from "@/lib/i18n/locale";
import { t, type MessageKey } from "@/lib/i18n/index";

function subscribe(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === LOCALE_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(LOCALE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOCALE_EVENT, onStoreChange);
  };
}

function getSnapshot(): Locale {
  return resolveLocale(getStoredLocale());
}

export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => "th" as Locale);

  const setLocale = useCallback((next: Locale) => {
    applyLocale(next);
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const translate = useCallback((key: MessageKey) => t(locale, key), [locale]);

  return { locale, setLocale, t: translate };
}
