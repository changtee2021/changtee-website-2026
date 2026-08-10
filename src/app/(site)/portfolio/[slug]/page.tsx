import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  loadPortfolioItems,
  loadPublishedPortfolioSlugs,
} from "@/lib/cms/cms-public-load";
import { getPortfolioBySlug } from "@/lib/cms/public-content";
import { getPortfolioJsonLd } from "@/lib/portfolio-jsonld";
import { pageMetadata } from "@/lib/seo/meta";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return loadPublishedPortfolioSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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
  const { slug } = await params;
  if (!slug) notFound();
  const items = await loadPortfolioItems();
  const item = getPortfolioBySlug(slug, items);

  return (
    <>
      {item ? <JsonLd data={getPortfolioJsonLd(item)} /> : null}
      <PortfolioDetail slug={slug} />
    </>
  );
}
