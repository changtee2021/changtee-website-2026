"use client";

import Image from "next/image";
import Link from "next/link";
import { HomePanel } from "@/components/home/HomePanel";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";

export function ProductGrid() {
  const { values, enabled } = useSectionValues(
    "home",
    "products",
    HOME_SECTION_DEFAULTS.products,
  );
  if (!enabled) return null;

  const tiles = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    n,
    name: values[`tile${n}Name`] ?? "",
    href: values[`tile${n}Href`] ?? "/products",
    image:
      values[`tile${n}Image`] ??
      HOME_SECTION_DEFAULTS.products[`tile${n}Image`],
  }));

  return (
    <HomePanel tone="clear">
      <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {tiles.map((item, i) => (
            <EditableSpot
              key={`tile-${item.n}`}
              sectionId="products"
              fieldKey={`tile${item.n}Image`}
              label="รูป"
            >
              <Link
                href={item.href}
                className="group relative block aspect-[716/1024] overflow-hidden rounded-md"
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
                  alt={item.name}
                  fill
                  loading={i < 4 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 45vw, 220px"
                />
              </Link>
            </EditableSpot>
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
              {values.allLinkLabel}
            </Link>
          </EditableSpot>
        </div>
      </div>
    </HomePanel>
  );
}
