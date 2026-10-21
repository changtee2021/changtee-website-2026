import { productCatalog, type ProductCategory } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";

/** CollectionPage + ItemList of every category for the /products hub. */
export function getProductsHubJsonLd(): Record<string, unknown> {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/products`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        name: "สินค้าและบริการ",
        url,
        inLanguage: "th-TH",
        isPartOf: { "@id": `${base}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: productCatalog.length,
          itemListElement: productCatalog.map((category, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: category.nameEn
              ? `${category.name} (${category.nameEn})`
              : category.name,
            description: category.summary,
            url: `${base}/products/${category.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: base },
          { "@type": "ListItem", position: 2, name: "สินค้า/บริการ", item: url },
        ],
      },
    ],
  };
}

/** BreadcrumbList JSON-LD for a product category hub page. */
export function getCategoryJsonLd(category: ProductCategory): Record<string, unknown> {
  const base = siteConfig.url.replace(/\/$/, "");
  const categoryUrl = `${base}/products/${category.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${categoryUrl}#page`,
        name: category.name,
        description: category.summary,
        url: categoryUrl,
        inLanguage: "th-TH",
        isPartOf: { "@id": `${base}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: base },
          {
            "@type": "ListItem",
            position: 2,
            name: "สินค้า/บริการ",
            item: `${base}/products`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: categoryUrl,
          },
        ],
      },
    ],
  };
}
