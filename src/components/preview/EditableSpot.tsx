"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePreviewMode } from "@/components/preview/preview-context";
import { cn } from "@/lib/utils";

/**
 * Live-page editable hotspot. No-op unless SitePreviewRoot is active
 * (editor iframe with ?__preview=). Admin draft UI uses
 * components/admin/cms/EditableSpot instead.
 */
export function EditableSpot({
  sectionId,
  fieldKey,
  children,
  className,
  label,
  scope = "template",
}: {
  sectionId: string;
  fieldKey: string;
  children: ReactNode;
  className?: string;
  label?: string;
  scope?: "template" | "instance";
}) {
  const preview = usePreviewMode();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!preview?.active) return;
    preview.registerSpot(sectionId, fieldKey, ref.current, scope);
    return () => preview.registerSpot(sectionId, fieldKey, null, scope);
  }, [preview, sectionId, fieldKey, scope]);

  if (!preview?.active) {
    return <>{children}</>;
  }

  const spotKey = `${sectionId}:${fieldKey}`;
  const highlighted = preview.highlightKey === spotKey;
  const showBadge = preview.showAllSpots || highlighted;

  return (
    <button
      ref={ref}
      type="button"
      data-ctc-spot={`${sectionId}:${fieldKey}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        preview.select(sectionId, fieldKey);
      }}
      className={cn(
        "group/spot relative block w-full rounded-lg text-left transition",
        "outline outline-2 outline-offset-2",
        highlighted
          ? "outline-brand-red"
          : showBadge
            ? "outline-navy/30"
            : "outline-transparent [@media(hover:hover)]:hover:outline-navy/35 [@media(hover:none)]:outline-navy/20",
        scope === "instance" ? "outline-dashed" : "",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm",
          scope === "template" ? "bg-navy/90" : "bg-emerald-700/90",
          showBadge
            ? "opacity-100"
            : "opacity-0 [@media(hover:hover)]:group-hover/spot:opacity-100",
        )}
      >
        {label || (scope === "template" ? "แก้ไข" : "ชิ้นนี้")}
      </span>
    </button>
  );
}
