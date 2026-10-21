import { Suspense } from "react";
import type { Metadata } from "next";
import { PortfolioIndex } from "@/components/portfolio/PortfolioIndex";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { loadPortfolioItems } from "@/lib/cms/cms-public-load";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "ผลงานติดตั้ง",
    description:
      "แกลลอรี่ผลงานติดตั้งจริงของช่างตี๋ ค้นหาด้วยคำ และกรองตามสินค้า พื้นที่ หรือประเภทสถานที่",
    path: "/portfolio",
    locale,
    translationScope: "cms",
  });
}

export default async function PortfolioPage() {
  const items = await loadPortfolioItems();
  return (
    <Suspense
      fallback={
        <PageSkeleton variant="portfolio" label="กำลังโหลดผลงาน…" />
      }
    >
      <PortfolioIndex initialItems={items} />
    </Suspense>
  );
}
