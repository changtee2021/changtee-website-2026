"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { CmsImageUpload } from "@/components/admin/cms/CmsImageUpload";
import { CmsLinkPicker } from "@/components/admin/cms/CmsLinkPicker";
import { useSectionDraft } from "@/components/admin/cms/section-draft-context";
import { cn } from "@/lib/utils";

export function FieldPanel({ uploadFolder }: { uploadFolder: string }) {
  const {
    selected,
    lockHint,
    fieldDirty,
    getValues,
    setField,
    confirmField,
    revertField,
    clearSelect,
  } = useSectionDraft();

  const field = selected?.field;
  const values = selected
    ? getValues(selected.sectionId)
    : ({} as Record<string, string>);
  const currentValue = field ? (values[field.key] ?? "") : "";

  if (!selected || !field) {
    return (
      <div className="py-10 text-center text-sm text-muted">
        <p className="font-medium text-navy">ยังไม่ได้เลือกจุดแก้</p>
        <p className="mt-2 px-2">
          คลิกข้อความหรือรูปในพรีวิว แก้ค่า แล้วกดยืนยันจุดนี้ก่อนไปต่อ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted uppercase">
            กำลังแก้ไข
          </p>
          <h2 className="mt-1 font-display text-base font-semibold text-navy">
            {field.label}
          </h2>
        </div>
        <button
          type="button"
          onClick={fieldDirty ? revertField : clearSelect}
          className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy"
          aria-label={fieldDirty ? "ทิ้งการแก้จุดนี้" : "ปิดแผง"}
        >
          <X className="size-4" />
        </button>
      </div>

      {field.type === "image" ? (
        <CmsImageUpload
          value={currentValue}
          onChange={(url) => setField(selected.sectionId, field.key, url)}
          folder={uploadFolder}
          aspectClassName={field.aspectClassName ?? "aspect-video"}
        />
      ) : null}

      {field.type === "link" ? (
        <CmsLinkPicker
          value={currentValue}
          onChange={(href) => setField(selected.sectionId, field.key, href)}
        />
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          value={currentValue}
          onChange={(e) =>
            setField(selected.sectionId, field.key, e.target.value)
          }
          rows={5}
          className="w-full rounded-xl border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
        />
      ) : null}

      {field.type === "text" ? (
        <input
          type="text"
          value={currentValue}
          maxLength={field.maxLength}
          onChange={(e) =>
            setField(selected.sectionId, field.key, e.target.value)
          }
          className="w-full rounded-xl border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
        />
      ) : null}

      {field.hint ? <p className="text-xs text-muted">{field.hint}</p> : null}

      {lockHint ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
          {lockHint}
        </p>
      ) : null}

      <div className="space-y-2 border-t border-line pt-4">
        <button
          type="button"
          disabled={!fieldDirty}
          onClick={confirmField}
          className={cn(
            "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white",
            fieldDirty
              ? "bg-brand-red hover:bg-brand-red-soft"
              : "cursor-not-allowed bg-navy/30",
          )}
        >
          <Check className="size-3.5" />
          ยืนยันจุดนี้
        </button>
        <button
          type="button"
          onClick={fieldDirty ? revertField : clearSelect}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
        >
          <RotateCcw className="size-3.5" />
          {fieldDirty ? "ทิ้งการแก้จุดนี้" : "ปิดแผง"}
        </button>
      </div>
    </div>
  );
}
