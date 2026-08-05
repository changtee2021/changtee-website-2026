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
    image: "/images/generated/ct-pf-office.webp",
    gallery: ["/images/generated/ct-pf-office.webp"],
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
    image: "/images/generated/ct-pf-home.webp",
    gallery: ["/images/generated/ct-pf-home.webp"],
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
    image: "/images/generated/ct-pf-cafe.webp",
    gallery: ["/images/generated/ct-pf-cafe.webp"],
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
    sortOrder: 5,
    updatedAt: "2026-08-01T11:00:00+07:00",
  },
  {
    id: "pf-5",
    title: "ผ้าม่านทึบแสงห้องนอนคอนโด",
    slug: "blackout-condo-ratchada",
    summary: "หลับสบายกลางเมือง ม่านทึบแสงคู่ผ้าโปร่ง คุมแสงได้ทั้งวัน",
    detail:
      "ห้องนอนคอนโดชั้นสูง ติดม่านทึบแสงคู่กับผ้าโปร่ง เลือกโทนเทาให้เข้ากับผนังและเฟอร์นิเจอร์ ปิดแล้วมืดสนิท เปิดแล้วยังได้วิวเมือง",
    place: "รัชดาภิเษก กรุงเทพฯ",
    productSlug: "curtain",
    spaceType: "condo",
    tags: ["ผ้าม่าน", "ทึบแสง", "คอนโด"],
    image: "/images/generated/ct-pf-condo.webp",
    gallery: ["/images/generated/ct-pf-condo.webp"],
    status: "published",
    pinned: false,
    sortOrder: 4,
    updatedAt: "2026-08-04T09:00:00+07:00",
  },
  {
    id: "pf-6",
    title: "มู่ลี่ไม้โทนอบอุ่น บ้านพักอาศัย",
    slug: "venetian-wood-home-bangna",
    summary: "มู่ลี่ไม้ปรับองศาแสง โทนไม้เข้ากับเฟอร์นิเจอร์",
    detail: "ติดตั้งมู่ลี่ไม้ห้องนั่งเล่น ปรับองศาคุมแสงได้ละเอียด โทนอบอุ่น",
    place: "บางนา กรุงเทพฯ",
    productSlug: "venetian-blinds",
    spaceType: "home",
    tags: ["มู่ลี่ไม้", "บ้าน"],
    image: "/images/products/context/venetian-blinds/living.png",
    gallery: [
      "/images/products/context/venetian-blinds/living.png",
      "/images/products/detail/venetian-blinds/wood.png",
    ],
    status: "published",
    pinned: false,
    sortOrder: 6,
    updatedAt: "2026-08-03T10:00:00+07:00",
  },
  {
    id: "pf-7",
    title: "ฉากกั้นห้องคอนโด กั้นแอร์",
    slug: "pvc-partition-condo-onknut",
    summary: "ฉากทึบแบ่งโซนทำงานในคอนโด ประหยัดแอร์",
    detail: "ฉากกั้น PVC ทึบ แบ่งห้องนั่งเล่นกับมุมทำงาน ติดตั้งเร็วไม่ทุบผนัง",
    place: "อ่อนนุช กรุงเทพฯ",
    productSlug: "pvc-partition",
    spaceType: "condo",
    tags: ["ฉากกั้น", "คอนโด"],
    image: "/images/products/context/pvc-partition/living.png",
    gallery: [
      "/images/products/context/pvc-partition/living.png",
      "/images/products/detail/pvc-partition/solid.png",
    ],
    status: "published",
    pinned: false,
    sortOrder: 7,
    updatedAt: "2026-08-02T15:00:00+07:00",
  },
  {
    id: "pf-8",
    title: "ผ้าม่านไฟฟ้า คอนโดพรีเมียม",
    slug: "motorized-curtain-sukhumvit",
    summary: "มอเตอร์เปิด-ปิดม่านผืนใหญ่ สะดวกทุกวัน",
    detail: "ติดตั้งผ้าม่านไฟฟ้าพร้อมรีโมท บานสูงคอนโด คุมแสงและดูพรีเมียม",
    place: "สุขุมวิท กรุงเทพฯ",
    productSlug: "motorized",
    spaceType: "condo",
    tags: ["ม่านไฟฟ้า", "ผ้าม่านไฟฟ้า", "คอนโด"],
    image: "/images/products/context/motorized/living.png",
    gallery: [
      "/images/products/context/motorized/living.png",
      "/images/products/detail/motorized/curtain.png",
    ],
    status: "published",
    pinned: false,
    sortOrder: 8,
    updatedAt: "2026-08-01T12:00:00+07:00",
  },
  {
    id: "pf-9",
    title: "ม่านม้วนภายนอก ระเบียงคาเฟ่",
    slug: "outdoor-roller-terrace-ari",
    summary: "กันแดดระเบียงคาเฟ่ ลดร้อนช่วงบ่าย",
    detail: "ม่านม้วนภายนอกผ้ากันแดด ระเบียงเปิดโล่ง ใช้งานกลางแจ้งได้",
    place: "อารีย์ กรุงเทพฯ",
    productSlug: "outdoor-factory",
    spaceType: "cafe",
    tags: ["ม่านภายนอก", "คาเฟ่"],
    image: "/images/products/context/outdoor-factory/living.png",
    gallery: [
      "/images/products/context/outdoor-factory/living.png",
      "/images/products/detail/outdoor-factory/outdoor-roller.png",
    ],
    status: "published",
    pinned: false,
    sortOrder: 9,
    updatedAt: "2026-07-30T11:00:00+07:00",
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
