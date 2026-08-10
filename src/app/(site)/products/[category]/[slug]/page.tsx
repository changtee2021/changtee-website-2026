import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadCatalogForProduct } from "@/lib/catalogs-server";
import {
  getPillar,
  getProduct,
  productCatalog,
} from "@/lib/product-catalog";
import { getProductContent } from "@/lib/product-content";
import { certificatesForCategory } from "@/lib/product-certificates";
import { portfolioForProduct } from "@/lib/cms/public-content";
import {
  getProductJsonLd,
  getProductPresentation,
} from "@/lib/product-presentation";
import { pageMetadata } from "@/lib/seo/meta";

type Props = { params: Promise<{ category: string; slug: string }> };

export async function generateStaticParams() {
  return productCatalog.flatMap((c) =>
    c.children.map((child) => ({ category: c.slug, slug: child.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const found = getProduct(category, slug);
  if (!found) return { title: "ไม่พบสินค้า" };

  const presentation = getProductPresentation(category, slug);
  const content = getProductContent(category, slug);
  const title =
    presentation?.seoTitle ??
    `${found.product.name} | ${found.category.name}`;
  const description =
    presentation?.seoDescription ??
    content?.tagline ??
    found.product.summary;
  const image = presentation?.assets.hero;

  return pageMetadata({
    title,
    description,
    path: `/products/${category}/${slug}`,
    image,
    keywords: presentation?.seoKeywords,
    robots: { index: true, follow: true },
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { category, slug } = await params;
  const found = getProduct(category, slug);
  if (!found) notFound();

  const { category: cat, product } = found;
  const content = getProductContent(category, slug);
  const presentation = getProductPresentation(category, slug);
  if (!content || !presentation) notFound();

  const catalog = await loadCatalogForProduct(cat.slug, product.slug);
  const pillar = getPillar(cat.pillar);
  const related = cat.children.filter((c) => c.slug !== product.slug).slice(0, 3);
  const portfolioWorks = portfolioForProduct(cat.slug, product.name, undefined, 3);
  const jsonLd = getProductJsonLd(category, slug);

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ProductDetailView
        category={cat}
        product={product}
        pillar={pillar}
        content={content}
        presentation={presentation}
        catalog={catalog}
        related={related}
        certificates={certificatesForCategory(cat.slug)}
        portfolioWorks={portfolioWorks}
      />
    </>
  );
}
