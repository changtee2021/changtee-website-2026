import { z } from "zod";
import { VISIT_SESSIONS, VISIT_SITE_IDS } from "@/lib/visits/types";

export const factoryVisitSchema = z
  .object({
    fullName: z.string().trim().min(2, "กรุณากรอกชื่อ-นามสกุล").max(120),
    phone: z
      .string()
      .trim()
      .min(9, "กรุณากรอกเบอร์โทรศัพท์")
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, "รูปแบบเบอร์ไม่ถูกต้อง"),
    email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
    lineId: z.string().trim().min(2, "กรุณากรอก LINE ID").max(80),
    businessName: z.string().trim().min(2, "กรุณากรอกชื่อบริษัท/องค์กร").max(200),
    contactPosition: z.string().trim().min(2, "กรุณากรอกตำแหน่งผู้ติดต่อ").max(120),
    taxId: z
      .string()
      .trim()
      .min(10, "กรุณากรอกเลขนิติบุคคลหรือเลขบัตรประชาชน")
      .max(20)
      .regex(/^[0-9\-]+$/, "กรุณากรอกเป็นตัวเลข 13 หลัก"),
    visitSites: z
      .array(z.enum(VISIT_SITE_IDS))
      .min(1, "กรุณาเลือกสถานที่ที่ต้องการเยี่ยมชม"),
    visitDate: z
      .string()
      .trim()
      .refine((v) => !Number.isNaN(Date.parse(v)), "กรุณาเลือกวันที่ให้ถูกต้อง"),
    session: z.enum(VISIT_SESSIONS),
    visitorCount: z.coerce
      .number()
      .int("กรุณากรอกจำนวนผู้เยี่ยมชมเป็นจำนวนเต็ม")
      .min(1, "อย่างน้อย 1 คน")
      .max(100, "หากเกิน 100 คน กรุณาติดต่อทีมงานโดยตรง"),
    purpose: z.string().trim().min(1, "กรุณาเลือกวัตถุประสงค์การเยี่ยมชม").max(200),
    productInterest: z.string().trim().min(2, "กรุณากรอกสินค้าที่สนใจ").max(200),
    note: z.string().trim().max(2000).optional().or(z.literal("")),
    pdpaAccepted: z.boolean(),
    marketingOptIn: z.boolean().optional().default(false),
    turnstileToken: z.string().optional(),
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
  );

export type FactoryVisitInput = z.infer<typeof factoryVisitSchema>;
