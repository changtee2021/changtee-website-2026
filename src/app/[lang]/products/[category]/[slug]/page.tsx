import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import { ThaiTextScope } from "@/components/i18n/ThaiTextScope";
import { sectionThaiText } from "@/lib/i18n/content/thai-text/sections.server";
import { loadCatalogForProduct } from "@/lib/catalogs-server";
import {
  getPillar,
  getProduct,
  productCatalog,
  type ProductChild,
} from "@/lib/product-catalog";
import { getProductContent } from "@/lib/product-content";
import { portfolioForProduct } from "@/lib/cms/public-content";
import {
  getProductJsonLd,
  getProductPresentation,
} from "@/lib/product-presentation";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";
import {
  getProductOverlay,
  productIndexableLocales,
} from "@/lib/i18n/content/product-overlays";
import type { Locale } from "@/lib/i18n/locale";

/** Overlay name → catalog English name → Thai, for every locale except Thai. */
function localizedProduct(
  locale: Locale,
  categorySlug: string,
  product: ProductChild,
): ProductChild {
  if (locale === "th") return product;
  const overlay = getProductOverlay(locale, categorySlug, product.slug);
  return {
    ...product,
    name: overlay?.name ?? product.nameEn ?? product.name,
    summary: overlay?.summary ?? product.summary,
  };
}

type Props = { params: Promise<{ lang: string; category: string; slug: string }> };

export async function generateStaticParams() {
  return productCatalog.flatMap((c) =>
    c.children.map((child) => ({ category: c.slug, slug: child.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await langFromParams(params);
  const { category, slug } = await params;
  const found = getProduct(category, slug);
  if (!found) return { title: "ไม่พบสินค้า" };

  const presentation = getProductPresentation(category, slug);
  const content = getProductContent(category, slug, locale);
  const localized = localizedProduct(locale, category, found.product);
  const pageText = sectionThaiText("products", locale, `${category}/${slug}`);
  const title =
    locale === "th"
      ? (presentation?.seoTitle ??
        `${found.product.name} | ${found.category.name}`)
      : localized.name;
  const thaiDescription =
    locale === "th"
      ? (presentation?.seoDescription ?? content?.tagline ?? found.product.summary)
      : (content?.tagline ?? localized.summary);
  const description = pageText?.[thaiDescription] ?? thaiDescription;
  const image = presentation?.assets.hero;
  return pageMetadata({
    title,
    description,
    path: `/products/${category}/${slug}`,
    image,
    keywords: presentation?.seoKeywords,
    locale,
    indexable: productIndexableLocales(category, slug),
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const locale = await langFromParams(params);
  const { category, slug } = await params;
  const found = getProduct(category, slug);
  if (!found) notFound();

  const { category: cat, product } = found;
  const content = getProductContent(category, slug, locale);
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
      <ThaiTextScope
        locale={locale}
        pack={sectionThaiText("products", locale, `${category}/${slug}`)}
      >
        <ProductDetailView
          category={cat}
          product={product}
          displayName={
            locale === "th" ? undefined : localizedProduct(locale, cat.slug, product).name
          }
          pillar={pillar}
          content={content}
          presentation={presentation}
          catalog={catalog}
          related={related}
          portfolioWorks={portfolioWorks}
        />
      </ThaiTextScope>
    </>
  );
}
