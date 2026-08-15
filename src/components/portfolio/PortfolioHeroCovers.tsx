import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { PortfolioItem } from "@/lib/cms/portfolio-demo";

/** Same card count / pace as the products hub hero (~13 covers, 70s). */
const HERO_COVER_LIMIT = 13;

export function PortfolioHeroCovers({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) return null;

  const featured = [...items]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.sortOrder - b.sortOrder)
    .slice(0, HERO_COVER_LIMIT);
  const loop =
    featured.length === 1 ? [featured[0], featured[0]] : [...featured, ...featured];

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
            key={`${item.id}-${i}`}
            href={`/portfolio/${item.slug}`}
            className="group relative block overflow-hidden rounded-2xl ring-1 ring-white/20"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="240px"
              />
            </div>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-3 pb-2.5 pt-8 text-white">
              <span className="line-clamp-1 text-xs font-medium">{item.title}</span>
              {item.place ? (
                <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-white/90">
                  <MapPin className="size-3 shrink-0 opacity-80" aria-hidden />
                  <span className="truncate">{item.place}</span>
                </span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
