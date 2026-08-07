"use client";

import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { CONTACT_SECTION_DEFAULTS } from "@/lib/cms/page-sections/templates";

export function ContactHeaderCms() {
  const { values, enabled } = useSectionValues(
    "contact",
    "header",
    CONTACT_SECTION_DEFAULTS.header,
  );
  if (!enabled) return null;

  return (
    <>
      <EditableSpot sectionId="header" fieldKey="title">
        <h1 className="font-display text-3xl font-semibold text-navy">
          {values.title}
        </h1>
      </EditableSpot>
      <EditableSpot sectionId="header" fieldKey="subtitle">
        <p className="mt-2 text-muted">{values.subtitle}</p>
      </EditableSpot>
    </>
  );
}
