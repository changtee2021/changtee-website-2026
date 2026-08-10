import type { ContentStatus } from "@/lib/cms/content-status";

export type ProductCatalogFile = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  /** Downloadable PDF URL (public/ or Supabase Storage). */
  href: string;
  /** Cover thumbnail (PDF first page / ภาพปก) */
  coverImage: string;
  productHref: string;
  categorySlug: string;
  productSlug?: string;
  /**
   * Absolute or relative URL to the flipbook manifest.json.
   * When set, the online viewer loads pre-rendered page images from it
   * instead of parsing the PDF in the browser.
   */
  manifestUrl?: string;
  status?: ContentStatus;
  sortOrder?: number;
  updatedAt?: string;
};

/** Seed / fallback catalogs shipped with the site (also used when CMS is empty). */
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
    manifestUrl: "/catalog/wooden-blinds/manifest.json",
    status: "published",
    sortOrder: 1,
  },
];

export function isPublishedCatalog(c: ProductCatalogFile): boolean {
  return (c.status ?? "published") === "published";
}

export function getCatalogsForCategory(categorySlug: string) {
  return productCatalogs.filter(
    (c) => c.categorySlug === categorySlug && isPublishedCatalog(c),
  );
}

export function getCatalogForProduct(categorySlug: string, productSlug: string) {
  return productCatalogs.find(
    (c) =>
      c.categorySlug === categorySlug &&
      c.productSlug === productSlug &&
      isPublishedCatalog(c),
  );
}
