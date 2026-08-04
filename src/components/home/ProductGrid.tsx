import Image from "next/image";
import Link from "next/link";
import { homeProductTiles } from "@/lib/mock-content";

export function ProductGrid() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-2xl font-bold text-navy md:text-3xl">
          สินค้าและบริการช่างตี๋
        </h2>
        <div className="mx-auto mt-2 h-1 w-16 bg-brand-red" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {homeProductTiles.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block overflow-hidden transition hover:opacity-90"
              aria-label={item.name}
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain transition group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, 220px"
                />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/products" className="text-sm font-semibold text-brand-red hover:underline">
            ดูสินค้าทั้งหมด
          </Link>
        </div>
      </div>
    </section>
  );
}
