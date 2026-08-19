import { NextResponse } from "next/server";
import { jobApplicationSchema } from "@/lib/validations/career";
import { createJobApplication } from "@/lib/careers/store";
import { sendJobApplicationEmails } from "@/lib/email/careers-mailer";
import { pushLineMessage, hrLineTarget } from "@/lib/outbound/line";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { bytesMatchDeclaredType, isPdfBytes } from "@/lib/security/file-magic";
import { toStorageRef } from "@/lib/security/lead-media";
import { getRequestIp, isRateLimited } from "@/lib/security/rate-limit";
import { canUseSupabaseStorage, uploadPrivateFile, createSignedUploadUrl } from "@/lib/storage/upload";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, ".pdf" | ".jpg" | ".png"> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function notificationFailure() {
  return process.env.NODE_ENV === "production"
    ? "ไม่สามารถส่งการแจ้งเตือนได้"
    : "email not configured";
}

async function saveCareerFile(file: File | null, fallbackName = "file") {
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
    folder: "careers",
    fileName: `${baseName}${extension}`,
    bytes: buffer,
    contentType: file.type,
  });
  return { name: file.name, ref: toStorageRef(uploaded.path) };
}

export async function POST(request: Request) {
  if (
    await isRateLimited(request, {
      scope: "careers-apply",
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

    const resumeFile = form.get("resume");
    const resume = await saveCareerFile(
      resumeFile instanceof File && resumeFile.size > 0 ? resumeFile : null,
      "resume",
    );
    const portfolioUploads = (
      await Promise.all(
        form
          .getAll("portfolio")
          .filter((item): item is File => item instanceof File && item.size > 0)
          .slice(0, 3)
          .map((file) => saveCareerFile(file, "portfolio")),
      )
    ).filter((file) => file.name);

    const parsed = jobApplicationSchema.safeParse({
      jobPostingId: String(form.get("jobPostingId") || ""),
      jobTitle: String(form.get("jobTitle") || ""),
      fullName: String(form.get("fullName") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      lineId: String(form.get("lineId") || ""),
      address: String(form.get("address") || ""),
      education: String(form.get("education") || ""),
      experienceNote: String(form.get("experienceNote") || ""),
      coverNote: String(form.get("coverNote") || ""),
      expectedSalary: String(form.get("expectedSalary") || ""),
      availableFrom: String(form.get("availableFrom") || ""),
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
    const application = await createJobApplication({
      jobPostingId: data.jobPostingId || null,
      jobTitle: data.jobTitle || null,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      lineId: data.lineId || null,
      address: data.address || null,
      education: data.education || null,
      experienceNote: data.experienceNote || null,
      coverNote: data.coverNote || null,
      expectedSalary: data.expectedSalary || null,
      availableFrom: data.availableFrom || null,
      resumeFileName: resume.name,
      resumeFilePath: resume.ref,
      portfolioFiles: portfolioUploads.map((file) => ({
        name: file.name || "portfolio",
        path: file.ref,
      })),
    });

    const resumeUrl = resume.ref
      ? await createSignedUploadUrl(resume.ref.replace(/^storage:/, ""), 60 * 60 * 24 * 7)
      : null;

    let notify: Array<{ channel: string; ok: boolean; error?: string }> = [];
    try {
      notify = await sendJobApplicationEmails(application, resumeUrl);
    } catch {
      notify = [
        { channel: "email", ok: false, error: notificationFailure() },
      ];
    }

    const line = await pushLineMessage(
      [
        "📄 มีใบสมัครงานใหม่",
        `ตำแหน่ง: ${application.jobTitle || "สมัครทั่วไป"}`,
        `ชื่อ: ${application.fullName}`,
        `โทร: ${application.phone}`,
      ].join("\n"),
      hrLineTarget(),
    );
    notify.push({ channel: "line", ...line });

    return NextResponse.json({ ok: true, id: application.id, notify });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "APPLICATION_PERSISTENCE_UNAVAILABLE"
    ) {
      return NextResponse.json(
        { error: "ระบบรับข้อมูลขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง" },
        { status: 503 },
      );
    }
    if (err instanceof Error && err.message === "UPLOAD_TOO_LARGE") {
      return NextResponse.json(
        { error: "ไฟล์เรซูเม่ต้องมีขนาดไม่เกิน 8 MB" },
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
        { error: "ระบบอัปโหลดไฟล์ยังไม่พร้อม กรุณาลองใหม่หรือส่งโดยไม่แนบไฟล์" },
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
