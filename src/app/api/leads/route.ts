import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { quoteLeadSchema, leadSchema } from "@/lib/validations/lead";
import { createLead } from "@/lib/leads/store";
import { sendQuoteEmails } from "@/lib/email/mailer";
import type { QuoteLead } from "@/lib/leads/types";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES: Record<string, ".jpg" | ".png" | ".webp"> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestTimestamps = new Map<string, number[]>();

function getRequestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(request: Request) {
  const now = Date.now();
  const ip = getRequestIp(request);
  const timestamps = (requestTimestamps.get(ip) ?? []).filter(
    (timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS,
  );
  timestamps.push(now);
  requestTimestamps.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function notificationFailure() {
  return process.env.NODE_ENV === "production"
    ? "ไม่สามารถส่งการแจ้งเตือนได้"
    : "email not configured";
}

async function saveUpload(file: File | null) {
  if (!file || file.size === 0) return { name: null as string | null, url: null as string | null };
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("UPLOAD_TOO_LARGE");
  }

  const extension = ALLOWED_UPLOAD_TYPES[file.type];
  if (!extension) {
    throw new Error("UPLOAD_TYPE_NOT_ALLOWED");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "leads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const baseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-ก-๙]+/g, "_")
      .replace(/^_+|_+$/g, "") || "upload";
  const safeName = `${Date.now()}-${baseName}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, safeName), buffer);
  return {
    name: file.name,
    url: `/uploads/leads/${safeName}`,
  };
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง" },
      { status: 429 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const siteImage = form.get("siteImage");
      const upload = await saveUpload(siteImage instanceof File ? siteImage : null);

      const parsed = quoteLeadSchema.safeParse({
        source: "quote",
        contactName: String(form.get("contactName") || ""),
        jobTitle: String(form.get("jobTitle") || ""),
        phone: String(form.get("phone") || ""),
        contactType: String(form.get("contactType") || ""),
        businessName: String(form.get("businessName") || ""),
        installAddress: String(form.get("installAddress") || ""),
        billingAddress: String(form.get("billingAddress") || ""),
        taxId: String(form.get("taxId") || ""),
        email: String(form.get("email") || ""),
        productType: String(form.get("productType") || ""),
        requestedSize: String(form.get("requestedSize") || ""),
        callbackDate: String(form.get("callbackDate") || ""),
        referralSource: String(form.get("referralSource") || ""),
        note: String(form.get("note") || ""),
        pdpaAccepted: form.get("pdpaAccepted") === "on" || form.get("pdpaAccepted") === "true",
        siteImageName: upload.name || "",
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ครบ" },
          { status: 400 },
        );
      }

      const data = parsed.data;
      const lead = await createLead({
        source: "quote",
        contactName: data.contactName,
        jobTitle: data.jobTitle || null,
        phone: data.phone,
        contactType: data.contactType,
        businessName: data.businessName || null,
        installAddress: data.installAddress,
        billingAddress: data.billingAddress || null,
        taxId: data.taxId || null,
        email: data.email,
        productType: data.productType,
        requestedSize: data.requestedSize || null,
        siteImageName: upload.name,
        siteImageUrl: upload.url,
        callbackDate: data.callbackDate || null,
        referralSource: data.referralSource,
        note: data.note || null,
      });

      let notify: Array<{ channel: string; ok: boolean; error?: string }> = [];
      try {
        notify = await sendQuoteEmails(lead);
      } catch {
        notify = [
          {
            channel: "email",
            ok: false,
            error: notificationFailure(),
          },
        ];
      }

      return NextResponse.json({ ok: true, id: lead.id, notify });
    }

    // Compact JSON leads (estimate / contact / fab)
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ครบ" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const lead = await createLead({
      source: data.source,
      contactName: data.fullName,
      phone: data.phone,
      contactType: "ไม่ระบุ",
      installAddress: "-",
      email: data.email || "no-email@changtee.local",
      productType: data.productInterest || "อื่นๆ",
      referralSource: "เว็บไซต์",
      note: data.message || null,
      lineId: data.lineId || null,
      estimatePayload: data.estimatePayload ?? null,
      jobTitle: null,
      businessName: null,
      billingAddress: null,
      taxId: null,
      requestedSize: null,
      siteImageName: null,
      siteImageUrl: null,
      callbackDate: null,
    });

    let notify: Array<{ channel: string; ok: boolean; error?: string }> = [];
    if (data.email) {
      try {
        notify = await sendQuoteEmails(lead as QuoteLead);
      } catch {
        notify = [
          {
            channel: "email",
            ok: false,
            error: notificationFailure(),
          },
        ];
      }
    }

    return NextResponse.json({ ok: true, id: lead.id, notify });
  } catch (err) {
    if (err instanceof Error && err.message === "LEAD_PERSISTENCE_UNAVAILABLE") {
      return NextResponse.json(
        { error: "ระบบรับข้อมูลขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง" },
        { status: 503 },
      );
    }
    if (err instanceof Error && err.message === "UPLOAD_TOO_LARGE") {
      return NextResponse.json(
        { error: "ไฟล์รูปต้องมีขนาดไม่เกิน 5 MB" },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "UPLOAD_TYPE_NOT_ALLOWED") {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์รูป JPG, PNG หรือ WebP" },
        { status: 400 },
      );
    }
    const error =
      process.env.NODE_ENV === "production"
        ? "ระบบรับข้อมูลขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง"
        : err instanceof Error
          ? err.message
          : "Server error";
    return NextResponse.json({ error }, { status: 500 });
  }
}
