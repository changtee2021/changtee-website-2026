"use client";

import { X } from "lucide-react";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_STATUS_STYLES,
  type ContentStatus,
} from "@/lib/cms/content-status";
import { cn } from "@/lib/utils";

export function DemoBadge({ children = "demo — ยังไม่บันทึกลงฐานข้อมูล" }: { children?: string }) {
  return (
    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status: ContentStatus | "pending";
}) {
  if (status === "pending") {
    return (
      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
        รอตรวจ
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        CONTENT_STATUS_STYLES[status],
      )}
    >
      {CONTENT_STATUS_LABELS[status]}
    </span>
  );
}

export function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-navy bg-navy text-white"
          : "border-line bg-paper text-ink hover:border-navy/30",
      )}
    >
      {label}
    </button>
  );
}

export function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "green" | "amber" | "red";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2",
        tone === "green" && "border-emerald-100 bg-emerald-50/60",
        tone === "amber" && "border-amber-100 bg-amber-50/60",
        tone === "red" && "border-red-100 bg-red-50/50",
        tone === "default" && "border-line bg-paper/60",
      )}
    >
      <div className="text-[11px] text-muted">{label}</div>
      <div className="font-display text-lg font-semibold text-navy">{value}</div>
    </div>
  );
}

export function CmsModal({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-lg sm:rounded-2xl",
          wide ? "max-w-3xl" : "max-w-xl",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-navy sm:text-xl">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="ปิด"
            className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  hint,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn("block text-xs text-muted", className)}>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
      />
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block text-xs text-muted", className)}>
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
      />
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={cn("block text-xs text-muted", className)}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
