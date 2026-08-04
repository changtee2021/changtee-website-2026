import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { getCatalogsForCategory } from "@/lib/catalogs";
import { getCategory, productCatalog } from "@/lib/product-catalog";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return productCatalog.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "ไม่พบหมวดสินค้า" };
  return { title: cat.name, description: cat.summary };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const catalogs = getCatalogsForCategory(cat.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm text-muted">
        <Link href="/products" className="hover:text-navy">สินค้า/บริการ</Link>
        {" / "}
        {cat.name}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-navy">{cat.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">{cat.summary}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cat.children.map((child) => (
          <Link
            key={child.slug}
            href={`/products/${cat.slug}/${child.slug}`}
            className="rounded-2xl border border-line p-5 hover:border-navy"
          >
            <div className="font-semibold text-navy">{child.name}</div>
            <p className="mt-2 text-sm text-muted">{child.summary}</p>
          </Link>
        ))}
      </div>

      {catalogs.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-navy">แคตตาล็อก</h2>
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
    </div>
  );
}
