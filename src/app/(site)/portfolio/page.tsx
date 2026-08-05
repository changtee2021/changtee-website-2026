import { Suspense } from "react";
import type { Metadata } from "next";
import { PortfolioIndex } from "@/components/portfolio/PortfolioIndex";

export const metadata: Metadata = {
  title: "ผลงานติดตั้ง",
  description:
    "ดูผลงานติดตั้งจริงของช่างตี๋ แยกตามหมวดสินค้าและประเภทสถานที่ — บ้าน คอนโด ร้านค้า และองค์กร",
};

export default function PortfolioPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-shell px-4 py-16 text-center text-sm text-muted">
          กำลังโหลดผลงาน…
        </div>
      }
    >
      <PortfolioIndex />
    </Suspense>
  );
}
