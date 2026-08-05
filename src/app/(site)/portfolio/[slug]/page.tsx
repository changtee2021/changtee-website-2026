import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioDetail } from "@/components/portfolio/PortfolioDetail";
import { DEMO_PORTFOLIO } from "@/lib/cms/portfolio-demo";
import { getPortfolioBySlug, publishedPortfolio } from "@/lib/cms/public-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publishedPortfolio(DEMO_PORTFOLIO).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getPortfolioBySlug(slug, DEMO_PORTFOLIO);
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
