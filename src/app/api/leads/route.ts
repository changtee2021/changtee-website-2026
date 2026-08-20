import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { quoteLeadSchema, leadSchema } from "@/lib/validations/lead";
import { createLead } from "@/lib/leads/store";
import { sendQuoteEmails } from "@/lib/email/mailer";
import type { QuoteLead } from "@/lib/leads/types";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { bytesMatchDeclaredType } from "@/lib/security/file-magic";
import { toStorageRef } from "@/lib/security/lead-media";
import { getRequestIp, isRateLimited } from "@/lib/security/rate-limit";
import {
  canUseSupabaseStorage,
  uploadPrivateFile,
} from "@/lib/storage/upload";
import { formFlagTrue } from "@/lib/marketing/consent";
import { subscribeIfOptedIn } from "@/lib/marketing/store";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES: Record<string, ".jpg" | ".png" | ".webp"> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

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

  const baseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-ก-๙]+/g, "_")
      .replace(/^_+|_+$/g, "") || "upload";
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!bytesMatchDeclaredType(buffer, file.type)) {
    throw new Error("UPLOAD_TYPE_NOT_ALLOWED");
  }

  if (canUseSupabaseStorage()) {
    const uploaded = await uploadPrivateFile({
      folder: "leads",
      fileName: `${baseName}${extension}`,
      bytes: buffer,
      contentType: file.type,
    });
    return { name: file.name, url: toStorageRef(uploaded.path) };
  }

  // Local filesystem only (dev). Production must use Supabase Storage.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "leads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const safeName = `${Date.now()}-${baseName}${extension}`;
  await fs.writeFile(path.join(uploadsDir, safeName), buffer);
  return {
    name: file.name,
    url: `/uploads/leads/${safeName}`,
  };
}

export async function POST(request: Request) {
  if (await isRateLimited(request, {
    scope: "leads",
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
  })) {
    return NextResponse.json(
      { error: "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง" },
      { status: 429 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    const ip = getRequestIp(request);

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const turnstile = await verifyTurnstileToken(
        String(form.get("turnstileToken") || ""),
        ip,
      );
      if (!turnstile.ok) {
        return NextResponse.json({ error: turnstile.error }, { status: 400 });
      }
      const siteFiles = form
        .getAll("siteImage")
        .filter((f): f is File => f instanceof File && f.size > 0)
        .slice(0, 10);
      const uploads: Array<{ name: string; url: string }> = [];
      for (const file of siteFiles) {
        const upload = await saveUpload(file);
        if (upload.name && upload.url) {
          uploads.push({ name: upload.name, url: upload.url });
        }
      }
      const siteImageName =
        uploads.length === 0
          ? ""
          : uploads.length === 1
            ? uploads[0].name
            : uploads.map((u) => u.name).join(" · ");
      const siteImageUrl = uploads[0]?.url ?? null;
      const siteImageUrls = uploads.map((u) => u.url);

      const parsed = quoteLeadSchema.safeParse({
        source: "quote",
        contactName: String(form.get("contactName") || ""),
        jobTitle: String(form.get("jobTitle") || ""),
        phone: String(form.get("phone") || ""),
        lineId: String(form.get("lineId") || ""),
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
        marketingOptIn: formFlagTrue(form.get("marketingOptIn")),
        siteImageName,
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
        lineId: data.lineId || null,
        contactType: data.contactType,
        businessName: data.businessName || null,
        installAddress: data.installAddress,
        billingAddress: data.billingAddress || null,
        taxId: data.taxId || null,
        email: data.email,
        productType: data.productType,
        requestedSize: data.requestedSize || null,
        siteImageName: siteImageName || null,
        siteImageUrl,
        siteImageUrls: siteImageUrls.length ? siteImageUrls : null,
        callbackDate: data.callbackDate || null,
        referralSource: data.referralSource,
        note: data.note || null,
      });

      await subscribeIfOptedIn({
        optedIn: Boolean(data.marketingOptIn),
        email: data.email,
        fullName: data.contactName,
        source: "quote",
        leadId: lead.id,
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

    // Compact JSON leads (contact / fab)
    const body = await request.json();
    const turnstile = await verifyTurnstileToken(
      typeof body?.turnstileToken === "string" ? body.turnstileToken : "",
      ip,
    );
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 400 });
    }
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ครบ" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const noteParts = [
      data.inquiryType ? `เรื่องที่ติดต่อ: ${data.inquiryType}` : null,
      data.message || null,
    ].filter(Boolean);

    const lead = await createLead({
      source: data.source,
      contactName: data.fullName,
      phone: data.phone,
      contactType: data.companyName?.trim() ? "นิติบุคคล" : "ไม่ระบุ",
      installAddress: "-",
      email: data.email || "",
      productType: data.productInterest || data.inquiryType || "อื่นๆ",
      referralSource: "เว็บไซต์",
      note: noteParts.length ? noteParts.join("\n\n") : null,
      lineId: data.lineId || null,
      estimatePayload: null,
      jobTitle: data.jobTitle || null,
      businessName: data.companyName || null,
      billingAddress: null,
      taxId: null,
      requestedSize: null,
      siteImageName: null,
      siteImageUrl: null,
      callbackDate: null,
    });

    await subscribeIfOptedIn({
      optedIn: Boolean(data.marketingOptIn),
      email: data.email,
      fullName: data.fullName,
      source: data.source === "fab" ? "fab" : "contact",
      leadId: lead.id,
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
    if (err instanceof Error && err.message === "STORAGE_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "ระบบอัปโหลดรูปยังไม่พร้อม กรุณาลองใหม่หรือส่งโดยไม่แนบรูป" },
        { status: 503 },
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
