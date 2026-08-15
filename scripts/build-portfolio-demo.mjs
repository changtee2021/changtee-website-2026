import { readFileSync, writeFileSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync(
    new URL("../.tmp-profile/portfolio-manifest.json", import.meta.url),
    "utf8",
  ),
);

const pinned = new Set([
  "roller-don-mueang",
  "hospital-chulabhorn",
  "pleat-patio-apartment",
  "roller-teenoi-songprapa",
  "print-buriram-arena-2025",
]);
const hideName = new Set(["roman-khun-sun"]);

const jobs = manifest.map((j, idx) => ({
  id: `pf-cp-${String(j.page).padStart(3, "0")}`,
  title: j.title,
  slug: j.slug,
  summary: j.summary,
  detail: j.detail,
  place: j.place,
  productSlug: j.productSlug,
  spaceType: j.spaceType,
  tags: j.tags,
  image: j.image,
  gallery: j.gallery,
  status: "published",
  pinned: pinned.has(j.slug),
  sortOrder: idx + 1,
  customerName: j.customerName,
  showCustomerName: !hideName.has(j.slug),
  installLocation: j.installLocation,
  installDate: "2026",
  lineItems: j.code
    ? [
        {
          productName: j.tags[0] || j.title,
          sku: j.code,
          serialOrCode: "",
          material: "",
          color: "",
          quantity: "",
          notes: "",
        },
      ]
    : [],
  updatedAt: "2026-08-15T12:00:00+07:00",
}));

writeFileSync(
  new URL("../.tmp-profile/portfolio-jobs.json", import.meta.url),
  JSON.stringify(jobs, null, 2),
);
console.log("jobs", jobs.length);
