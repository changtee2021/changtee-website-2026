import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { ProductCtaCard } from "@/components/products/ProductCtaCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadCatalogsForCategory } from "@/lib/catalogs-server";
import { getCategoryJsonLd } from "@/lib/category-jsonld";
import {
  childImage,
  getCategory,
  getPillar,
  productCatalog,
  quoteProductType,
} from "@/lib/product-catalog";
import { getCategoryHighlights } from "@/lib/product-content";
import { CATEGORY_DEFAULTS } from "@/lib/product-presentation";
import { pageMetadata } from "@/lib/seo/meta";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return productCatalog.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "ไม่พบหมวดสินค้า" };
  return pageMetadata({
    title: cat.name,
    description: cat.summary,
    path: `/products/${cat.slug}`,
    image: cat.children[0] ? childImage(cat, cat.children[0]) : undefined,
    keywords: Array.from(
      new Set([
        cat.name,
        cat.nameEn,
        ...cat.children.map((c) => c.name),
        ...(CATEGORY_DEFAULTS[cat.slug]?.baseKeywords ?? []),
      ]),
    ),
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const catalogs = await loadCatalogsForCategory(cat.slug);
  const pillar = getPillar(cat.pillar);
  const highlights = getCategoryHighlights(cat);

  return (
    <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-10 sm:py-12">
      <JsonLd data={getCategoryJsonLd(cat)} />
      <p className="text-sm text-muted">
        <Link href="/products" className="hover:text-navy">
          สินค้า/บริการ
        </Link>
        {pillar ? (
          <>
            <span className="mx-1.5">/</span>
            <Link href={`/products#pillar-${pillar.id}`} className="hover:text-navy">
              {pillar.name}
            </Link>
          </>
        ) : null}
        <span className="mx-1.5">/</span>
        <span className="text-navy">{cat.name}</span>
      </p>

      <div className="mt-6">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-paper sm:aspect-[21/9]">
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1100px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="text-sm text-white/85">{cat.nameEn}</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-white sm:text-4xl">
              {cat.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
              {cat.summary}
            </p>
          </div>
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <li
              key={h}
              className="rounded-xl border border-line bg-paper/60 px-3 py-2 text-sm text-navy"
            >
              {h}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-display text-xl font-semibold text-navy">
          เลือกรุ่น / ประเภท
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cat.children.map((child) => (
            <Link
              key={child.slug}
              href={`/products/${cat.slug}/${child.slug}`}
              className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:border-navy/30 hover:shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-paper">
                <Image
                  src={childImage(cat, child)}
                  alt={child.name}
                  fill
                  className="object-cover transition group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="font-semibold text-navy group-hover:text-brand-red">
                  {child.name}
                </div>
                {child.nameEn ? (
                  <div className="text-xs text-muted">{child.nameEn}</div>
                ) : null}
                <div className="mt-2 h-px w-8 bg-brand-red" aria-hidden />
                <p className="mt-2 text-sm text-muted">{child.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        {catalogs.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-navy">
              แคตตาล็อก
            </h2>
            <div className="mt-2 h-1 w-16 bg-brand-red" />
            <p className="mt-3 text-sm text-muted">
              ดาวน์โหลดแคตตาล็อกดูแบบสีและรายละเอียดสินค้าในหมวดนี้
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {catalogs.map((catalog) => (
                <CatalogCard key={catalog.id} catalog={catalog} />
              ))}
            </div>
          </section>
        ) : null}

        <ProductCtaCard
          productLabel={quoteProductType(cat)}
          productItem={cat.name}
          portfolioHref={`/portfolio?product=${encodeURIComponent(cat.slug)}`}
        />
      </div>
    </div>
  );
}
