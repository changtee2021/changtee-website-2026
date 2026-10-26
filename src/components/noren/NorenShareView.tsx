"use client";

import { useEffect, useId } from "react";
import { PenLine } from "lucide-react";
import {
  formatBaht,
  norenLine,
  pieceSizeLabel,
  type NorenPiece,
} from "@/lib/noren/pricing";
import { clothSvg } from "@/components/noren/noren-svg";

export function NorenShareView({
  open,
  pieces,
  estimate,
  shop,
  onNewDesign,
}: {
  open: boolean;
  pieces: NorenPiece[];
  estimate: { exVat: number; vat: number; total: number; qty: number };
  shop: string;
  onNewDesign: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[70] flex flex-col bg-white"
    >
      <h2 id={titleId} className="sr-only">
        Preview
      </h2>
      <div className="min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-10 sm:py-8">
        <div
          className={`mx-auto grid w-full max-w-5xl gap-6 ${pieces.length > 1 ? "sm:grid-cols-2" : ""}`}
        >
          {pieces.map((p) => {
            const line = norenLine(p);
            return (
              <article key={p.id} className="min-w-0">
                <b className="block font-display text-lg text-navy">{p.name}</b>
                <span className="mt-0.5 block text-sm text-muted">{pieceSizeLabel(p)}</span>
                <div
                  className="mt-3 min-h-[280px] rounded-2xl bg-[repeating-conic-gradient(#0000_0_25%,#0b1f3a0d_0_50%)] bg-[length:16px_16px] p-4 text-navy sm:min-h-[380px]"
                  dangerouslySetInnerHTML={{ __html: clothSvg(p, shop) }}
                />
                <p className="mt-2 text-sm text-muted">{formatBaht(line.amount)} บาท</p>
              </article>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t border-line bg-white px-5 py-4 sm:px-10">
        <div className="mx-auto w-full max-w-5xl space-y-1.5 text-sm text-muted">
          <div className="flex justify-between">
            <span>ราคาก่อน VAT</span>
            <b className="text-navy">{formatBaht(estimate.exVat)} บาท</b>
          </div>
          <div className="flex justify-between">
            <span>VAT 7%</span>
            <b className="text-navy">{formatBaht(estimate.vat)} บาท</b>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-display text-xl font-semibold text-navy">
            <span>รวมทั้งสิ้น</span>
            <b className="text-brand-red">{formatBaht(estimate.total)} บาท</b>
          </div>
          <button
            type="button"
            onClick={onNewDesign}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-navy/90"
          >
            <PenLine className="size-4" />
            ออกแบบใหม่
          </button>
        </div>
      </div>
    </div>
  );
}
