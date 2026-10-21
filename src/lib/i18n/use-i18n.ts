"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOptionalLocale } from "@/components/i18n/LocaleProvider";
import {
  localizedHref,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/index";

export function useI18n() {
  const { locale, t } = useOptionalLocale();
  const router = useRouter();
  const pathname = usePathname() || "/";

  const setLocale = useCallback(
    (next: Locale) => {
      const bare = stripLocalePrefix(pathname);
      router.push(localizedHref(next, bare));
    },
    [pathname, router],
  );

  const translate = useCallback(
    (key: MessageKey) => t(key),
    [t],
  );

  return { locale, setLocale, t: translate };
}
