import { NextResponse } from "next/server";
import { factoryVisitSchema } from "@/lib/validations/visit";
import { createVisitBooking } from "@/lib/visits/store";
import { sendFactoryVisitEmails } from "@/lib/email/visit-mailer";
import { pushLineMessage, visitLineTarget } from "@/lib/outbound/line";
import { VISIT_SESSION_LABELS } from "@/lib/visits/types";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getRequestIp, isRateLimited } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;

function notificationFailure() {
  return process.env.NODE_ENV === "production"
    ? "ไม่สามารถส่งการแจ้งเตือนได้"
    : "email not configured";
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
    const body = await request.json();
    const turnstile = await verifyTurnstileToken(
      typeof body?.turnstileToken === "string" ? body.turnstileToken : "",
      ip,
    );
    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.error }, { status: 400 });
    }

    const parsed = factoryVisitSchema.safeParse(body);
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
        `ชื่อ: ${visit.fullName}${visit.businessName ? ` (${visit.businessName})` : ""}`,
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
    const error =
      process.env.NODE_ENV === "production"
        ? "ระบบรับข้อมูลขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง"
        : err instanceof Error
          ? err.message
          : "Server error";
    return NextResponse.json({ error }, { status: 500 });
  }
}
