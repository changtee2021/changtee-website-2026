import { Suspense } from "react";
import type { Metadata } from "next";
import { PortfolioIndex } from "@/components/portfolio/PortfolioIndex";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { pageMetadata } from "@/lib/seo/meta";

export const metadata: Metadata = pageMetadata({
  title: "ผลงานติดตั้ง",
  description:
    "แกลลอรี่ผลงานติดตั้งจริงของช่างตี๋ ค้นหาด้วยคำ และกรองตามสินค้า พื้นที่ หรือประเภทสถานที่",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <Suspense
      fallback={
        <PageSkeleton variant="portfolio" label="กำลังโหลดผลงาน…" />
      }
    >
      <PortfolioIndex />
    </Suspense>
  );
}
