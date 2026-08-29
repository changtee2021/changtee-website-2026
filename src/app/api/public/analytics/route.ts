import { NextResponse } from "next/server";
import {
  deviceFromUserAgent,
  hostFromRequest,
  isBotUserAgent,
  referrerHostFromRequest,
  sanitizeAnalyticsPath,
  sanitizeId,
} from "@/lib/analytics/server";
import { ANALYTICS_CLICK_LABELS } from "@/lib/analytics/labels";
import { isRateLimited } from "@/lib/security/rate-limit";
import { createServiceSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

const CLICK_NAMES = new Set(Object.keys(ANALYTICS_CLICK_LABELS));

export async function POST(request: Request) {
  if (
    await isRateLimited(request, {
      scope: "analytics",
      windowMs: 60 * 1000,
      max: 80,
    })
  ) {
    return NextResponse.json({ ok: true });
  }

  const ua = request.headers.get("user-agent") || "";
  if (isBotUserAgent(ua)) {
    return NextResponse.json({ ok: true });
  }

  let payload: {
    kind?: string;
    path?: string;
    sessionId?: string;
    visitorId?: string;
    clickName?: string;
  } = {};
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const kind =
    payload.kind === "ping" || payload.kind === "click" ? payload.kind : "page";
  const path = sanitizeAnalyticsPath(payload.path);
  const sessionId = sanitizeId(payload.sessionId);
  if (!path || !sessionId) {
    return NextResponse.json({ ok: true });
  }

  const clickName =
    kind === "click" && CLICK_NAMES.has(String(payload.clickName || ""))
      ? String(payload.clickName)
      : null;

  try {
    const supabase = createServiceSupabase();
    const { error } = await supabase.from("site_page_views").insert({
      path,
      host: hostFromRequest(request),
      referrer_host: referrerHostFromRequest(request),
      device: deviceFromUserAgent(ua),
      session_id: sessionId,
      visitor_id: sanitizeId(payload.visitorId),
      kind,
      click_name: clickName,
    });
    if (error) {
      console.error("analytics insert", error.message);
    }
  } catch (err) {
    console.error(
      "analytics insert",
      err instanceof Error ? err.message : "unknown",
    );
  }

  return NextResponse.json({ ok: true });
}
