"use client";

import { HomePanel, PanelHeading } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { isPublishedCatalog } from "@/lib/catalogs";
import { useCatalogs } from "@/lib/cms/demo-store";

export function CatalogSection() {
  const catalogs = useCatalogs()
    .filter(isPublishedCatalog)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));

  if (catalogs.length === 0) return null;

  return (
    <HomePanel tone="clear">
      <div className="py-7 sm:py-9 md:py-12">
        <PanelHeading title="แคตตาล็อกสินค้า" align="start" />

        <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-1">
          {catalogs.map((catalog, i) => (
            <Reveal
              key={catalog.id}
              delayStep={i}
              className="w-[78vw] shrink-0 sm:w-[300px]"
            >
              <CatalogCard catalog={catalog} />
            </Reveal>
          ))}
        </div>
      </div>
    </HomePanel>
  );
}
