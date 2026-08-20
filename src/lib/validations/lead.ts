import { z } from "zod";

export const leadSourceSchema = z.enum(["quote", "contact", "fab"]);

/** Full quotation form (legacy site parity) */
export const quoteLeadSchema = z.object({
  source: z.literal("quote").default("quote"),
  contactName: z.string().trim().min(2, "กรุณากรอกชื่อผู้ติดต่อ").max(120),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(9, "กรุณากรอกเบอร์โทรศัพท์")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "รูปแบบเบอร์ไม่ถูกต้อง"),
  lineId: z.string().trim().max(80).optional().or(z.literal("")),
  contactType: z.string().trim().min(1, "กรุณาเลือกประเภทผู้ติดต่อ"),
  businessName: z.string().trim().max(200).optional().or(z.literal("")),
  installAddress: z.string().trim().min(5, "กรุณากรอกที่อยู่ติดตั้ง/ส่งของ"),
  billingAddress: z.string().trim().max(2000).optional().or(z.literal("")),
  taxId: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  productType: z.string().trim().min(1, "กรุณาเลือกประเภทสินค้า"),
  requestedSize: z
    .string()
    .trim()
    .min(1, "กรุณากรอกขนาดที่ต้องการ (กว้างxสูง เซ็นติเมตร)")
    .max(4000),
  callbackDate: z.string().trim().max(40).optional().or(z.literal("")),
  referralSource: z.string().trim().min(1, "กรุณาเลือกช่องทางที่หาเราเจอ"),
  note: z.string().trim().max(4000).optional().or(z.literal("")),
  pdpaAccepted: z.boolean(),
  marketingOptIn: z.boolean().optional().default(false),
  siteImageName: z.string().trim().max(260).optional().or(z.literal("")),
})
.refine((data) => data.pdpaAccepted === true, {
  message: "กรุณายอมรับนโยบายความเป็นส่วนตัว",
  path: ["pdpaAccepted"],
})
.refine(
  (data) =>
    data.contactType === "บุคคลธรรมดา" || Boolean(data.taxId?.trim()),
  {
    message: "กรุณากรอกเลขผู้เสียภาษี",
    path: ["taxId"],
  },
);

export type QuoteLeadInput = z.infer<typeof quoteLeadSchema>;

/** Compact lead (contact / fab) — optional company fields for B2B inquiries */
export const leadSchema = z
  .object({
    source: leadSourceSchema.default("contact"),
    fullName: z.string().trim().min(2, "กรุณากรอกชื่อ").max(120),
    phone: z
      .string()
      .trim()
      .min(9, "กรุณากรอกเบอร์โทร")
      .max(20)
      .regex(/^[0-9+\-\s()]+$/, "รูปแบบเบอร์ไม่ถูกต้อง"),
    lineId: z.string().trim().max(80).optional().or(z.literal("")),
    email: z
      .string()
      .trim()
      .email("อีเมลไม่ถูกต้อง")
      .optional()
      .or(z.literal("")),
    message: z.string().trim().max(2000).optional().or(z.literal("")),
    productInterest: z.string().trim().max(200).optional().or(z.literal("")),
    companyName: z.string().trim().max(200).optional().or(z.literal("")),
    jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
    inquiryType: z.string().trim().max(200).optional().or(z.literal("")),
    pdpaAccepted: z.boolean(),
    marketingOptIn: z.boolean().optional().default(false),
    turnstileToken: z.string().optional(),
  })
  .refine((data) => data.pdpaAccepted === true, {
    message: "กรุณายอมรับนโยบายความเป็นส่วนตัว",
    path: ["pdpaAccepted"],
  })
  .refine((data) => !data.marketingOptIn || Boolean(data.email?.trim()), {
    message: "กรุณากรอกอีเมลหากต้องการรับข่าวสาร",
    path: ["email"],
  })
  .refine((data) => Boolean(data.lineId?.trim() || data.email?.trim()), {
    message: "กรุณากรอก LINE หรืออีเมลอย่างน้อย 1 ช่อง",
    path: ["lineId"],
  });

export type LeadInput = z.infer<typeof leadSchema>;
