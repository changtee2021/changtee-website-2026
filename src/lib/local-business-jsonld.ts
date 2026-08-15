import { siteConfig, socialSameAsUrls } from "@/lib/site-config";

/** LocalBusiness + Organization JSON-LD for homepage / root SEO. */
export function getLocalBusinessJsonLd(): Record<string, unknown> {
  const base = siteConfig.url.replace(/\/$/, "");
  const telephone = siteConfig.saleContacts[0]?.phoneTel
    ? `+66${siteConfig.saleContacts[0].phoneTel.replace(/^0/, "")}`
    : undefined;
  const sameAs = socialSameAsUrls();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: siteConfig.legalName,
        alternateName: [siteConfig.name, siteConfig.nameEn],
        url: base,
        logo: `${base}/images/brand/logo-mark.png`,
        email: siteConfig.emailTo,
        telephone,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${base}/#localbusiness`,
        name: siteConfig.name,
        alternateName: siteConfig.nameEn,
        description: siteConfig.description,
        url: base,
        image: `${base}/images/brand/logo.png`,
        telephone,
        email: siteConfig.emailTo,
        priceRange: "฿฿",
        address: {
          "@type": "PostalAddress",
          streetAddress: `${siteConfig.address.line1} ${siteConfig.address.line2}`,
          addressLocality: "คลองสามวา",
          addressRegion: "กรุงเทพมหานคร",
          postalCode: "10510",
          addressCountry: "TH",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: siteConfig.mapsLat,
          longitude: siteConfig.mapsLng,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "20:00",
        },
        hasMap: siteConfig.mapsUrl,
        parentOrganization: { "@id": `${base}/#organization` },
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: siteConfig.name,
        publisher: { "@id": `${base}/#organization` },
        inLanguage: "th-TH",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
