import type { QuoteLead } from "@/lib/leads/types";
import type { JobApplication } from "@/lib/careers/types";
import type { FactoryVisitBooking } from "@/lib/visits/types";
import { buildAdminSummaryHtml, buildCustomerReplyHtml } from "@/lib/email/mailer";
import {
  buildCandidateReplyHtml,
  buildHrApplicationHtml,
} from "@/lib/email/careers-mailer";
import { buildAdminVisitHtml, buildCustomerVisitHtml } from "@/lib/email/visit-mailer";

const now = "2026-08-20T08:00:00.000Z";

const quoteLead: QuoteLead = {
  id: "preview-quote",
  source: "quote",
  status: "new",
  contactName: "ทดสอบเมล จัดกลุ่มหัวข้อ",
  jobTitle: "ผู้จัดการฝ่ายจัดซื้อ",
  phone: "0928874288",
  contactType: "นิติบุคคล",
  businessName: "บริษัท ตัวอย่าง จำกัด",
  installAddress: "88 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
  billingAddress: "88 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
  taxId: "0105558888999",
  email: "changtee2021@gmail.com",
  productType: "ผ้าม่าน",
  requestedSize: "350 × 280 ซม. · 4 ชุด",
  siteImageName: "หน้างาน-ห้องประชุม.jpg · หน้างาน-โชว์รูม.jpg",
  siteImageUrl: "/images/about/showroom-interior.webp",
  siteImageUrls: [
    "/images/about/showroom-interior.webp",
    "/images/mock/blinds-office.jpg",
  ],
  callbackDate: "2026-09-15",
  referralSource: "Google",
  note: "ต้องการผ้ากันแสงสำหรับห้องประชุมชั้น 8",
  lineId: "@chang-tee-test",
  createdAt: now,
  updatedAt: now,
};

const contactLead: QuoteLead = {
  ...quoteLead,
  id: "preview-contact",
  source: "contact",
  contactName: "ทดสอบเมล ตอบลูกค้า",
  jobTitle: "ผู้จัดการฝ่ายขาย",
  businessName: "ช่างตี๋ ผ้าม่าน",
  contactType: "นิติบุคคล",
  installAddress: "-",
  billingAddress: null,
  taxId: null,
  productType: "ขอใบเสนอราคาโครงการ",
  requestedSize: null,
  siteImageName: null,
  callbackDate: null,
  referralSource: "เว็บไซต์",
  note: "เรื่องที่ติดต่อ: ขอใบเสนอราคาโครงการ\n\nต้องการผ้าม่านทั้งอาคารสำนักงาน",
};

const fabLead: QuoteLead = {
  ...quoteLead,
  id: "preview-fab",
  source: "fab",
  contactName: "ทดสอบเมล ติดต่อด่วน",
  jobTitle: null,
  businessName: null,
  contactType: "ไม่ระบุ",
  installAddress: "-",
  billingAddress: null,
  taxId: null,
  productType: "ม่านม้วน",
  requestedSize: null,
  siteImageName: null,
  callbackDate: null,
  referralSource: "เว็บไซต์",
  note: "อยากให้โทรกลับช่วงเย็นวันนี้",
};

const application: JobApplication = {
  id: "preview-career",
  jobTitle: "พนักงานขาย",
  fullName: "ทดสอบเมล จัดกลุ่มหัวข้อ",
  phone: "0928874288",
  email: "changtee2021@gmail.com",
  lineId: "@chang-tee-test",
  address: "กรุงเทพฯ",
  education: "ปริญญาตรี",
  experienceNote: "2 ปี งานขายหน้าร้าน",
  coverNote: "สนใจร่วมงานฝ่ายขาย โชว์รูม",
  expectedSalary: "25,000",
  availableFrom: "2026-09-01",
  resumeFileName: "resume-test.pdf",
  status: "new",
  createdAt: now,
  updatedAt: now,
};

