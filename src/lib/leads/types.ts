export const LEAD_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "won",
  "cancelled",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "คำขอใหม่",
  contacted: "ติดต่อแล้ว",
  quoted: "ส่งใบเสนอราคาแล้ว",
  won: "สำเร็จ",
  cancelled: "ยกเลิก",
};

/** Tailwind classes for status select / badges */
export const LEAD_STATUS_STYLES: Record<
  LeadStatus,
  { select: string; chart: string }
> = {
  new: {
    select: "border-sky-300 bg-sky-50 text-sky-800",
    chart: "#0ea5e9",
  },
  contacted: {
    select: "border-amber-300 bg-amber-50 text-amber-900",
    chart: "#f59e0b",
  },
  quoted: {
    select: "border-violet-300 bg-violet-50 text-violet-900",
    chart: "#8b5cf6",
  },
  won: {
    select: "border-emerald-300 bg-emerald-50 text-emerald-800",
    chart: "#059669",
  },
  cancelled: {
    select: "border-rose-300 bg-rose-50 text-rose-800",
    chart: "#e11d48",
  },
};

export const CONTACT_TYPES = [
  "บุคคลธรรมดา",
  "นิติบุคคล",
  "ร้านค้า/ธุรกิจ",
  "หน่วยงานราชการ",
  "อื่นๆ",
] as const;

export const PRODUCT_TYPES = [
  "ผ้าม่าน",
  "ม่านม้วน",
  "มู่ลี่",
  "ม่านปรับแสง",
  "ฉากกั้นห้อง",
  "ม่านไฟฟ้า",
  "วอลเปเปอร์",
  "ฟิล์มอาคาร",
  "ม่านภายนอก/อุตสาหกรรม",
  "อื่นๆ",
] as const;

/** 4:3 category photos shown beside product-type select on /quote */
export const PRODUCT_TYPE_THUMBS: Record<(typeof PRODUCT_TYPES)[number], string> = {
  ผ้าม่าน: "/images/products/quote/curtain.webp",
  ม่านม้วน: "/images/products/quote/roller-blind.webp",
  มู่ลี่: "/images/products/quote/wooden-venetian.webp",
  ม่านปรับแสง: "/images/products/quote/vertical-blind.webp",
  ฉากกั้นห้อง: "/images/products/quote/pvc-folding-door.webp",
  ม่านไฟฟ้า: "/images/products/quote/motorized.webp",
  วอลเปเปอร์: "/images/products/quote/wallpaper.webp",
  ฟิล์มอาคาร: "/images/products/quote/window-film.webp",
  "ม่านภายนอก/อุตสาหกรรม": "/images/products/quote/outdoor-blind.webp",
  อื่นๆ: "/images/products/quote/other.webp",
};

export function productTypeThumb(productType: string): string | null {
  if ((PRODUCT_TYPES as readonly string[]).includes(productType)) {
    return PRODUCT_TYPE_THUMBS[productType as (typeof PRODUCT_TYPES)[number]];
  }
  return null;
}

export const REFERRAL_SOURCES = [
  "Google",
  "Facebook",
  "Instagram",
  "LINE",
  "เพื่อนแนะนำ",
  "ผ่านหน้างาน/โชว์รูม",
  "อื่นๆ",
] as const;

export type QuoteLead = {
  id: string;
  source: "quote" | "estimate" | "contact" | "fab";
  status: LeadStatus;
  contactName: string;
  jobTitle?: string | null;
  phone: string;
  contactType: string;
  businessName?: string | null;
  installAddress: string;
  billingAddress?: string | null;
  taxId?: string | null;
  email: string;
  productType: string;
  requestedSize?: string | null;
  siteImageName?: string | null;
  siteImageUrl?: string | null;
  /** Extra site photos (first is also in siteImageUrl) */
  siteImageUrls?: string[] | null;
  callbackDate?: string | null;
  referralSource: string;
  note?: string | null;
  lineId?: string | null;
  estimatePayload?: Record<string, unknown> | null;
  /** Staff user id (sales) — maps to leads.assigned_to when Auth is live */
  assigneeId?: string | null;
  /** Display name for assignee (denormalized for UI / demo) */
  assigneeName?: string | null;
  /** Reason when status = cancelled */
  cancelReason?: string | null;
  cancelImageName?: string | null;
  /** data URL or storage URL for cancel evidence image */
  cancelImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};
