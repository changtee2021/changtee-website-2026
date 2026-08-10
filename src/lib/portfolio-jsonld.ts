import type { PortfolioItem } from "@/lib/cms/portfolio-demo";
import { hasPortfolioSpecs, productLabel } from "@/lib/cms/portfolio-demo";
import { siteConfig } from "@/lib/site-config";

function abs(base: string, src: string): string {
  if (!src) return `${base}/images/brand/logo.png`;
  return src.startsWith("http")
    ? src
    : `${base}${src.startsWith("/") ? src : `/${src}`}`;
}

/** CreativeWork + BreadcrumbList for a portfolio detail page. */
export function getPortfolioJsonLd(item: PortfolioItem): Record<string, unknown> {
  const base = siteConfig.url.replace(/\/$/, "");
  const url = `${base}/portfolio/${item.slug}`;
  const images = (item.gallery.length ? item.gallery : [item.image])
    .filter(Boolean)
    .map((src) => abs(base, src));
  const description =
    item.seoDescription?.trim() || item.summary || item.detail;
  const headline = item.seoTitle?.trim() || item.title;

  const additionalProperty = item.lineItems
    .filter((r) => r.productName.trim() || r.sku.trim())
    .flatMap((r, i) => {
      const prefix = r.productName.trim() || `สินค้า ${i + 1}`;
      const props: { "@type": "PropertyValue"; name: string; value: string }[] =
        [];
      if (r.sku.trim())
        props.push({
          "@type": "PropertyValue",
          name: `${prefix} — SKU`,
          value: r.sku.trim(),
        });
      if (r.serialOrCode.trim())
        props.push({
          "@type": "PropertyValue",
          name: `${prefix} — Serial`,
          value: r.serialOrCode.trim(),
        });
      if (r.material.trim())
        props.push({
          "@type": "PropertyValue",
          name: `${prefix} — วัสดุ`,
          value: r.material.trim(),
        });
      if (r.color.trim())
        props.push({
          "@type": "PropertyValue",
          name: `${prefix} — สี`,
          value: r.color.trim(),
        });
      return props;
    });

  const work: Record<string, unknown> = {
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: headline,
    headline,
    description,
    image: images,
    url,
    inLanguage: "th-TH",
    dateModified: item.updatedAt || undefined,
    about: productLabel(item.productSlug),
    contentLocation: {
      "@type": "Place",
      name: item.place,
      ...(item.installLocation.trim()
        ? { description: item.installLocation.trim() }
        : {}),
    },
    creator: {
      "@type": "Organization",
      name: siteConfig.name,
      url: base,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: siteConfig.legalName,
      url: base,
      logo: {
        "@type": "ImageObject",
        url: `${base}/images/brand/logo-mark.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  if (item.showCustomerName && item.customerName.trim()) {
    work.contributor = {
      "@type": "Person",
      name: item.customerName.trim(),
    };
  }

  if (hasPortfolioSpecs(item) && additionalProperty.length > 0) {
    work.additionalProperty = additionalProperty;
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      work,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "หน้าแรก", item: base },
          {
            "@type": "ListItem",
            position: 2,
            name: "ผลงาน",
            item: `${base}/portfolio`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: item.title,
            item: url,
          },
        ],
      },
    ],
  };
}
