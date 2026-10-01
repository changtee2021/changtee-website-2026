"use client";

import Image from "next/image";
import Link from "next/link";
import { HomePanel } from "@/components/home/HomePanel";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";
import { HOME_SECTION_DEFAULTS_EN } from "@/lib/i18n/cms-en";
import { useCmsText } from "@/lib/i18n/use-cms-text";

/** Older portrait files saved in demo store map to the wide photo set. */
const LEGACY_TILE_IMAGE: Record<string, string> = {
  "/images/home/products/01-curtain.png": "/images/home/products/wide-curtain.jpg",
  "/images/home/products/02-roller.png": "/images/home/products/wide-roller.jpg",
  "/images/home/products/03-wood.png": "/images/home/products/wide-wood.jpg",
  "/images/home/products/08-aluminium.png": "/images/home/products/wide-aluminum.jpg",
  "/images/home/products/04-vertical.png": "/images/home/products/wide-vertical.jpg",
  "/images/home/products/05-folding.png": "/images/home/products/wide-folding.jpg",
  "/images/home/products/06-noren.png": "/images/home/products/wide-print.jpg",
  "/images/home/products/07-wallpaper.png": "/images/home/products/wide-wallpaper.jpg",
  "/images/home/products/real-curtain.jpg": "/images/home/products/wide-curtain.jpg",
  "/images/home/products/real-roller.jpg": "/images/home/products/wide-roller.jpg",
  "/images/home/products/real-wood.jpg": "/images/home/products/wide-wood.jpg",
  "/images/home/products/real-aluminum.jpg": "/images/home/products/wide-aluminum.jpg",
  "/images/home/products/real-vertical.jpg": "/images/home/products/wide-vertical.jpg",
  "/images/home/products/real-folding.jpg": "/images/home/products/wide-folding.jpg",
  "/images/home/products/real-print.jpg": "/images/home/products/wide-print.jpg",
  "/images/home/products/real-wallpaper.jpg": "/images/home/products/wide-wallpaper.jpg",
};

const TILE_EN = [
  "Curtain",
  "Roller Blinds",
  "Wooden Venetian Blinds",
  "Aluminium Venetian Blinds",
  "Vertical Blinds",
  "Folding Door",
  "Print Curtain",
  "Wallpaper",
];

function tileImage(src: string) {
  return LEGACY_TILE_IMAGE[src] ?? src;
}

export function ProductGrid() {
  const { values, enabled } = useSectionValues(
    "home",
    "products",
    HOME_SECTION_DEFAULTS.products,
  );
  const { field } = useCmsText("products", values);
  if (!enabled) return null;

  const tiles = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
    const name = field(`tile${n}Name`);
    const thai =
      HOME_SECTION_DEFAULTS.products[`tile${n}Name`] ?? name;
    const english =
      TILE_EN[n - 1] ??
      HOME_SECTION_DEFAULTS_EN.products[`tile${n}Name`] ??
      "";
    return {
      n,
      name,
      thai,
      english,
      href: values[`tile${n}Href`] ?? "/products",
      image: tileImage(
        values[`tile${n}Image`] ??
          HOME_SECTION_DEFAULTS.products[`tile${n}Image`] ??
          "",
      ),
    };
  });

  return (
    <HomePanel tone="clear" sectionClassName="z-20">
      <div className="px-1 py-8 sm:px-2 sm:py-10 md:py-12">
        <div className="flex flex-col gap-2 sm:gap-3">
          {[tiles.slice(0, 4), tiles.slice(4)].map((row) => (
            <div key={row[0]?.n} className="category-pop-row">
              {row.map((item) => (
                <EditableSpot
                  key={`tile-${item.n}`}
                  sectionId="products"
                  fieldKey={`tile${item.n}Image`}
                  label="รูป"
                  className="category-pop-slot"
                >
                  <Link
                    href={item.href}
                    className="category-pop-card group relative block overflow-hidden rounded-md"
                    aria-label={item.name}
                    onClick={(e) => {
                      // In preview, let EditableSpot handle clicks
                      if (
                        typeof window !== "undefined" &&
                        window.parent !== window
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      width={1600}
                      height={900}
                      loading={item.n <= 4 ? "eager" : "lazy"}
                      className="category-pop-photo"
                      sizes="(max-width: 640px) 70vw, 50vw"
                    />
                    <span className="category-pop-label pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pb-3 pt-10">
                      <span className="category-pop-th block text-sm font-semibold leading-tight text-white">
                        {item.thai}
                      </span>
                      {item.english ? (
                        <span className="category-pop-en mt-0.5 block text-[11px] font-normal leading-tight text-white/85">
                          {item.english}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </EditableSpot>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <EditableSpot
            sectionId="products"
            fieldKey="allLinkLabel"
            label="ลิงก์ดูทั้งหมด"
            className="w-auto"
          >
            <Link
              href="/products"
              className="text-sm font-semibold text-brand-red hover:underline"
              onClick={(e) => {
                if (typeof window !== "undefined" && window.parent !== window) {
                  e.preventDefault();
                }
              }}
            >
              {field("allLinkLabel")}
            </Link>
          </EditableSpot>
        </div>
      </div>
    </HomePanel>
  );
}
