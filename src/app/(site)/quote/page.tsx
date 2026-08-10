import { Suspense } from "react";
import type { Metadata } from "next";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { QuoteShareButton } from "@/components/forms/QuoteShareButton";
import { SectionLoader } from "@/components/ui/section-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { pageMetadata } from "@/lib/seo/meta";

export const metadata: Metadata = pageMetadata({
  title: "ขอใบเสนอราคา",
  description: "กรอกแบบฟอร์มขอใบเสนอราคาจากช่างตี๋ ผ้าม่าน",
  path: "/quote",
});

export default function QuotePage() {
  return (
    <div className="min-h-full bg-shell px-6 py-8 sm:px-10 sm:py-12 lg:px-16">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-line bg-white p-4 sm:p-6 md:p-8">
        <div className="border-b border-line pb-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold text-navy sm:text-3xl">
              ขอใบเสนอราคา
            </h1>
            <QuoteShareButton />
          </div>
          <p className="mt-2 text-sm text-muted sm:text-base">
            กรอกข้อมูล แล้วกดดูพรีวิวหรือส่งแบบฟอร์มเพื่อตรวจทานก่อนยืนยัน
          </p>
        </div>
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="space-y-4 py-4" role="status" aria-busy="true">
                <SectionLoader label="กำลังโหลดแบบฟอร์ม…" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            }
          >
            <QuoteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
