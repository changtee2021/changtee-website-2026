export type ProductCatalogFile = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  href: string;
  /** Cover thumbnail (PDF first page / ภาพปก) */
  coverImage: string;
  productHref: string;
  categorySlug: string;
  productSlug?: string;
};

/** Downloadable product catalogs hosted under /public/catalog */
export const productCatalogs: ProductCatalogFile[] = [
  {
    id: "wooden-blinds",
    title: "แคตตาล็อกมู่ลี่ไม้",
    titleEn: "Wooden Blinds Catalog",
    description:
      "รวมแบบสีและรายละเอียดมู่ลี่ไม้ช่างตี๋ — ดาวน์โหลดดูตัวอย่างก่อนขอใบเสนอราคา",
    href: "/catalog/wooden-blinds.pdf",
    coverImage: "/images/catalogs/wooden-blinds-cover.png",
    productHref: "/products/venetian-blinds/wood",
    categorySlug: "venetian-blinds",
    productSlug: "wood",
  },
];

export function getCatalogsForCategory(categorySlug: string) {
  return productCatalogs.filter((c) => c.categorySlug === categorySlug);
}

export function getCatalogForProduct(categorySlug: string, productSlug: string) {
  return productCatalogs.find(
    (c) => c.categorySlug === categorySlug && c.productSlug === productSlug,
  );
}
