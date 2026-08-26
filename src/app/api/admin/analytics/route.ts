import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import {
  bangkokRange,
  hostFromRequest,
  toAdminAnalyticsPayload,
  type AnalyticsOverviewRaw,
} from "@/lib/analytics/server";
import { createServiceSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

function validDay(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export async function GET(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const from = validDay(url.searchParams.get("from"));
  const to = validDay(url.searchParams.get("to"));
  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  const range = bangkokRange(from <= to ? from : to, from <= to ? to : from);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const includeLocal =
    /localhost|127\.0\.0\.1/.test(siteUrl) ||
    /localhost|127\.0\.0\.1/.test(hostFromRequest(request) || "");

  try {
    const supabase = createServiceSupabase();
    const { data, error } = await supabase.rpc("analytics_overview", {
      p_from: range.from,
      p_to: range.to,
      p_include_local: includeLocal,
    });
    if (error || !data) {
      console.error("analytics_overview", error?.message || "empty");
      return NextResponse.json({ error: "analytics unavailable" }, { status: 503 });
    }
    return NextResponse.json(toAdminAnalyticsPayload(data as AnalyticsOverviewRaw));
  } catch (err) {
    console.error(
      "admin analytics",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json({ error: "analytics unavailable" }, { status: 503 });
  }
}
