"use client";

import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";
import { useCmsText } from "@/lib/i18n/use-cms-text";

export function HomePortfolioSection() {
  const { values, enabled } = useSectionValues(
    "home",
    "portfolio",
    HOME_SECTION_DEFAULTS.portfolio,
  );
  const { field } = useCmsText("portfolio", values);
  if (!enabled) return null;
  return (
    <PortfolioPreview
      title={
        <EditableSpot sectionId="portfolio" fieldKey="title" label="หัวข้อ">
          <>{field("title")}</>
        </EditableSpot>
      }
      subtitle={field("subtitle")}
    />
  );
}
