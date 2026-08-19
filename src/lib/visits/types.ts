import type { VisitBookingKind } from "@/lib/visits/modes";
import type {
  VisitNextStep,
  VisitOutcomeScores,
} from "@/lib/visits/outcome";

export type { VisitBookingKind };

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
  "rescheduled",
  "cancelled",
  "completed",
] as const;
export type VisitStatus = (typeof VISIT_STATUSES)[number];

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  pending: "รอยืนยัน",
  confirmed: "ยืนยันแล้ว",
  rescheduled: "เลื่อนนัด",
  cancelled: "ยกเลิก",
  completed: "เยี่ยมชมแล้ว",
};

export function visitStatusLabel(
  status: VisitStatus,
  kind?: VisitBookingKind,
): string {
  if (status === "completed" && kind === "product-presentation") {
    return "นำเสนอแล้ว";
  }
  return VISIT_STATUS_LABELS[status];
}

export const VISIT_STATUS_STYLES: Record<VisitStatus, { select: string }> = {
  pending: { select: "border-sky-300 bg-sky-50 text-sky-800" },
  confirmed: { select: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  rescheduled: { select: "border-amber-300 bg-amber-50 text-amber-900" },
  cancelled: { select: "border-rose-300 bg-rose-50 text-rose-800" },
  completed: { select: "border-violet-300 bg-violet-50 text-violet-900" },
};

export const VISIT_SITES = [
  {
    id: "blinds",
    no: "01",
    titleEn: "Blinds & Roller",
    titleTh: "มู่ลี่ · ม่านม้วน · ม่านปรับแสง",
    products: "ผลิตมู่ลี่ ม่านม้วน และม่านปรับแสง",
  },
  {
    id: "partition",
    no: "02",
    titleEn: "Partitions & Tracks",
    titleTh: "ฉากกั้นห้อง · รางม่าน",
    products: "ผลิตฉากกั้นห้อง และรางม่าน",
  },
  {
    id: "curtain",
    no: "03",
    titleEn: "Curtains & Print",
    titleTh: "ผ้าม่าน · ผ้าพิมพ์ลาย",
    products: "ผลิตผ้าม่าน และผ้าพิมพ์ลาย",
  },
] as const;

export type VisitSiteId = (typeof VISIT_SITES)[number]["id"];
export const VISIT_SITE_IDS = VISIT_SITES.map((s) => s.id) as [
  VisitSiteId,
  ...VisitSiteId[],
];

export function formatVisitSites(ids: string[] | null | undefined): string {
  const selected = VISIT_SITES.filter((s) => ids?.includes(s.id));
  if (selected.length === 0) return "";
  if (selected.length === VISIT_SITES.length) return "ไปทั้ง 3 ที่";
  return selected.map((s) => `${s.no} ${s.titleTh}`).join(" · ");
}

export const VISIT_PURPOSES = [
  "ดูตัวอย่างสินค้า/โชว์รูมโรงงาน",
  "ดูขั้นตอนการผลิต",
  "พาลูกค้า/ผู้บริหารเยี่ยมชมก่อนสั่งผลิต",
  "สื่อ/นักศึกษา/หน่วยงานขอเยี่ยมชม",
  "อื่นๆ",
] as const;

export type FactoryVisitBooking = {
  id: string;
  bookingKind?: VisitBookingKind;
  fullName: string;
  phone: string;
  email?: string | null;
  lineId?: string | null;
  businessName?: string | null;
  contactPosition?: string | null;
  department?: string | null;
  taxId?: string | null;
  legalEntityType?: string | null;
  industry?: string | null;
  officeAddress?: string | null;
  visitSites?: string[];
  presentationVenue?: string | null;
  venueAddress?: string | null;
  jobType?: string | null;
  decisionTimeline?: string | null;
  estimatedScope?: string | null;
  companyProfileName?: string | null;
  companyProfilePath?: string | null;
  companyProfileUrl?: string | null;
  businessCardName?: string | null;
  businessCardPath?: string | null;
  businessCardUrl?: string | null;
  visitDate: string;
  session: VisitSession;
  visitorCount: number;
  purpose?: string | null;
  productInterest?: string | null;
  note?: string | null;
  status: VisitStatus;
  cancelReason?: string | null;
  rescheduleReason?: string | null;
  previousVisitDate?: string | null;
  previousSession?: VisitSession | null;
  outcomeScores?: VisitOutcomeScores | null;
  outcomeNote?: string | null;
  outcomeNextStep?: VisitNextStep | null;
  createdAt: string;
  updatedAt: string;
};
