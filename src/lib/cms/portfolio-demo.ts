import type { ContentStatus } from "@/lib/cms/content-status";
import { productCatalog } from "@/lib/product-catalog";
import profileJobs from "@/lib/cms/portfolio-from-profile.json";

export type SpaceType =
  | "restaurant-cafe"
  | "home-condo"
  | "hotel-resort"
  | "office-corp"
  | "government"
  | "education"
  | "hospital"
  | "pharmacy";

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  "restaurant-cafe": "ร้านอาหาร-คาเฟ่",
  "home-condo": "บ้าน-คอนโด",
  "hotel-resort": "โรงแรม-รีสอร์ท",
  "office-corp": "องค์กร-สำนักงาน",
  government: "หน่วยงานราชการ",
  education: "สถานศึกษา",
  hospital: "โรงพยาบาล",
  pharmacy: "ร้านยา",
};

/** Legacy CMS keys → current SpaceType */
const SPACE_TYPE_ALIASES: Record<string, SpaceType> = {
  home: "home-condo",
  condo: "home-condo",
  office: "office-corp",
  corp: "office-corp",
  cafe: "restaurant-cafe",
  "restaurant-cafe": "restaurant-cafe",
  "home-condo": "home-condo",
  "hotel-resort": "hotel-resort",
  "office-corp": "office-corp",
  government: "government",
  education: "education",
  hospital: "hospital",
  pharmacy: "pharmacy",
};

export function normalizeSpaceType(value: unknown): SpaceType {
  if (typeof value === "string" && value in SPACE_TYPE_ALIASES) {
    return SPACE_TYPE_ALIASES[value];
  }
  return "home-condo";
}

/** Parse URL/query space value; unknown → null */
export function parseSpaceTypeParam(value: string | null | undefined): SpaceType | null {
  const s = value?.trim();
  if (!s || s === "all") return null;
  if (s in SPACE_TYPE_ALIASES) return SPACE_TYPE_ALIASES[s];
  return null;
}

/** Header / mobile nav links for portfolio install categories */
export const PORTFOLIO_NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/portfolio", label: "รวมผลงาน" },
  ...((Object.keys(SPACE_TYPE_LABELS) as SpaceType[]).map((key) => ({
    href: `/portfolio?space=${encodeURIComponent(key)}`,
    label: SPACE_TYPE_LABELS[key],
  }))),
  {
    href: `/portfolio?product=roller-blinds&q=${encodeURIComponent("ร้านยา")}`,
    label: "ม่านม้วนร้านยา/ม่านม้วนสกรีน",
  },
];

/** One installed product line — for sales + SEO specs */
export type PortfolioLineItem = {
  /** ชื่อสินค้าที่ติดจริง เช่น ม่านม้วน Sunscreen */
  productName: string;
  /** SKU / รหัสสินค้าในระบบ */
  sku: string;
  /** Serial / โค้ดม้วนผ้า / รหัสล็อต */
  serialOrCode: string;
  /** วัสดุ / เนื้อผ้า */
  material: string;
  /** สีหรือโทน */
  color: string;
  /** จำนวน เช่น 3 บาน, 12 เมตร */
  quantity: string;
  /** หมายเหตุสั้นสำหรับเซล */
  notes: string;
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
  /** Optional search title; falls back to title when empty. */
  seoTitle: string;
  /** Optional meta description; falls back to summary when empty. */
  seoDescription: string;
  /** ชื่อลูกค้าหรือชื่อโครงการ */
  customerName: string;
  /** แสดงชื่อลูกค้าบนหน้าเว็บสาธารณะ */
  showCustomerName: boolean;
  /** พิกัดติดตั้งละเอียด เช่น ชั้น 12 ตึก A */
  installLocation: string;
  /** วันที่ติดตั้ง */
  installDate: string;
  /** รายการสินค้าที่ใช้จริง */
  lineItems: PortfolioLineItem[];
  /** โน้ตภายในทีม — ไม่โชว์บนเว็บ */
  internalNote: string;
  updatedAt: string;
};

export function emptyLineItem(): PortfolioLineItem {
  return {
    productName: "",
    sku: "",
    serialOrCode: "",
    material: "",
    color: "",
    quantity: "",
    notes: "",
  };
}

export const PRODUCT_OPTIONS = productCatalog.map((c) => ({
  value: c.slug,
  label: c.name,
}));

export function productLabel(slug: string): string {
  return PRODUCT_OPTIONS.find((p) => p.value === slug)?.label ?? slug;
}

