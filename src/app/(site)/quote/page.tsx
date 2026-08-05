import { Suspense } from "react";
import type { Metadata } from "next";
import { QuoteForm } from "@/components/forms/QuoteForm";

export const metadata: Metadata = {
  title: "ขอใบเสนอราคา",
  description: "กรอกแบบฟอร์มขอใบเสนอราคาจากช่างตี๋ ผ้าม่าน",
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-12">
      <div className="rounded-2xl border border-line bg-white p-4 sm:p-6 md:p-8">
        <div className="border-b border-line pb-5">
          <h1 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
            ขอใบเสนอราคา
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            กรอกข้อมูลและดูพรีวิวสรุปก่อนส่ง — บนมือถือพรีวิวอยู่ด้านบน บนจอใหญ่พรีวิวอยู่ด้านขวา
          </p>
        </div>
        <div className="mt-6">
          <Suspense
            fallback={
              <p className="text-sm text-muted">กำลังโหลดแบบฟอร์ม…</p>
            }
          >
            <QuoteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
