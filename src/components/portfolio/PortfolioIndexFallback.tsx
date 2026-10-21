import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import { siteConfig } from "@/lib/site-config";
import { PageHero } from "@/components/ui/page-hero";
import { PortfolioHeroCovers } from "@/components/portfolio/PortfolioHeroCovers";
import { GalleryCard } from "@/components/portfolio/PortfolioIndex";

/**
 * Server HTML for /portfolio. The interactive index reads the URL filters, so
 * it only renders in the browser; crawlers that skip JavaScript (most AI search
 * bots) would otherwise get a skeleton with no heading and no work links.
 */
export function PortfolioIndexFallback({ items }: { items: PortfolioItem[] }) {
  return (
    <div className="bg-shell pb-16">
      <PageHero
        image="/images/generated/ct-hero-portfolio.webp"
        imageAlt="ห้องนั่งเล่นคอนโดพร้อมผ้าม่านทึบแสงและผ้าโปร่งที่ติดตั้งโดยช่างตี๋"
        eyebrow={`${siteConfig.nameEn} · Install gallery`}
        title="ผลงานติดตั้งผ้าม่าน"
        description="รวมงานติดตั้งลูกค้า — ค้นหาตามสินค้า สถานที่ หรือม่านตรงกับใจคุณ"
        aside={<PortfolioHeroCovers items={items} />}
        align="bottom"
        compact
      />
      <div className="mx-auto max-w-site px-6 pt-8 sm:px-10 sm:pt-10 lg:px-16">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <GalleryCard key={item.id} item={item} showProduct={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
