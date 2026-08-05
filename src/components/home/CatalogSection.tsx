import { HomePanel, PanelHeading } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { productCatalogs } from "@/lib/catalogs";

export function CatalogSection() {
  if (productCatalogs.length === 0) return null;

  return (
    <HomePanel>
      <div className="p-7 sm:p-9 md:p-12">
        <PanelHeading
          title="แคตตาล็อกสินค้า"
          subtitle="โหลดไปดูแบบสีและรายละเอียดก่อนได้ ไม่ต้องรีบตัดสินใจ"
          align="start"
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {productCatalogs.map((catalog, i) => (
            <Reveal key={catalog.id} delayStep={i}>
              <CatalogCard catalog={catalog} />
            </Reveal>
          ))}
        </div>
      </div>
    </HomePanel>
  );
}
