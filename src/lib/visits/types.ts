export const VISIT_SESSIONS = ["morning", "evening"] as const;
export type VisitSession = (typeof VISIT_SESSIONS)[number];

export const VISIT_SESSION_LABELS: Record<VisitSession, string> = {
  morning: "รอบเช้า (09:00 - 12:00 น.)",
  evening: "รอบเย็น (13:00 - 16:00 น.)",
};

export const VISIT_SESSION_SHORT_LABELS: Record<VisitSession, string> = {
  morning: "รอบเช้า",
  evening: "รอบเย็น",
};

export const VISIT_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิก",
  completed: "เยี่ยมชมแล้ว",
};

export const VISIT_STATUS_STYLES: Record<VisitStatus, { select: string }> = {
  pending: { select: "border-sky-300 bg-sky-50 text-sky-800" },
  confirmed: { select: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  cancelled: { select: "border-rose-300 bg-rose-50 text-rose-800" },
  completed: { select: "border-violet-300 bg-violet-50 text-violet-900" },
};

export const VISIT_PURPOSES = [
  "ดูตัวอย่างสินค้า/โชว์รูมโรงงาน",
  "ดูขั้นตอนการผลิต",
  "พาลูกค้า/ผู้บริหารเยี่ยมชมก่อนสั่งผลิต",
  "สื่อ/นักศึกษา/หน่วยงานขอเยี่ยมชม",
  "อื่นๆ",
] as const;

export type FactoryVisitBooking = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  lineId?: string | null;
  businessName?: string | null;
  visitDate: string;
  session: VisitSession;
  visitorCount: number;
  purpose?: string | null;
  productInterest?: string | null;
  note?: string | null;
  status: VisitStatus;
  createdAt: string;
  updatedAt: string;
};
