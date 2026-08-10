import type { ProductCategory } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";

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
