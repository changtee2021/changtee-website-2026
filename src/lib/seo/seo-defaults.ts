import { siteConfig } from "@/lib/site-config";
import {
  readSiteSetting,
  writeSiteSetting,
} from "@/lib/cms/cms-server";

export const SEO_DEFAULTS_KEY = "seo.defaults";

export type SeoDefaults = {
  defaultTitle: string;
  defaultDescription: string;
  ogImage: string;
};

export function builtInSeoDefaults(): SeoDefaults {
  return {
    defaultTitle: `${siteConfig.name} | ${siteConfig.tagline}`,
    defaultDescription: siteConfig.description,
    ogImage: siteConfig.ogImage,
  };
}

export function normalizeSeoDefaults(
  value: Partial<SeoDefaults> | null | undefined,
): SeoDefaults {
  const base = builtInSeoDefaults();
  return {
    defaultTitle: value?.defaultTitle?.trim() || base.defaultTitle,
    defaultDescription:
      value?.defaultDescription?.trim() || base.defaultDescription,
    ogImage: value?.ogImage?.trim() || base.ogImage,
  };
}

export async function loadSeoDefaults(): Promise<SeoDefaults> {
  const stored = await readSiteSetting<Partial<SeoDefaults>>(SEO_DEFAULTS_KEY);
  return normalizeSeoDefaults(stored);
}

export async function saveSeoDefaults(
  input: SeoDefaults,
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  return writeSiteSetting(SEO_DEFAULTS_KEY, normalizeSeoDefaults(input));
}
