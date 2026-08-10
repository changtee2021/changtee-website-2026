import type { ContentStatus } from "@/lib/cms/content-status";
import { productCatalog } from "@/lib/product-catalog";

export type ReviewSource = "google" | "facebook" | "line" | "other";

export const REVIEW_SOURCE_LABELS: Record<ReviewSource, string> = {
  google: "Google",
  facebook: "Facebook",
  line: "LINE",
  other: "อื่นๆ",
};

/** Category slug options for review → product page matching */
export const REVIEW_PRODUCT_OPTIONS = [
  { value: "", label: "ทั่วไป (ไม่ผูกหมวด)" },
  ...productCatalog.map((c) => ({ value: c.slug, label: c.name })),
] as const;

export function reviewProductLabel(productSlug: string): string {
  if (!productSlug) return "";
  return (
    REVIEW_PRODUCT_OPTIONS.find((o) => o.value === productSlug)?.label ??
    productSlug
  );
}

export type ReviewItem = {
  id: string;
  displayName: string;
  rating: number;
  body: string;
  /** Catalog category slug — drives which product pages show this review */
  productSlug: string;
  /** Display label (synced from productSlug on save; kept for older UI) */
  productHint: string;
  source: ReviewSource;
  sourceUrl: string;
  image: string;
  status: ContentStatus | "pending";
  pinned: boolean;
  sortOrder: number;
  createdAt: string;
};

export const DEMO_REVIEWS: ReviewItem[] = [
  {
    id: "rv-1",
    displayName: "คุณมิ้นท์ — คอนโด พระราม 9",
    rating: 5,
    body: "ทีมงานสุภาพ วัดไซส์ละเอียด ม่านลอนสวยตรงปก ติดตั้งเร็วมากค่ะ",
    productSlug: "curtain",
    productHint: "ผ้าม่าน",
    source: "google",
    sourceUrl: "",
    image: "/images/reviews/mint.webp",
    status: "published",
    pinned: true,
    sortOrder: 1,
    createdAt: "2026-07-10T12:00:00+07:00",
  },
  {
    id: "rv-2",
    displayName: "คุณเอ — สำนักงาน ลาดพร้าว",
    rating: 5,
    body: "ม่านม้วน sunscreen ตัดแสงดี จอคอมไม่สะท้อน ราคาคุยง่าย",
    productSlug: "roller-blinds",
    productHint: "ม่านม้วน",
    source: "line",
    sourceUrl: "",
    image: "/images/reviews/ae.webp",
    status: "published",
    pinned: true,
    sortOrder: 2,
    createdAt: "2026-07-18T15:30:00+07:00",
  },
  {
    id: "rv-3",
    displayName: "คุณบี — บ้าน นนทบุรี",
    rating: 5,
    body: "งานเนี๊ยบ แนะนำผ้าทึบดีมาก ช่างเก็บรายละเอียดขอบม่านเรียบร้อย",
    productSlug: "curtain",
    productHint: "ผ้าม่าน",
    source: "facebook",
    sourceUrl: "",
    image: "/images/reviews/bee.webp",
    status: "published",
    pinned: false,
    sortOrder: 3,
    createdAt: "2026-08-03T09:20:00+07:00",
  },
  {
    id: "rv-4",
    displayName: "คุณโต — คาเฟ่ บางกรวย",
    rating: 5,
    body: "ร้านดูพรีเมียมขึ้นทันทีหลังติดม่านม้วน ลูกค้าชมเยอะ",
    productSlug: "roller-blinds",
    productHint: "ม่านม้วน",
    source: "google",
    sourceUrl: "",
    image: "",
    status: "published",
    pinned: false,
    sortOrder: 4,
    createdAt: "2026-06-22T11:00:00+07:00",
  },
  {
    id: "rv-5",
    displayName: "คุณนุ่น — ออฟฟิศ อโศก",
    rating: 5,
    body: "มู่ลี่อลูมิเนียมเบา เช็ดง่าย ปรับองศาแสงได้จริงตามที่คุยไว้",
    productSlug: "venetian-blinds",
    productHint: "มู่ลี่",
    source: "google",
    sourceUrl: "",
    image: "",
    status: "published",
    pinned: false,
    sortOrder: 5,
    createdAt: "2026-07-05T10:00:00+07:00",
  },
  {
    id: "rv-6",
    displayName: "คุณเก่ง — คลินิก รามอินทรา",
    rating: 5,
    body: "ฉากกั้น PVC สวย แบ่งโซนชัด ติดตั้งวันเดียวจบ ทีมงานสุภาพ",
    productSlug: "pvc-partition",
    productHint: "ฉากกั้นห้อง",
    source: "line",
    sourceUrl: "",
    image: "",
    status: "published",
    pinned: false,
    sortOrder: 6,
    createdAt: "2026-07-25T16:00:00+07:00",
  },
  {
    id: "rv-7",
    displayName: "คุณแพร — บ้านเดี่ยว บางนา",
    rating: 5,
    body: "ติดม่านไฟฟ้าใช้รีโมทสะดวกมาก ลูกๆ ชอบกดเล่น ช่างเซ็ตโซนให้ครบ",
    productSlug: "motorized",
    productHint: "ผ้าม่านไฟฟ้า",
    source: "google",
    sourceUrl: "",
    image: "",
    status: "published",
    pinned: false,
    sortOrder: 7,
    createdAt: "2026-08-01T11:30:00+07:00",
  },
];

export function emptyReview(): ReviewItem {
  return {
    id: `rv-${Date.now()}`,
    displayName: "",
    rating: 5,
    body: "",
    productSlug: "",
    productHint: "",
    source: "google",
    sourceUrl: "",
    image: "",
    status: "pending",
    pinned: false,
    sortOrder: 99,
    createdAt: new Date().toISOString(),
  };
}

/** Normalize older items that only had productHint text */
export function normalizeReview(item: ReviewItem): ReviewItem {
  if (item.productSlug) {
    return {
      ...item,
      productHint: reviewProductLabel(item.productSlug) || item.productHint,
    };
  }
  const hint = (item.productHint || "").toLowerCase();
  let slug = "";
  if (hint.includes("ม่านม้วน") || hint.includes("roller")) slug = "roller-blinds";
  else if (hint.includes("มู่ลี่") || hint.includes("venetian"))
    slug = "venetian-blinds";
  else if (hint.includes("ปรับแสง") || hint.includes("vertical"))
    slug = "vertical-blinds";
  else if (hint.includes("ฉาก")) slug = "pvc-partition";
  else if (hint.includes("ไฟฟ้า") || hint.includes("มอเตอร์")) slug = "motorized";
  else if (hint.includes("นอก") || hint.includes("โรงงาน")) slug = "outdoor-factory";
  else if (hint.includes("พิมพ์")) slug = "print-fabric";
  else if (hint.includes("วอล") || hint.includes("ฟิล์ม")) slug = "surface";
  else if (hint.includes("ซัก") || hint.includes("ซ่อม")) slug = "service";
  else if (hint.includes("ผ้าม่าน") || hint.includes("ม่าน")) slug = "curtain";
  return {
    ...item,
    productSlug: slug,
    productHint: slug ? reviewProductLabel(slug) : item.productHint,
  };
}
