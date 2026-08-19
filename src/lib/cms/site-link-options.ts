import { productCatalog } from "@/lib/product-catalog";

export type SiteLinkOption = {
  value: string;
  label: string;
  group: string;
};

/** Internal pages for CMS link dropdowns. */
export const SITE_LINK_OPTIONS: SiteLinkOption[] = [
  { group: "หลัก", value: "/", label: "หน้าแรก" },
  { group: "หลัก", value: "/products", label: "สินค้าและบริการ" },
  { group: "หลัก", value: "/portfolio", label: "ผลงาน" },
  { group: "หลัก", value: "/blog", label: "บทความ" },
  { group: "หลัก", value: "/quote", label: "ขอใบเสนอราคา" },
  { group: "หลัก", value: "/learn", label: "ห้องเรียนรู้" },
  { group: "หลัก", value: "/contact", label: "เกี่ยวกับเรา" },
  { group: "หลัก", value: "/visit-factory", label: "นัดเยี่ยมชมโรงงาน" },
  { group: "หลัก", value: "/visit-factory?mode=presentation", label: "นัดนำเสนอสินค้า" },
  { group: "หลัก", value: "/careers", label: "ร่วมงานกับเรา" },
  ...productCatalog.flatMap((cat) => [
    {
      group: "สินค้า",
      value: `/products/${cat.slug}`,
      label: cat.name,
    },
    ...cat.children.map((child) => ({
      group: "สินค้า",
      value: `/products/${cat.slug}/${child.slug}`,
      label: `${cat.name} · ${child.name}`,
    })),
  ]),
];

export const CUSTOM_LINK_VALUE = "__custom__";

export function isKnownSiteLink(href: string): boolean {
  return SITE_LINK_OPTIONS.some((o) => o.value === href);
}

export function linkLabel(href: string): string {
  return SITE_LINK_OPTIONS.find((o) => o.value === href)?.label ?? href;
}
