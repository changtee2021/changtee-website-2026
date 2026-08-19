"use client";

import {
  getPortfolioBySlug,
  relatedPortfolio,
} from "@/lib/cms/public-content";
import { usePortfolioItems } from "@/lib/cms/demo-store";
import { PortfolioDetailView } from "@/components/portfolio/PortfolioDetailView";

export function PortfolioDetail({ slug }: { slug: string }) {
  const items = usePortfolioItems();
  const item = getPortfolioBySlug(slug, items);

  if (!item) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted">
        ไม่พบผลงานนี้ หรือยังไม่ได้เผยแพร่ขึ้นเซิร์ฟเวอร์
      </p>
    );
  }

  return (
    <PortfolioDetailView item={item} related={relatedPortfolio(item, items)} />
  );
}