function normalizeLineItem(
  row: Partial<PortfolioLineItem> | undefined,
): PortfolioLineItem {
  return {
    productName: row?.productName ?? "",
    sku: row?.sku ?? "",
    serialOrCode: row?.serialOrCode ?? "",
    material: row?.material ?? "",
    color: row?.color ?? "",
    quantity: row?.quantity ?? "",
    notes: row?.notes ?? "",
  };
}

/** Fill job/SEO fields missing from older CMS rows. */
export function normalizePortfolioItem(
  item: Partial<PortfolioItem> &
    Pick<
      PortfolioItem,
      | "id"
      | "title"
      | "slug"
      | "summary"
      | "detail"
      | "place"
      | "productSlug"
      | "spaceType"
      | "tags"
      | "image"
      | "gallery"
      | "status"
      | "pinned"
      | "sortOrder"
      | "updatedAt"
    >,
): PortfolioItem {
  return {
    ...item,
    spaceType: normalizeSpaceType(item.spaceType),
    seoTitle: item.seoTitle ?? "",
    seoDescription: item.seoDescription ?? "",
    customerName: item.customerName ?? "",
    showCustomerName: item.showCustomerName ?? false,
    installLocation: item.installLocation ?? "",
    installDate: item.installDate ?? "",
    lineItems: Array.isArray(item.lineItems)
      ? item.lineItems.map(normalizeLineItem)
      : [],
    internalNote: item.internalNote ?? "",
  };
}

const DEMO_PORTFOLIO_RAW = [
  ...(profileJobs as Array<
    (typeof profileJobs)[number] & {
      spaceType: SpaceType;
      status: ContentStatus;
    }
  >),
  // Keep slugs that blog posts still link to.
  {
    id: "pf-2",
    title: "ผ้าม่านลอนเทปทั้งหลัง",
    slug: "curtain-swave-rama5",
    summary: "ผ้าโปร่ง-ผ้าทึบ คุมโทนทั้งบ้าน งานสวยเรียบหรู",
    detail: "ม่านลอนเทปชั้นคู่ ทั้งบ้าน โทนครีมอบอุ่น เหมาะบ้านสไตล์โมเดิร์น",
    place: "พระราม 5 นนทบุรี",
    productSlug: "curtain",
    spaceType: "home-condo" as SpaceType,
    tags: ["ผ้าม่าน", "ลอนเทป"],
    image: "/images/generated/ct-pf-home.webp",
    gallery: ["/images/generated/ct-pf-home.webp"],
    status: "published" as ContentStatus,
    pinned: false,
    sortOrder: 102,
    customerName: "บ้านพักอาศัย พระราม 5",
    showCustomerName: false,
    installLocation: "ห้องนั่งเล่น + ห้องนอนหลัก",
    installDate: "2026-07",
    lineItems: [
      {
        productName: "ม่านลอน S-Wave ชั้นคู่",
        sku: "CT-SW-CRM",
        serialOrCode: "",
        material: "ผ้าโปร่ง + ผ้าทึบ",
        color: "ครีมอบอุ่น",
        quantity: "ทั้งหลัง",
        notes: "รางฝังฝ้า",
      },
    ],
    updatedAt: "2026-07-20T14:00:00+07:00",
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
    spaceType: "home-condo" as SpaceType,
    tags: ["ผ้าม่าน", "ทึบแสง", "คอนโด"],
    image: "/images/generated/ct-pf-condo.webp",
    gallery: ["/images/generated/ct-pf-condo.webp"],
    status: "published" as ContentStatus,
    pinned: false,
    sortOrder: 104,
    customerName: "คอนโดรัชดา",
    showCustomerName: false,
    installLocation: "ห้องนอนหลัก",
    installDate: "2026-08",
    lineItems: [
      {
        productName: "ผ้าม่านทึบแสง + ผ้าโปร่ง",
        sku: "CT-BO-GY",
        serialOrCode: "",
        material: "blackout + sheer",
        color: "เทา",
        quantity: "1 ชุด",
        notes: "ชั้นคู่",
      },
    ],
    updatedAt: "2026-08-04T09:00:00+07:00",
  },
  {
    id: "pf-7",
    title: "ฉากกั้นห้องคอนโด กั้นแอร์",
    slug: "pvc-partition-condo-onknut",
    summary: "ฉากทึบแบ่งโซนทำงานในคอนโด ประหยัดแอร์",
    detail: "ฉากกั้น PVC ทึบ แบ่งห้องนั่งเล่นกับมุมทำงาน ติดตั้งเร็วไม่ทุบผนัง",
    place: "อ่อนนุช กรุงเทพฯ",
    productSlug: "pvc-partition",
    spaceType: "home-condo" as SpaceType,
    tags: ["ฉากกั้น", "คอนโด"],
    image: "/images/products/context/pvc-partition/living.png",
    gallery: [
      "/images/products/context/pvc-partition/living.png",
      "/images/products/detail/pvc-partition/solid.png",
    ],
    status: "published" as ContentStatus,
    pinned: false,
    sortOrder: 107,
    customerName: "",
    showCustomerName: false,
    installLocation: "โซนนั่งเล่น / มุมทำงาน",
    installDate: "2026-08",
    lineItems: [
      {
        productName: "ฉากกั้น PVC ทึบ",
        sku: "PV-SD-WH",
        serialOrCode: "",
        material: "PVC",
        color: "ขาว",
        quantity: "1 ชุด",
        notes: "",
      },
    ],
    updatedAt: "2026-08-02T15:00:00+07:00",
  },
  {
    id: "pf-8",
    title: "ผ้าม่านไฟฟ้า คอนโดพรีเมียม",
    slug: "motorized-curtain-sukhumvit",
    summary: "มอเตอร์เปิด-ปิดม่านผืนใหญ่ สะดวกทุกวัน",
    detail:
      "ติดตั้งผ้าม่านไฟฟ้าพร้อมรีโมท บานสูงคอนโด คุมแสงและดูพรีเมียม เซลอ้างอิงสเปกด้านล่างได้เลยเมื่อคุยงานใกล้เคียง",
    place: "สุขุมวิท กรุงเทพฯ",
    productSlug: "motorized",
    spaceType: "home-condo" as SpaceType,
    tags: ["ม่านไฟฟ้า", "ผ้าม่านไฟฟ้า", "คอนโด"],
    image: "/images/products/context/motorized/living.png",
    gallery: [
      "/images/products/context/motorized/living.png",
      "/images/products/detail/motorized/curtain.png",
    ],
    status: "published" as ContentStatus,
    pinned: false,
    sortOrder: 108,
    seoTitle: "ผ้าม่านไฟฟ้าคอนโดสุขุมวิท | ผลงานติดตั้งช่างตี๋",
    seoDescription:
      "ผลงานติดตั้งผ้าม่านไฟฟ้าคอนโดสุขุมวิท พร้อมสเปกมอเตอร์ ผ้า และรหัสสินค้า อ้างอิงงานจริงได้",
    customerName: "คุณเอ (นามสมมติ)",
    showCustomerName: true,
    installLocation: "ห้องนั่งเล่น ชั้นสูง บานกระจกใหญ่",
    installDate: "2026-08-01",
    lineItems: [
      {
        productName: "ผ้าม่านไฟฟ้า S-Wave",
        sku: "MT-CT-SW-01",
        serialOrCode: "MOT-2408-118",
        material: "ผ้าทึบแสง + ผ้าโปร่ง",
        color: "ครีม / ขาวโปร่ง",
        quantity: "1 ชุด (บานสูง)",
        notes: "รีโมท RF + พร้อมต่อสมาร์ทโฮมภายหลัง",
      },
      {
        productName: "มอเตอร์รางผ้าม่าน",
        sku: "MT-TRK-BAT",
        serialOrCode: "SN-MT-77821",
        material: "มอเตอร์แบตเตอรี่",
        color: "ขาว",
        quantity: "1 ตัว",
        notes: "ซ่อนใต้กล่องฝ้า",
      },
    ],
    internalNote: "ลูกค้าสนใจต่อ Google Home เฟสถัดไป — บอกเซลตอนติดตาม",
    updatedAt: "2026-08-01T12:00:00+07:00",
  },
];

