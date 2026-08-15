import Image from "next/image";
import Link from "next/link";
import type { PillarHubItem } from "@/lib/product-catalog";

export function ProductHeroCovers({ items }: { items: PillarHubItem[] }) {
  if (items.length === 0) return null;

  const loop = items.length === 1 ? [items[0], items[0]] : [...items, ...items];

  return (
    <div
      className="relative h-64 w-full overflow-hidden sm:h-[32rem]"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 18%, black 72%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 18%, black 72%, transparent 100%)",
      }}
    >
      <div className="animate-cover-marquee-up flex flex-col gap-3">
        {loop.map((item, i) => (
          <Link
            key={`${item.href}-${i}`}
            href={item.href}
            className="group relative block overflow-hidden rounded-2xl ring-1 ring-white/20"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="240px"
              />
            </div>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-3 pb-2.5 pt-8 text-white">
              <span className="line-clamp-1 text-xs font-medium">{item.name}</span>
              {item.nameEn ? (
                <span className="mt-0.5 block truncate text-[11px] text-white/75">
                  {item.nameEn}
                </span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
