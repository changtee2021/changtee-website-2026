import type { ContentStatus } from "@/lib/cms/content-status";
import { productCatalogs, type ProductCatalogFile } from "@/lib/catalogs";

export type CatalogItem = ProductCatalogFile & {
  status: ContentStatus;
  sortOrder: number;
  updatedAt: string;
};

export const DEMO_CATALOGS: CatalogItem[] = productCatalogs.map((c, i) => ({
  ...c,
  status: c.status ?? "published",
  sortOrder: c.sortOrder ?? i + 1,
  updatedAt: c.updatedAt ?? new Date().toISOString(),
  manifestUrl: c.manifestUrl ?? `/catalog/${c.id}/manifest.json`,
}));

export function emptyCatalog(): CatalogItem {
  const id = `catalog-${Date.now().toString(36)}`;
  return {
    id,
    title: "",
    titleEn: "",
    description: "",
    href: "",
    coverImage: "",
    productHref: "/products",
    categorySlug: "venetian-blinds",
    productSlug: "",
    manifestUrl: "",
    status: "draft",
    sortOrder: 99,
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeCatalog(item: Partial<CatalogItem> & { id: string }): CatalogItem {
  return {
    id: item.id,
    title: item.title ?? "",
    titleEn: item.titleEn ?? "",
    description: item.description ?? "",
    href: item.href ?? "",
    coverImage: item.coverImage ?? "",
    productHref: item.productHref ?? "/products",
    categorySlug: item.categorySlug ?? "",
    productSlug: item.productSlug || undefined,
    manifestUrl: item.manifestUrl || undefined,
    status: item.status ?? "draft",
    sortOrder: item.sortOrder ?? 99,
    updatedAt: item.updatedAt ?? new Date().toISOString(),
  };
}
