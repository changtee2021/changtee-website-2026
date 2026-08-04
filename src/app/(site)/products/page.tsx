import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { productCatalog } from "@/lib/product-catalog";
import { homeProductTiles } from "@/lib/mock-content";

export const metadata: Metadata = {
  title: "สินค้าและบริการ",
  description: "ผ้าม่าน ม่านม้วน มู่ลี่ ฉากกั้นห้อง ม่านไฟฟ้า และบริการครบวงจร",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-navy">สินค้าและบริการช่างตี๋</h1>
      <div className="mt-2 h-1 w-16 bg-brand-red" />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {homeProductTiles.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center rounded-lg border border-line p-3 hover:border-navy hover:bg-paper"
          >
            <div className="relative h-28 w-full">
              <Image src={item.image} alt={item.name} fill className="object-contain" sizes="180px" />
            </div>
            <div className="mt-2 text-sm font-semibold text-navy">{item.name}</div>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {productCatalog.map((cat) => (
          <div key={cat.slug} className="rounded-lg border border-line p-5">
            <Link
              href={`/products/${cat.slug}`}
              className="font-display text-xl font-semibold text-navy hover:text-brand-red"
            >
              {cat.name}
            </Link>
            <p className="mt-1 text-sm text-muted">{cat.summary}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {cat.children.map((child) => (
                <li key={child.slug}>
                  <Link
                    href={`/products/${cat.slug}/${child.slug}`}
                    className="text-sm text-ink hover:text-brand-red"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
