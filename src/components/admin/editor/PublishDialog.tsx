"use client";

import { X } from "lucide-react";

export function PublishDialog({
  open,
  pageLabel,
  kind,
  blastLabel,
  samplePaths,
  changeCount,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pageLabel: string;
  kind: "single" | "template";
  blastLabel: string;
  samplePaths: string[];
  changeCount: number;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/50"
        aria-label="ปิด"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">
              เผยแพร่การเปลี่ยนแปลง
            </h2>
            <p className="mt-1 text-sm text-muted">
              {pageLabel}
              {kind === "template" ? " · เทมเพลต" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-muted hover:bg-paper"
            aria-label="ปิด"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-4 text-sm text-navy">
          {changeCount > 0
            ? "จะเผยแพร่ฉบับร่างล่าสุด → "
            : "จะเผยแพร่ค่าปัจจุบันของหน้านี้ → "}
          <strong>{blastLabel}</strong>
        </p>

        {kind === "template" ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
            ⚠ โหมดเทมเพลต — ทุกหน้าที่ใช้แพทเทิร์นนี้จะเปลี่ยนตาม
          </p>
        ) : null}

        {samplePaths.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-muted">
            {samplePaths.map((p) => (
              <li key={p} className="truncate font-mono">
                {p}
              </li>
            ))}
            {blastLabel.includes("หน้า") && samplePaths.length >= 3 ? (
              <li>และหน้าอื่นๆ…</li>
            ) : null}
          </ul>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-soft disabled:opacity-60"
          >
            {busy ? "กำลังเผยแพร่…" : `เผยแพร่ ${blastLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
