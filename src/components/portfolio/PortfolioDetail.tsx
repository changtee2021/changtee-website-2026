"use client";

import { notFound } from "next/navigation";
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
    notFound();
  }

  return (
    <PortfolioDetailView item={item} related={relatedPortfolio(item, items)} />
  );
}
