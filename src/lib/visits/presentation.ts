import { PRODUCT_TYPES } from "@/lib/leads/types";

export const PRESENTATION_VENUES = [
  {
    id: "company",
    label: "ทีมเข้าพบที่บริษัท",
    hint: "ทีมช่างตี๋พกตัวอย่างไปพรีเซนต์ที่สำนักงานคุณ",
  },
  {
    id: "showroom",
    label: "นัดที่โชว์รูมช่างตี๋",
    hint: "ดูตัวอย่างผ้าและระบบจริงที่โชว์รูม",
  },
  {
    id: "online",
    label: "ออนไลน์",
    hint: "ประชุมผ่านวิดีโอ ประมาณ 45 นาที",
  },
] as const;

export type PresentationVenueId = (typeof PRESENTATION_VENUES)[number]["id"];

export const PRESENTATION_VENUE_LABELS: Record<PresentationVenueId, string> = {
  company: "ทีมเข้าพบที่บริษัท",
  showroom: "นัดที่โชว์รูมช่างตี๋",
  online: "ออนไลน์",
};

export const LEGAL_ENTITY_TYPES = [
  "บริษัทจำกัด",
  "ห้างหุ้นส่วนจำกัด",
  "บริษัทมหาชน",
  "หน่วยงานราชการ",
  "รัฐวิสาหกิจ",
  "อื่นๆ",
] as const;

export const COMPANY_INDUSTRIES = [
  "ออฟฟิศ / สำนักงาน",
  "โรงแรม / ที่พัก",
  "ร้านค้า / สาขา",
  "โรงงาน / คลังสินค้า",
  "โครงการอสังหาริมทรัพย์",
  "สถานศึกษา / โรงพยาบาล",
  "อื่นๆ",
] as const;

export const PRESENTATION_JOB_TYPES = [
  "ออฟฟิศใหม่",
  "รีโนเวทอาคาร",
  "เปิดสาขาใหม่",
  "โรงแรม / โครงการ",
  "โรงงาน / คลังสินค้า",
  "อื่นๆ",
] as const;

export const DECISION_TIMELINES = [
  "ภายใน 2 สัปดาห์",
  "ภายใน 1 เดือน",
  "ไตรมาสนี้",
  "ยังสำรวจอยู่",
] as const;

export const PRESENTATION_PRODUCTS = PRODUCT_TYPES;
