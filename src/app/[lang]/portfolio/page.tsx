import { Suspense } from "react";
import type { Metadata } from "next";
import { PortfolioIndex } from "@/components/portfolio/PortfolioIndex";
import { PortfolioIndexFallback } from "@/components/portfolio/PortfolioIndexFallback";
import { loadPortfolioItems } from "@/lib/cms/cms-public-load";
import { publishedPortfolio } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";
import { tx } from "@/lib/i18n/content/thai-text/server";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";

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

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = await langFromParams(params);
  const items = await loadPortfolioItems();
  return (
    <>
      <p className="bg-shell px-6 pt-4 text-sm sm:px-10 lg:px-16">
        <Link href="/areas" className="font-semibold text-navy hover:text-brand-red">
          {tx(locale, "พื้นที่ติดตั้ง")}
        </Link>
      </p>
      <Suspense
        fallback={<PortfolioIndexFallback items={publishedPortfolio(items)} />}
      >
        <PortfolioIndex initialItems={items} />
      </Suspense>
    </>
  );
}
