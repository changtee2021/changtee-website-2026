"use client";

import Image from "next/image";
import Link from "next/link";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
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
    name: values[`tile${n}Name`] ?? "",
    href: values[`tile${n}Href`] ?? "/products",
    image: values[`tile${n}Image`] ?? HOME_SECTION_DEFAULTS.products[`tile${n}Image`],
  }));

  return (
    <HomePanel tone="clear">
      <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {tiles.map((item, i) => (
            <Reveal key={`${item.href}-${i}`} delayStep={i}>
              <Link
                href={item.href}
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl"
                aria-label={item.name}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  loading={i < 4 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 45vw, 220px"
                />
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/products"
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            {values.allLinkLabel}
          </Link>
        </div>
      </div>
    </HomePanel>
  );
}
