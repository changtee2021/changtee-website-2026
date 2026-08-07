"use client";

import type { ReactNode } from "react";
import { useSectionDraftOptional } from "@/components/admin/cms/section-draft-context";
import { cn } from "@/lib/utils";

/** Admin in-canvas hotspot (SectionDraftProvider). */
export function EditableSpot({
  sectionId,
  fieldKey,
  children,
  className,
  label,
}: {
  sectionId: string;
  fieldKey: string;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const draft = useSectionDraftOptional();
  if (!draft) return <>{children}</>;

  const active =
    draft.selected?.sectionId === sectionId &&
    draft.selected?.field.key === fieldKey;
  const lockedOut = draft.fieldDirty && !active;
  const fieldLabel =
    label ||
    draft.defs
      .find((d) => d.id === sectionId)
      ?.fields.find((f) => f.key === fieldKey)?.label;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        draft.select(sectionId, fieldKey);
      }}
      className={cn(
        "group/spot relative block w-full rounded-lg text-left transition",
        "outline outline-2 outline-offset-2",
        active
          ? "cursor-pointer outline-brand-red"
          : lockedOut
            ? "cursor-not-allowed outline-transparent opacity-60"
            : "cursor-pointer outline-transparent hover:outline-navy/35",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm",
          active
            ? "bg-brand-red text-white"
            : lockedOut
              ? "bg-navy/70 text-white opacity-100"
              : "bg-navy/90 text-white opacity-0 [@media(hover:hover)]:group-hover/spot:opacity-100 [@media(hover:none)]:opacity-70",
        )}
      >
        {active
          ? draft.fieldDirty
            ? "รอยืนยัน"
            : "กำลังแก้"
          : lockedOut
            ? "ยืนยันจุดก่อน"
            : fieldLabel || "แก้ไข"}
      </span>
    </button>
  );
}
