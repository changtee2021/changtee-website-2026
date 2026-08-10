import { readCmsCollection } from "@/lib/cms/cms-server";
import {
  isPublishedCatalog,
  productCatalogs,
  type ProductCatalogFile,
} from "@/lib/catalogs";
import { normalizeCatalog, type CatalogItem } from "@/lib/cms/catalogs-demo";

export async function loadPublishedCatalogs(): Promise<ProductCatalogFile[]> {
  const remote = await readCmsCollection<CatalogItem>("catalogs");
  const items =
    Array.isArray(remote) && remote.length > 0
      ? remote.map((item) => normalizeCatalog(item))
      : productCatalogs.map((c) => normalizeCatalog({ ...c, id: c.id }));
  return items
    .filter(isPublishedCatalog)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
}

export async function loadCatalogsForCategory(categorySlug: string) {
  return (await loadPublishedCatalogs()).filter(
    (c) => c.categorySlug === categorySlug,
  );
}

export async function loadCatalogForProduct(
  categorySlug: string,
  productSlug: string,
) {
  return (await loadPublishedCatalogs()).find(
    (c) => c.categorySlug === categorySlug && c.productSlug === productSlug,
  );
}
