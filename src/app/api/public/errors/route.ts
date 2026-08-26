import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (await isRateLimited(request, { scope: "errors", windowMs: 10 * 60 * 1000, max: 20 })) {
    return NextResponse.json({ ok: true });
  }

  let payload: { message?: string; digest?: string | null; path?: string } = {};
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = String(payload.message || "").slice(0, 300);
  const digest = payload.digest ? String(payload.digest).slice(0, 80) : null;
  const path = String(payload.path || "").slice(0, 200);

  console.error("[client-error]", { message, digest, path });

  const webhook = process.env.ERROR_WEBHOOK_URL?.trim();
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `changtee-website error: ${message} (${path})${digest ? ` digest=${digest}` : ""}`,
        }),
      });
    } catch {
      /* ignore webhook failure */
    }
  }

  return NextResponse.json({ ok: true });
}
