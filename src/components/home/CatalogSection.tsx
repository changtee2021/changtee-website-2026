import Link from "next/link";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { productCatalogs } from "@/lib/catalogs";

export function CatalogSection() {
  if (productCatalogs.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy md:text-3xl">
              แคตตาล็อกสินค้า
            </h2>
            <div className="mt-2 h-1 w-16 bg-brand-red" />
            <p className="mt-3 max-w-xl text-sm text-muted">
              ดาวน์โหลดแคตตาล็อกดูแบบสีและรายละเอียดก่อนปรึกษาทีมงาน
            </p>
          </div>
          <Link
            href="/products/venetian-blinds/wood"
            className="hidden text-sm font-semibold text-brand-red hover:underline sm:inline"
          >
            มู่ลี่ไม้
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {productCatalogs.map((catalog) => (
            <CatalogCard key={catalog.id} catalog={catalog} />
          ))}
        </div>
      </div>
    </section>
  );
}
