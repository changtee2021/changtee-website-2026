"use client";

import { useState, type ReactNode } from "react";
import {
  Check,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  X,
} from "lucide-react";
import { CmsImageUpload } from "@/components/admin/cms/CmsImageUpload";
import { CmsLinkPicker } from "@/components/admin/cms/CmsLinkPicker";
import { DemoBadge } from "@/components/admin/cms/CmsShared";
import { useSectionDraft } from "@/components/admin/cms/section-draft-context";
import { cn } from "@/lib/utils";

export function VisualSectionEditorShell({
  title,
  description,
  toolbar,
  uploadFolder,
  children,
}: {
  title: string;
  description: string;
  toolbar?: ReactNode;
  uploadFolder: string;
  children: ReactNode;
}) {
  const {
    dirty,
    fieldDirty,
    selected,
    lockHint,
    getValues,
    setField,
    confirm,
    discard,
    clearSelect,
    confirmField,
    revertField,
  } = useSectionDraft();

  const selectedKey = selected
    ? `${selected.sectionId}:${selected.field.key}`
    : null;
  /** When user collapses while a field is selected, stay closed until selection changes */
  const [closedSelectedKey, setClosedSelectedKey] = useState<string | null>(
    null,
  );
  const [idleClosed, setIdleClosed] = useState(false);
  const rightOpen = selectedKey
    ? closedSelectedKey !== selectedKey
    : !idleClosed;

  function openPanel() {
    setClosedSelectedKey(null);
    setIdleClosed(false);
  }
  function closePanel() {
    if (selectedKey) setClosedSelectedKey(selectedKey);
    else setIdleClosed(true);
  }

  const values = selected
    ? getValues(selected.sectionId)
    : ({} as Record<string, string>);
  const field = selected?.field;
  const currentValue = field ? (values[field.key] ?? "") : "";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-navy sm:text-2xl">
                {title}
              </h1>
              <DemoBadge />
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            <button
              type="button"
              disabled={!dirty || fieldDirty}
              onClick={discard}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold",
                dirty && !fieldDirty
                  ? "border-line text-navy hover:bg-paper"
                  : "cursor-not-allowed border-line text-muted opacity-50",
              )}
            >
              <RotateCcw className="size-3.5" />
              ยกเลิกทั้งหมด
            </button>
            <button
              type="button"
              disabled={!dirty || fieldDirty}
              onClick={confirm}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white",
                dirty && !fieldDirty
                  ? "bg-brand-red hover:bg-brand-red-soft"
                  : "cursor-not-allowed bg-navy/30",
              )}
            >
              <Check className="size-3.5" />
              ยืนยันการเปลี่ยนแปลง
            </button>
            <button
              type="button"
              onClick={() => (rightOpen ? closePanel() : openPanel())}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm font-semibold text-navy hover:bg-paper lg:hidden"
              aria-label={rightOpen ? "หุบแผงแก้ไข" : "เปิดแผงแก้ไข"}
            >
              {rightOpen ? (
                <PanelRightClose className="size-3.5" />
              ) : (
                <PanelRightOpen className="size-3.5" />
              )}
              {rightOpen ? "หุบแผงแก้" : "เปิดแผงแก้"}
            </button>
          </div>
        </div>
        {fieldDirty ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
            กำลังแก้จุดนี้ — กด “ยืนยันจุดนี้” ในแผงขวาก่อน แล้วค่อยไปแก้ส่วนอื่น
            หรือกดบันทึกทั้งหน้า
          </p>
        ) : dirty ? (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
            มีจุดที่ยืนยันแล้วแต่ยังไม่ขึ้นเว็บ — กด “ยืนยันการเปลี่ยนแปลง”
            เพื่อใช้บนเว็บ หรือ “ยกเลิกทั้งหมด” เพื่อทิ้ง
          </p>
        ) : null}
      </section>

      <div className="flex min-h-[70vh] flex-col gap-3 lg:flex-row lg:gap-0">
        <div
          className={cn(
            "min-w-0 flex-1 overflow-hidden rounded-2xl border border-line bg-shell shadow-sm",
            rightOpen ? "lg:rounded-r-none lg:border-r-0" : "",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-line bg-white px-3 py-2 sm:px-4">
            <p className="min-w-0 text-[11px] leading-snug text-muted sm:text-xs">
              พรีวิวเหมือนหน้าจริง — คลิกจุดที่มีกรอบเพื่อแก้ · โฮเวอร์จุดล็อก =
              แก้ไม่ได้ในหน้านี้
              {fieldDirty ? " · ยืนยันจุดนี้ก่อนจึงเลือกจุดอื่นได้" : ""}
            </p>
            {!rightOpen ? (
              <button
                type="button"
                onClick={openPanel}
                className="hidden shrink-0 items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs font-semibold text-navy hover:bg-paper lg:inline-flex"
                aria-label="เปิดแผงแก้ไข"
                title="เปิดแผงแก้ไข"
              >
                <PanelRightOpen className="size-3.5" />
                แผงแก้
              </button>
            ) : null}
          </div>
          <div className="max-h-[78vh] overflow-y-auto overflow-x-auto bg-shell/40">
            <div className="origin-top-left">{children}</div>
          </div>
        </div>

        <aside
          className={cn(
            "shrink-0 transition-[width,max-height] duration-200 ease-out",
            rightOpen ? "w-full lg:w-80" : "hidden lg:flex lg:w-10",
            !rightOpen && "lg:flex-col",
          )}
        >
          {rightOpen ? (
            <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-5.5rem)] lg:rounded-l-none lg:border-l lg:shadow-none">
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-line pb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  แผงแก้ไข
                </p>
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy"
                  aria-label="หุบแผงแก้ไข"
                  title="หุบแผงแก้ไข"
                >
                  <PanelRightClose className="size-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {!selected || !field ? (
                  <div className="py-10 text-center text-sm text-muted">
                    <p className="font-medium text-navy">ยังไม่ได้เลือกจุดแก้</p>
                    <p className="mt-2">
                      คลิกที่ข้อความหรือรูปในพรีวิวด้านซ้าย แก้ค่า
                      แล้วกดยืนยันจุดนี้ก่อนไปต่อ
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
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
                        title={fieldDirty ? "ทิ้งการแก้จุดนี้" : "ปิดแผง"}
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    {field.type === "image" ? (
                      <CmsImageUpload
                        value={currentValue}
                        onChange={(url) =>
                          setField(selected.sectionId, field.key, url)
                        }
                        folder={uploadFolder}
                        aspectClassName={field.aspectClassName ?? "aspect-video"}
                      />
                    ) : null}

                    {field.type === "link" ? (
                      <CmsLinkPicker
                        value={currentValue}
                        onChange={(href) =>
                          setField(selected.sectionId, field.key, href)
                        }
                      />
                    ) : null}

                    {field.type === "textarea" ? (
                      <textarea
                        value={currentValue}
                        onChange={(e) =>
                          setField(
                            selected.sectionId,
                            field.key,
                            e.target.value,
                          )
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
                          setField(
                            selected.sectionId,
                            field.key,
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
                      />
                    ) : null}

                    {field.hint ? (
                      <p className="text-xs text-muted">{field.hint}</p>
                    ) : null}

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
                      <p className="text-xs text-muted">
                        {fieldDirty
                          ? "ยืนยันจุดนี้ก่อน จึงจะเลือกแก้ส่วนอื่นได้ — ยังไม่ขึ้นเว็บจนกดยืนยันทั้งหน้า"
                          : "ยังไม่ได้เปลี่ยนค่า — แก้ข้อความ/รูปแล้วปุ่มยืนยันจุดนี้จะใช้งานได้"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openPanel}
              className="flex h-full w-full flex-col items-center gap-3 rounded-2xl border border-line bg-white py-4 text-muted shadow-sm hover:bg-paper hover:text-navy lg:rounded-l-none lg:rounded-r-2xl"
              aria-label="เปิดแผงแก้ไข"
              title="เปิดแผงแก้ไข"
            >
              <PanelRightOpen className="size-4" />
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ writingMode: "vertical-rl" }}
              >
                กำลังแก้ไข
              </span>
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
