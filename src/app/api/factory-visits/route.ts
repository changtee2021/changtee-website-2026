import { NextResponse } from "next/server";
import { factoryVisitSchema } from "@/lib/validations/visit";
import { createVisitBooking } from "@/lib/visits/store";
import { sendFactoryVisitEmails } from "@/lib/email/visit-mailer";
import { pushLineMessage, visitLineTarget } from "@/lib/outbound/line";
import {
  formatVisitSites,
  VISIT_SESSION_LABELS,
  VISIT_SITE_IDS,
  type VisitSiteId,
} from "@/lib/visits/types";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { bytesMatchDeclaredType, isPdfBytes } from "@/lib/security/file-magic";
import { toStorageRef } from "@/lib/security/lead-media";
import { getRequestIp, isRateLimited } from "@/lib/security/rate-limit";
import { canUseSupabaseStorage, uploadPrivateFile } from "@/lib/storage/upload";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, ".pdf" | ".jpg" | ".png"> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

function notificationFailure() {
  return process.env.NODE_ENV === "production"
    ? "ไม่สามารถส่งการแจ้งเตือนได้"
    : "email not configured";
}

function parseVisitSites(raw: FormDataEntryValue[]): VisitSiteId[] {
  const values = raw.map(String);
  if (values.includes("all")) return [...VISIT_SITE_IDS];
  return VISIT_SITE_IDS.filter((id) => values.includes(id));
}

async function saveVisitFile(file: File | null, fallbackName: string) {
  if (!file || file.size === 0) return { name: null as string | null, ref: null as string | null };
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("UPLOAD_TOO_LARGE");

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) throw new Error("UPLOAD_TYPE_NOT_ALLOWED");

  const buffer = Buffer.from(await file.arrayBuffer());
  const validBytes =
    extension === ".pdf"
      ? isPdfBytes(buffer)
      : bytesMatchDeclaredType(buffer, file.type);
  if (!validBytes) throw new Error("UPLOAD_TYPE_NOT_ALLOWED");

  if (!canUseSupabaseStorage()) {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      throw new Error("STORAGE_NOT_CONFIGURED");
    }
    return { name: file.name, ref: null };
  }

  const baseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-ก-๙]+/g, "_")
      .replace(/^_+|_+$/g, "") || fallbackName;
  const uploaded = await uploadPrivateFile({
    folder: "factory-visits",
    fileName: `${baseName}${extension}`,
    bytes: buffer,
    contentType: file.type,
  });
  return { name: file.name, ref: toStorageRef(uploaded.path) };
}

export async function POST(request: Request) {
  if (
    await isRateLimited(request, {
      scope: "factory-visits",
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX_REQUESTS,
    })
  ) {
    return NextResponse.json(
      { error: "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง" },
      { status: 429 },
    );
  }

  try {
    const ip = getRequestIp(request);
    const form = await request.formData();
    const turnstile = await verifyTurnstileToken(
      String(form.get("turnstileToken") || ""),
      ip,
    );
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 400 });
    }

    const profileFile = form.get("companyProfile");
    const cardFile = form.get("businessCard");
    const companyProfile = await saveVisitFile(
      profileFile instanceof File && profileFile.size > 0 ? profileFile : null,
      "company-profile",
    );
    const businessCard = await saveVisitFile(
      cardFile instanceof File && cardFile.size > 0 ? cardFile : null,
      "business-card",
    );

    if (!companyProfile.name) {
      return NextResponse.json({ error: "กรุณาแนบ Company Profile" }, { status: 400 });
    }
    if (!businessCard.name) {
      return NextResponse.json({ error: "กรุณาแนบนามบัตร" }, { status: 400 });
    }

    const parsed = factoryVisitSchema.safeParse({
      fullName: String(form.get("fullName") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      lineId: String(form.get("lineId") || ""),
      businessName: String(form.get("businessName") || ""),
      contactPosition: String(form.get("contactPosition") || ""),
      taxId: String(form.get("taxId") || ""),
      visitSites: parseVisitSites(form.getAll("visitSites")),
      visitDate: String(form.get("visitDate") || ""),
      session: String(form.get("session") || ""),
      visitorCount: Number(form.get("visitorCount") || 1),
      purpose: String(form.get("purpose") || ""),
      productInterest: String(form.get("productInterest") || ""),
      note: String(form.get("note") || ""),
      pdpaAccepted:
        form.get("pdpaAccepted") === "on" || form.get("pdpaAccepted") === "true",
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ครบ" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const visit = await createVisitBooking({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || null,
      lineId: data.lineId || null,
      businessName: data.businessName || null,
      contactPosition: data.contactPosition,
      taxId: data.taxId,
      visitSites: data.visitSites,
      companyProfileName: companyProfile.name,
      companyProfilePath: companyProfile.ref,
      businessCardName: businessCard.name,
      businessCardPath: businessCard.ref,
      visitDate: data.visitDate,
      session: data.session,
      visitorCount: data.visitorCount,
      purpose: data.purpose || null,
      productInterest: data.productInterest || null,
      note: data.note || null,
    });

    let notify: Array<{ channel: string; ok: boolean; error?: string }> = [];
    try {
      notify = await sendFactoryVisitEmails(visit);
    } catch {
      notify = [
        { channel: "email", ok: false, error: notificationFailure() },
      ];
    }

    const line = await pushLineMessage(
      [
        "📅 มีคำขอนัดเยี่ยมชมโรงงานใหม่",
        `ชื่อ: ${visit.fullName}${visit.contactPosition ? ` · ${visit.contactPosition}` : ""}${visit.businessName ? ` (${visit.businessName})` : ""}`,
        `สถานที่: ${formatVisitSites(visit.visitSites)}`,
        `วันที่: ${visit.visitDate} · ${VISIT_SESSION_LABELS[visit.session]}`,
        `จำนวน: ${visit.visitorCount} คน`,
        `โทร: ${visit.phone}`,
      ].join("\n"),
      visitLineTarget(),
    );
    notify.push({ channel: "line", ...line });

    return NextResponse.json({ ok: true, id: visit.id, notify });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "VISIT_PERSISTENCE_UNAVAILABLE"
    ) {
      return NextResponse.json(
        { error: "ระบบรับข้อมูลขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง" },
        { status: 503 },
      );
    }
    if (err instanceof Error && err.message === "UPLOAD_TOO_LARGE") {
      return NextResponse.json(
        { error: "ไฟล์ต้องมีขนาดไม่เกิน 8 MB" },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "UPLOAD_TYPE_NOT_ALLOWED") {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์ PDF, JPG หรือ PNG" },
        { status: 400 },
      );
    }
    if (err instanceof Error && err.message === "STORAGE_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "ระบบอัปโหลดไฟล์ยังไม่พร้อม กรุณาลองใหม่อีกครั้ง" },
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
