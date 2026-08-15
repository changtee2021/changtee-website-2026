import { z } from "zod";
import { VISIT_SESSIONS } from "@/lib/visits/types";

export const factoryVisitSchema = z
  .object({
    fullName: z.string().trim().min(2, "กรุณากรอกชื่อ-นามสกุล").max(120),
    phone: z
      .string()
      .trim()
      .min(9, "กรุณากรอกเบอร์โทรศัพท์")
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, "รูปแบบเบอร์ไม่ถูกต้อง"),
    email: z.string().trim().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
    lineId: z.string().trim().max(80).optional().or(z.literal("")),
    businessName: z.string().trim().max(200).optional().or(z.literal("")),
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
    purpose: z.string().trim().max(200).optional().or(z.literal("")),
    productInterest: z.string().trim().max(200).optional().or(z.literal("")),
    note: z.string().trim().max(2000).optional().or(z.literal("")),
    pdpaAccepted: z.boolean(),
    turnstileToken: z.string().optional(),
  })
  .refine((data) => data.pdpaAccepted === true, {
    message: "กรุณายอมรับนโยบายความเป็นส่วนตัว",
    path: ["pdpaAccepted"],
  })
  .refine((data) => Boolean(data.lineId?.trim() || data.email?.trim()), {
    message: "กรุณากรอก LINE หรืออีเมลอย่างน้อย 1 ช่อง เพื่อให้ทีมงานยืนยันการนัด",
    path: ["lineId"],
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
