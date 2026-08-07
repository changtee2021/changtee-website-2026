import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import {
  loadPortfolioItems,
  loadPublishedPortfolioSlugs,
} from "@/lib/cms/cms-public-load";
import { getPortfolioBySlug } from "@/lib/cms/public-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPublishedPortfolioSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const items = await loadPortfolioItems();
  const item = getPortfolioBySlug(slug, items);
  if (!item) return { title: "ผลงาน" };
  return {
    title: item.title,
    description: item.summary,
    openGraph: { images: [item.image] },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();
  return <PortfolioDetail slug={slug} />;
}
