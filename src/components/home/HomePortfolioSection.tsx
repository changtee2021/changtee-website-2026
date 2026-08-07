"use client";

import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";

export function HomePortfolioSection() {
  const { values, enabled } = useSectionValues(
    "home",
    "portfolio",
    HOME_SECTION_DEFAULTS.portfolio,
  );
  if (!enabled) return null;
  return (
    <PortfolioPreview
      title={
        <EditableSpot sectionId="portfolio" fieldKey="title" label="หัวข้อ">
          <>{values.title}</>
        </EditableSpot>
      }
      subtitle={
        <EditableSpot sectionId="portfolio" fieldKey="subtitle" label="คำโปรย">
          <>{values.subtitle}</>
        </EditableSpot>
      }
    />
  );
}
