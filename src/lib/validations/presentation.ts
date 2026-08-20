import { z } from "zod";
import { VISIT_SESSIONS } from "@/lib/visits/types";
import { PRESENTATION_VENUES } from "@/lib/visits/presentation";

const venueIds = PRESENTATION_VENUES.map((v) => v.id) as [
  (typeof PRESENTATION_VENUES)[number]["id"],
  ...string[],
];

export const productPresentationSchema = z
  .object({
    fullName: z.string().trim().min(2, "กรุณากรอกชื่อ-นามสกุล").max(120),
    contactPosition: z.string().trim().min(2, "กรุณากรอกตำแหน่งผู้ติดต่อ").max(120),
    department: z.string().trim().max(120).optional().or(z.literal("")),
    businessName: z.string().trim().min(2, "กรุณากรอกชื่อบริษัทตามหนังสือรับรอง").max(200),
    legalEntityType: z.string().trim().min(1, "กรุณาเลือกประเภทนิติบุคคล").max(80),
    taxId: z
      .string()
      .trim()
      .transform((v) => v.replace(/[^\d]/g, ""))
      .refine((v) => v.length === 13, "กรุณากรอกเลขทะเบียนนิติบุคคล 13 หลัก"),
    industry: z.string().trim().min(1, "กรุณาเลือกประเภทธุรกิจ").max(80),
    officeAddress: z.string().trim().min(8, "กรุณากรอกที่อยู่สำนักงาน").max(500),
    phone: z
      .string()
      .trim()
      .min(9, "กรุณากรอกเบอร์โทรศัพท์")
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, "รูปแบบเบอร์ไม่ถูกต้อง"),
    email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
    lineId: z.string().trim().max(80).optional().or(z.literal("")),
    presentationVenue: z.enum(venueIds, {
      error: "กรุณาเลือกสถานที่นำเสนอ",
    }),
    venueAddress: z.string().trim().max(500).optional().or(z.literal("")),
    visitDate: z
      .string()
      .trim()
      .refine((v) => !Number.isNaN(Date.parse(v)), "กรุณาเลือกวันที่ให้ถูกต้อง"),
    session: z.enum(VISIT_SESSIONS),
    visitorCount: z.coerce
      .number()
      .int("กรุณากรอกจำนวนผู้เข้าร่วมเป็นจำนวนเต็ม")
      .min(1, "อย่างน้อย 1 คน")
      .max(40, "หากเกิน 40 คน กรุณาติดต่อทีมงานโดยตรง"),
    products: z
      .array(z.string().trim().min(1))
      .min(1, "กรุณาเลือกสินค้าที่อยากให้พรีเซนต์อย่างน้อย 1 รายการ"),
    jobType: z.string().trim().max(80).optional().or(z.literal("")),
    estimatedScope: z.string().trim().max(200).optional().or(z.literal("")),
    decisionTimeline: z.string().trim().max(80).optional().or(z.literal("")),
    note: z.string().trim().max(2000).optional().or(z.literal("")),
    pdpaAccepted: z.boolean(),
    marketingOptIn: z.boolean().optional().default(false),
  })
  .refine((data) => data.pdpaAccepted === true, {
    message: "กรุณายอมรับนโยบายความเป็นส่วนตัว",
    path: ["pdpaAccepted"],
  })
  .refine(
    (data) => {
      const day = new Date(`${data.visitDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return day.getTime() >= today.getTime();
    },
    { message: "กรุณาเลือกวันที่ตั้งแต่วันนี้เป็นต้นไป", path: ["visitDate"] },
  )
  .refine(
    (data) =>
      data.presentationVenue !== "company" ||
      (data.venueAddress && data.venueAddress.trim().length >= 8),
    {
      message: "กรุณากรอกที่อยู่ที่ต้องการให้ทีมเข้าพบ",
      path: ["venueAddress"],
    },
  );

export type ProductPresentationInput = z.infer<typeof productPresentationSchema>;
