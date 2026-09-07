"use client";

import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";
import { HOME_SECTION_DEFAULTS_EN } from "@/lib/i18n/cms-en";
import { localizedCms } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/use-i18n";

export function useCmsText(
  sectionId: string,
  values: Record<string, string>,
) {
  const { locale } = useI18n();
  const thai = HOME_SECTION_DEFAULTS[sectionId] ?? {};
  const english = HOME_SECTION_DEFAULTS_EN[sectionId] ?? {};

  function field(key: string) {
    return localizedCms(locale, values[key], thai[key], english[key]);
  }

  return { field, locale };
}
