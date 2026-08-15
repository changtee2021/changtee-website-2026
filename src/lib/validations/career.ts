import { z } from "zod";

export const jobApplicationSchema = z
  .object({
    jobPostingId: z.string().trim().max(80).optional().or(z.literal("")),
    jobTitle: z.string().trim().max(160).optional().or(z.literal("")),
    fullName: z.string().trim().min(2, "กรุณากรอกชื่อ-นามสกุล").max(120),
    phone: z
      .string()
      .trim()
      .min(9, "กรุณากรอกเบอร์โทรศัพท์")
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, "รูปแบบเบอร์ไม่ถูกต้อง"),
    email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
    lineId: z.string().trim().max(80).optional().or(z.literal("")),
    address: z.string().trim().max(300).optional().or(z.literal("")),
    education: z.string().trim().max(80).optional().or(z.literal("")),
    experienceNote: z.string().trim().max(2000).optional().or(z.literal("")),
    coverNote: z.string().trim().max(2000).optional().or(z.literal("")),
    expectedSalary: z.string().trim().max(60).optional().or(z.literal("")),
    availableFrom: z.string().trim().max(20).optional().or(z.literal("")),
    pdpaAccepted: z.boolean(),
    turnstileToken: z.string().optional(),
  })
  .refine((data) => data.pdpaAccepted === true, {
    message: "กรุณายอมรับนโยบายความเป็นส่วนตัว",
    path: ["pdpaAccepted"],
  });

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
