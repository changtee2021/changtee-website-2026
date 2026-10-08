import { siteConfig, socialSameAsUrls } from "@/lib/site-config";
import {
  brandFaqJsonLd,
  brandKnowsAbout,
  brandOfferCatalog,
} from "@/lib/brand-facts";

/** LocalBusiness + Organization JSON-LD for homepage / root SEO. */
export function getLocalBusinessJsonLd(): Record<string, unknown> {
  const base = siteConfig.url.replace(/\/$/, "");
  const telephone = siteConfig.saleContacts[0]?.phoneTel
    ? `+66${siteConfig.saleContacts[0].phoneTel.replace(/^0/, "")}`
    : undefined;
  const sameAs = socialSameAsUrls();
  const alternateNames = [siteConfig.name, siteConfig.nameEn, "ช่างตี๋", "Changtee"];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: siteConfig.legalName,
        alternateName: alternateNames,
        url: base,
        logo: `${base}/images/brand/logo-mark.png`,
        slogan: siteConfig.concept,
        description: siteConfig.description,
        knowsAbout: brandKnowsAbout,
        email: siteConfig.emailTo,
        telephone,
        brand: {
          "@type": "Brand",
          "@id": `${base}/#brand`,
          name: siteConfig.name,
          alternateName: siteConfig.nameEn,
          slogan: siteConfig.concept,
          logo: `${base}/images/brand/logo-mark.png`,
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone,
            areaServed: "TH",
            availableLanguage: ["th", "en"],
          },
        ],
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${base}/#localbusiness`,
        name: siteConfig.name,
        alternateName: alternateNames,
        description: siteConfig.description,
        slogan: siteConfig.concept,
        url: base,
        image: `${base}/images/brand/logo.png`,
        telephone,
        email: siteConfig.emailTo,
        priceRange: "฿฿",
        areaServed: { "@type": "Country", name: "Thailand" },
        knowsAbout: brandKnowsAbout,
        brand: { "@id": `${base}/#brand` },
        hasOfferCatalog: brandOfferCatalog(base),
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
        ...(sameAs.length ? { sameAs } : {}),
        parentOrganization: { "@id": `${base}/#organization` },
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: siteConfig.name,
        alternateName: siteConfig.nameEn,
        publisher: { "@id": `${base}/#organization` },
        inLanguage: ["th-TH", "en"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      brandFaqJsonLd(base),
    ],
  };
}