export const DEMO_PORTFOLIO: PortfolioItem[] =
  DEMO_PORTFOLIO_RAW.map(normalizePortfolioItem);

export function emptyPortfolio(): PortfolioItem {
  return normalizePortfolioItem({
    id: `pf-${Date.now()}`,
    title: "",
    slug: "",
    summary: "",
    detail: "",
    place: "",
    productSlug: PRODUCT_OPTIONS[0]?.value ?? "curtain",
    spaceType: "home-condo",
    tags: [],
    image: "/images/mock/curtain-living.jpg",
    gallery: [],
    status: "draft",
    pinned: false,
    sortOrder: 99,
    seoTitle: "",
    seoDescription: "",
    customerName: "",
    showCustomerName: false,
    installLocation: "",
    installDate: "",
    lineItems: [emptyLineItem()],
    internalNote: "",
    updatedAt: new Date().toISOString(),
  });
}

/** มีข้อมูลสเปกพอให้โชว์กล่องสินค้าหรือไม่ */
export function hasPortfolioSpecs(item: PortfolioItem): boolean {
  return item.lineItems.some(
    (r) =>
      r.productName.trim() ||
      r.sku.trim() ||
      r.material.trim() ||
      r.color.trim() ||
      r.serialOrCode.trim(),
  );
}
