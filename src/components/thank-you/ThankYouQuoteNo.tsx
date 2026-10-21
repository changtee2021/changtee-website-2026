"use client";

import { useSearchParams } from "next/navigation";
import { isQuoteNo } from "@/lib/leads/quote-no";

export function ThankYouQuoteNo() {
  const quoteNo = useSearchParams().get("no");
  if (!isQuoteNo(quoteNo)) return null;
  return (
    <div className="mt-5 inline-flex flex-col items-center rounded-2xl border border-line bg-paper px-5 py-3">
      <span className="text-xs font-medium text-muted">เลขที่คำขอของคุณ</span>
      <span className="mt-0.5 font-display text-2xl font-semibold tracking-wide text-navy tabular-nums">
        {quoteNo}
      </span>
      <span className="mt-1 text-xs text-muted">แจ้งเลขนี้เวลาติดต่อทีมงาน จะได้เช็กเรื่องได้เร็วขึ้น</span>
    </div>
  );
}
