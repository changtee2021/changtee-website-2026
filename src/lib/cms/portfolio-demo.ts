import type { ContentStatus } from "@/lib/cms/content-status";
import { productCatalog } from "@/lib/product-catalog";

export type SpaceType = "home" | "condo" | "office" | "cafe" | "corp";

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  home: "บ้าน",
  condo: "คอนโด",
  office: "สำนักงาน",
  cafe: "คาเฟ่ / ร้าน",
  corp: "องค์กร",
};

export type PortfolioItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  detail: string;
  place: string;
  productSlug: string;
  spaceType: SpaceType;
  tags: string[];
  image: string;
  gallery: string[];
  status: ContentStatus;
  pinned: boolean;
  sortOrder: number;
  updatedAt: string;
};

export const PRODUCT_OPTIONS = productCatalog.map((c) => ({
  value: c.slug,
  label: c.name,
}));

export function productLabel(slug: string): string {
  return PRODUCT_OPTIONS.find((p) => p.value === slug)?.label ?? slug;
}

export const DEMO_PORTFOLIO: PortfolioItem[] = [
  {
    id: "pf-1",
    title: "ม่านม้วนสำนักงาน",
    slug: "roller-office-latkrabang",
    summary: "ม่านม้วนสวย เรียบหรู มีทั้งโปร่งแสงและทึบแสง",
    detail: "ติดตั้งม่านม้วน sunscreen + blackout ในออฟฟิศ คุมแสงจอคอมชัด ดูแลง่าย",
    place: "ลาดกระบัง กรุงเทพฯ",
    productSlug: "roller-blinds",
    spaceType: "office",
    tags: ["ม่านม้วน", "sunscreen"],
    image: "/images/mock/blinds-office.jpg",
    gallery: ["/images/mock/blinds-office.jpg"],
    status: "published",
    pinned: true,
    sortOrder: 1,
    updatedAt: "2026-07-28T10:00:00+07:00",
  },
  {
    id: "pf-2",
    title: "ผ้าม่านลอนเทปทั้งหลัง",
    slug: "curtain-swave-rama5",
    summary: "ผ้าโปร่ง-ผ้าทึบ คุมโทนทั้งบ้าน งานสวยเรียบหรู",
    detail: "ม่านลอนเทปชั้นคู่ ทั้งบ้าน โทนครีมอบอุ่น เหมาะบ้านสไตล์โมเดิร์น",
    place: "พระราม 5 นนทบุรี",
    productSlug: "curtain",
    spaceType: "home",
    tags: ["ผ้าม่าน", "ลอนเทป"],
    image: "/images/mock/curtain-living.jpg",
    gallery: ["/images/mock/curtain-living.jpg"],
    status: "published",
    pinned: true,
    sortOrder: 2,
    updatedAt: "2026-07-20T14:00:00+07:00",
  },
  {
    id: "pf-3",
    title: "ม่านม้วน Sunscreen คาเฟ่",
    slug: "roller-cafe-inthanon",
    summary: "เปลี่ยนบรรยากาศร้านกาแฟให้โมเดิร์น กรองแสงสวย",
    detail: "ม่านม้วน sunscreen โทนเทา คาเฟ่เปิดโล่ง ลดแดดไม่ทึบจนมืด",
    place: "บางกรวย นนทบุรี",
    productSlug: "roller-blinds",
    spaceType: "cafe",
    tags: ["ม่านม้วน", "คาเฟ่"],
    image: "/images/mock/roller-cafe.jpg",
    gallery: ["/images/mock/roller-cafe.jpg"],
    status: "published",
    pinned: false,
    sortOrder: 3,
    updatedAt: "2026-07-12T09:00:00+07:00",
  },
  {
    id: "pf-4",
    title: "ผลงานติดตั้งองค์กร",
    slug: "corp-project-blinds",
    summary: "งานติดตั้งระดับองค์กร เน้นคุณภาพและความตรงต่อเวลา",
    detail: "โปรเจกต์องค์กรหลายชั้น ม่านปรับแสง + ม่านม้วน คุมมาตรฐานเดียวกันทั้งอาคาร",
    place: "โปรเจกต์องค์กร",
    productSlug: "vertical-blinds",
    spaceType: "corp",
    tags: ["องค์กร", "ม่านปรับแสง"],
    image: "/images/mock/portfolio-1.png",
    gallery: ["/images/mock/portfolio-1.png"],
    status: "draft",
    pinned: false,
    sortOrder: 4,
    updatedAt: "2026-08-01T11:00:00+07:00",
  },
];

export function emptyPortfolio(): PortfolioItem {
  return {
    id: `pf-${Date.now()}`,
    title: "",
    slug: "",
    summary: "",
    detail: "",
    place: "",
    productSlug: PRODUCT_OPTIONS[0]?.value ?? "curtain",
    spaceType: "home",
    tags: [],
    image: "/images/mock/curtain-living.jpg",
    gallery: [],
    status: "draft",
    pinned: false,
    sortOrder: 99,
    updatedAt: new Date().toISOString(),
  };
}
