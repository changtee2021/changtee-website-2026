"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeSectionsVisualPreview } from "@/components/admin/cms/HomeSectionsVisualPreview";
import { SectionDraftProvider } from "@/components/admin/cms/section-draft-context";
import { VisualSectionEditorShell } from "@/components/admin/cms/VisualSectionEditorShell";
import { ensurePageSections } from "@/lib/cms/demo-store";
import {
  HOME_SECTION_DEFAULTS,
  HOME_SECTION_DEFS,
  seedHomeSectionRecords,
} from "@/lib/cms/page-sections";
import { adminBaseFromPathname, adminHref } from "@/lib/admin-nav";

export function HomeSectionsCmsBoard() {
  const pathname = usePathname() || "";
  const basePath = adminBaseFromPathname(pathname);

  useEffect(() => {
    ensurePageSections(seedHomeSectionRecords());
  }, []);

  return (
    <SectionDraftProvider
      key="home"
      pageKey="home"
      defs={HOME_SECTION_DEFS}
      defaults={HOME_SECTION_DEFAULTS}
    >
      <VisualSectionEditorShell
        title="หน้าแรก — แก้จากพรีวิว"
        description="พรีวิวเหมือนหน้าแรกจริงทั้งหน้า — จุดที่มีกรอบแก้ได้ / จุดล็อกแก้จากเมนูอื่น · ยืนยันจุดนี้ก่อน แล้วค่อยยืนยันทั้งหน้า"
        uploadFolder="home-sections"
        toolbar={
          <Link
            href={adminHref(basePath, "/cms/hero-slides")}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
          >
            สไลด์หน้าแรก →
          </Link>
        }
      >
        <HomeSectionsVisualPreview />
      </VisualSectionEditorShell>
    </SectionDraftProvider>
  );
}
