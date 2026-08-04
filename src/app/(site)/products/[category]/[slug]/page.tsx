import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { getCatalogForProduct } from "@/lib/catalogs";
import { getProduct, productCatalog } from "@/lib/product-catalog";

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
  return {
    title: `${found.product.name} | ${found.category.name}`,
    description: found.product.summary,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { category, slug } = await params;
  const found = getProduct(category, slug);
  if (!found) notFound();
  const { category: cat, product } = found;
  const catalog = getCatalogForProduct(cat.slug, product.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted">
        <Link href="/products" className="hover:text-navy">
          สินค้า/บริการ
        </Link>
        <span>/</span>
        <Link href={`/products/${cat.slug}`} className="hover:text-navy">
          {cat.name}
        </Link>
        <span>/</span>
        <span className="break-words text-navy">{product.name}</span>
      </p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy">{product.name}</h1>
          <p className="mt-3 text-muted">{product.summary}</p>
          <div className="mt-6 rounded-2xl border border-line bg-paper p-5 text-sm text-ink/90">
            <p>
              เนื้อหาฉบับเต็มจะถูกย้ายจากเว็บเดิมและ Company Profile 2026
              หน้านี้พร้อมโครงสร้าง SEO และ CTA สำหรับเก็บ Lead แล้ว
            </p>
          </div>

          {catalog ? (
            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold text-navy">แคตตาล็อก</h2>
              <div className="mt-2 h-1 w-14 bg-brand-red" />
              <div className="mt-4">
                <CatalogCard catalog={catalog} />
              </div>
            </section>
          ) : null}
        </div>
        <aside className="h-fit rounded-2xl border border-line p-5 lg:sticky lg:top-6">
          <h2 className="font-semibold text-navy">สนใจสินค้านี้?</h2>
          <p className="mt-2 text-sm text-muted">ขอใบเสนอราคา หรือประเมินราคาคร่าวๆ ได้ทันที</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/quote" className="rounded-full bg-brand-red px-4 py-2 text-center text-sm font-semibold text-white">
              ขอใบเสนอราคา
            </Link>
            <Link href="/estimate" className="rounded-full border border-navy px-4 py-2 text-center text-sm font-semibold text-navy">
              ประเมินราคา
            </Link>
            {catalog ? (
              <a
                href={catalog.href}
                download
                className="rounded-full border border-line px-4 py-2 text-center text-sm font-semibold text-navy hover:bg-paper"
              >
                ดาวน์โหลดแคตตาล็อก
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
