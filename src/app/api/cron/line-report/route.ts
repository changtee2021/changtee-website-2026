import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { pushLineFlex } from "@/lib/outbound/line";
import {
  bangkokToday,
  fetchWebReportStats,
  isReportDay,
  reportWindow,
  webReportMessage,
} from "@/lib/reports/line-web-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
function isAuthorized(request: Request, secret: string) {
  const given = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 503 });
  }
  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = new URL(request.url);
  const period = url.searchParams.get("period") === "month" ? "month" : "week";
  const dateParam = url.searchParams.get("date");
  const today = isReportDay(dateParam) ? dateParam : bangkokToday();
  const dryRun = url.searchParams.get("dry") === "1";

  try {
    const window = reportWindow(period, today);
    const [current, previous] = await Promise.all([
      fetchWebReportStats(window.current),
      fetchWebReportStats(window.previous),
    ]);
    const message = webReportMessage(window, current, previous);

    if (dryRun) {
      return NextResponse.json({ ok: true, window, current, previous, message });
    }

    const pushed = await pushLineFlex(message, process.env.LINE_REPORT_TO_ID || undefined);
    if (!pushed.ok) {
      console.error("line report push", pushed.error);
      return NextResponse.json({ ok: false, error: "push failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, window });
  } catch (err) {
    console.error("line report", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ ok: false, error: "report failed" }, { status: 500 });
  }
}
