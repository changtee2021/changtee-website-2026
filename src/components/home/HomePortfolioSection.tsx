"use client";

import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";

export function HomePortfolioSection() {
  const { values, enabled } = useSectionValues(
    "home",
    "portfolio",
    HOME_SECTION_DEFAULTS.portfolio,
  );
  if (!enabled) return null;
  return <PortfolioPreview title={values.title} subtitle={values.subtitle} />;
}
