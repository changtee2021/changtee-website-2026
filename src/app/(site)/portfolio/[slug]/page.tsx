import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import { PortfolioDetailView } from "@/components/portfolio/PortfolioDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { normalizeContentSlug } from "@/lib/cms/content-status";
import {
  loadPortfolioItems,
  loadPublishedPortfolioSlugs,
} from "@/lib/cms/cms-public-load";
import {
  getPortfolioBySlug,
  relatedPortfolio,
} from "@/lib/cms/public-content";
import { getPortfolioJsonLd } from "@/lib/portfolio-jsonld";
import { pageMetadata } from "@/lib/seo/meta";

export const revalidate = 120;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPublishedPortfolioSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizeContentSlug((await params).slug);
  const items = await loadPortfolioItems();
  const item = getPortfolioBySlug(slug, items);
  if (!item) return { title: "ผลงาน" };
  return pageMetadata({
    title: item.seoTitle?.trim() || item.title,
    description: item.seoDescription?.trim() || item.summary,
    path: `/portfolio/${item.slug}`,
    image: item.image,
  });
}

export default async function PortfolioDetailPage({ params }: Props) {
  const slug = normalizeContentSlug((await params).slug);
  if (!slug) notFound();
  const items = await loadPortfolioItems();
  const item = getPortfolioBySlug(slug, items);
  if (!item) {
    return <PortfolioDetail slug={slug} />;
  }

  return (
    <>
      <JsonLd data={getPortfolioJsonLd(item)} />
      <PortfolioDetailView
        item={item}
        related={relatedPortfolio(item, items)}
      />
    </>
  );
}