const visit: FactoryVisitBooking = {
  id: "preview-visit",
  bookingKind: "factory-visit",
  fullName: "ทดสอบเมล นัดเยี่ยมชม",
  phone: "0928874288",
  email: "changtee2021@gmail.com",
  lineId: "@chang-tee-test",
  businessName: "บริษัท โครงการบ้านตัวอย่าง จำกัด",
  contactPosition: "ผู้จัดการโครงการ",
  department: "จัดซื้อ",
  taxId: "0105558888999",
  legalEntityType: "บริษัทจำกัด",
  industry: "ออฟฟิศ / สำนักงาน",
  officeAddress: "88 ถนนสุขุมวิท กรุงเทพฯ",
  visitSites: ["blinds", "curtain"],
  visitDate: "2026-09-10",
  session: "morning",
  visitorCount: 4,
  purpose: "ดูตัวอย่างสินค้า/โชว์รูมโรงงาน",
  productInterest: "ผ้าม่าน, ม่านม้วน",
  note: "ต้องการดูผ้ากันแสงและระบบมอเตอร์",
  companyProfileName: "company-profile.pdf",
  businessCardName: "นามบัตร.jpg",
  status: "pending",
  createdAt: now,
  updatedAt: now,
};

const presentation: FactoryVisitBooking = {
  ...visit,
  id: "preview-presentation",
  bookingKind: "product-presentation",
  fullName: "ทดสอบเมล นัดนำเสนอ",
  visitSites: [],
  presentationVenue: "company",
  venueAddress: "อาคารตัวอย่าง ชั้น 12",
  jobType: "โครงการคอนโด",
  estimatedScope: "ประมาณ 80 ยูนิต",
  decisionTimeline: "ไตรมาส 4/2569",
};

export const EMAIL_PREVIEWS = [
  {
    id: "admin-quote",
    group: "เมลถึงทีมงาน",
    title: "ขอใบเสนอราคา",
    to: "ทีมขาย",
    html: buildAdminSummaryHtml(quoteLead, [
      {
        name: "หน้างาน-ห้องประชุม.jpg",
        url: "/images/about/showroom-interior.webp",
      },
      {
        name: "หน้างาน-โชว์รูม.jpg",
        url: "/images/mock/blinds-office.jpg",
      },
    ]),
  },
  {
    id: "admin-contact",
    group: "เมลถึงทีมงาน",
    title: "ติดต่อบริษัท",
    to: "ทีมขาย",
    html: buildAdminSummaryHtml(contactLead),
  },
  {
    id: "admin-fab",
    group: "เมลถึงทีมงาน",
    title: "ติดต่อด่วน (FAB)",
    to: "ทีมขาย",
    html: buildAdminSummaryHtml(fabLead),
  },
  {
    id: "admin-visit",
    group: "เมลถึงทีมงาน",
    title: "นัดเยี่ยมชมโรงงาน",
    to: "ทีมขาย",
    html: buildAdminVisitHtml(visit),
  },
  {
    id: "admin-presentation",
    group: "เมลถึงทีมงาน",
    title: "นัดนำเสนอสินค้า",
    to: "ทีมขาย",
    html: buildAdminVisitHtml(presentation),
  },
  {
    id: "admin-career",
    group: "เมลถึงทีมงาน",
    title: "ใบสมัครงาน",
    to: "ฝ่ายบุคคล",
    html: buildHrApplicationHtml(application, "https://example.com/resume.pdf"),
  },
  {
    id: "customer-quote",
    group: "เมลตอบลูกค้า",
    title: "ตอบกลับ — ขอใบเสนอราคา",
    to: "ลูกค้า",
    html: buildCustomerReplyHtml(quoteLead),
  },
  {
    id: "customer-contact",
    group: "เมลตอบลูกค้า",
    title: "ตอบกลับ — ติดต่อบริษัท",
    to: "ลูกค้า",
    html: buildCustomerReplyHtml(contactLead),
  },
  {
    id: "customer-fab",
    group: "เมลตอบลูกค้า",
    title: "ตอบกลับ — ติดต่อด่วน",
    to: "ลูกค้า",
    html: buildCustomerReplyHtml(fabLead),
  },
  {
    id: "customer-visit",
    group: "เมลตอบลูกค้า",
    title: "ตอบกลับ — นัดเยี่ยมชมโรงงาน",
    to: "ลูกค้า",
    html: buildCustomerVisitHtml(visit),
  },
  {
    id: "customer-presentation",
    group: "เมลตอบลูกค้า",
    title: "ตอบกลับ — นัดนำเสนอสินค้า",
    to: "ลูกค้า",
    html: buildCustomerVisitHtml(presentation),
  },
  {
    id: "customer-career",
    group: "เมลตอบลูกค้า",
    title: "ตอบกลับ — ใบสมัครงาน",
    to: "ผู้สมัคร",
    html: buildCandidateReplyHtml(application),
  },
] as const;
