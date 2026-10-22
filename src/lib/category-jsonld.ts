import { LOCALE_META, localizedHref, type Locale } from "@/lib/i18n/locale";
import { productCatalog, type ProductCategory } from "@/lib/product-catalog";
import { siteConfig } from "@/lib/site-config";

function pageUrl(base: string, locale: Locale, path: string): string {
  const href = localizedHref(locale, path);
  return href === "/" ? `${base}/` : `${base}${href}`;
}

/** CollectionPage + ItemList of every category for the /products hub. */
export function getProductsHubJsonLd(locale: Locale = "th"): Record<string, unknown> {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = pageUrl(base, locale, "/products");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        name: "สินค้าและบริการ",
        url,
        inLanguage: LOCALE_META[locale].hreflang,
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
            url: pageUrl(base, locale, `/products/${category.slug}`),
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: pageUrl(base, locale, "/") },
          { "@type": "ListItem", position: 2, name: "สินค้า/บริการ", item: url },
        ],
      },
    ],
  };
}

/** BreadcrumbList JSON-LD for a product category hub page. */
export function getCategoryJsonLd(
  category: ProductCategory,
  locale: Locale = "th",
): Record<string, unknown> {
  const base = siteConfig.url.replace(/\/$/, "");
  const categoryUrl = pageUrl(base, locale, `/products/${category.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${categoryUrl}#page`,
        name: category.name,
        description: category.summary,
        url: categoryUrl,
        inLanguage: LOCALE_META[locale].hreflang,
        isPartOf: { "@id": `${base}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: pageUrl(base, locale, "/") },
          {
            "@type": "ListItem",
            position: 2,
            name: "สินค้า/บริการ",
            item: pageUrl(base, locale, "/products"),
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
