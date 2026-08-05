"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, X } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CONTENT_STATUS_LABELS, type ContentStatus } from "@/lib/cms/content-status";

export function CmsSitePreview({
  open,
  onClose,
  title,
  status,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  status?: ContentStatus;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="พรีวิวหน้าเว็บ"
    >
      <div className="sticky top-0 z-[110] flex flex-wrap items-center justify-between gap-2 border-b border-navy/20 bg-navy px-3 py-2.5 text-white sm:px-4">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Eye className="size-4 shrink-0 opacity-90" />
          <span className="font-medium">พรีวิว</span>
          <span className="hidden text-white/70 sm:inline">·</span>
          <span className="truncate text-white/90">{title || "ไม่มีชื่อ"}</span>
          {status ? (
            <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
              {CONTENT_STATUS_LABELS[status]}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-white/60 sm:inline">
            header / footer เหมือนเว็บจริง · Esc เพื่อปิด
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-navy hover:bg-paper"
          >
            <X className="size-4" />
            ปิดพรีวิว
          </button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onClickCapture={(e) => {
          const el = e.target as HTMLElement | null;
          const anchor = el?.closest?.("a");
          if (anchor) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div className="flex min-h-full flex-col bg-white text-ink">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </div>
    </div>,
    document.body,
  );
}
