import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { mapDbLead } from "@/lib/leads/store";
import { readNorenDesign, toEasyNorenJob } from "@/lib/noren/inbox";
import { isStorageRef, leadImageRefs, storagePathFromRef } from "@/lib/security/lead-media";
import { createSignedUploadUrl } from "@/lib/storage/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_ORIGINS = ["https://easy-noren.vercel.app", "http://localhost:5178"];
const WINDOW_DAYS = 60;
const SIGNED_URL_SEC = 60 * 60 * 24 * 7;

function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin") || "";
  const list = (process.env.NOREN_INBOX_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return (list.length ? list : DEFAULT_ORIGINS).includes(origin) ? origin : "";
}

function cors(request: Request) {
  const origin = allowedOrigin(request);
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "x-noren-key",
    "Cache-Control": "no-store",
  };
}

/** Easy Noren has no login yet, so staff paste this key once; it gates customer PII. */
function isAuthorized(request: Request, key: string) {
  const given = Buffer.from(request.headers.get("x-noren-key") || "");
  const expected = Buffer.from(key);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: cors(request) });
}

export async function GET(request: Request) {
  const headers = cors(request);
  const key = process.env.NOREN_INBOX_KEY?.trim();
  if (!key) return NextResponse.json({ error: "not configured" }, { status: 503, headers });
  if (!isAuthorized(request, key)) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();
    const { data, error } = await supabase
      .from("leads")
      .select("id, quote_no, status, created_at, updated_at, form_payload, estimate_payload")
      .eq("product_type", "ม่านญี่ปุ่น")
      .not("estimate_payload", "is", null)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    const origin = new URL(request.url).origin;
    const jobs = [];
    for (const row of data ?? []) {
      const lead = mapDbLead(row);
      const design = readNorenDesign({ estimatePayload: row.estimate_payload as Record<string, unknown> });
      if (!design) continue;
      const urls = await Promise.all(
        leadImageRefs(lead).map(async (ref) => {
          if (isStorageRef(ref)) return (await createSignedUploadUrl(storagePathFromRef(ref), SIGNED_URL_SEC)) || "";
          if (ref.startsWith("/uploads/")) return `${origin}${ref}`;
          return ref.startsWith("https://") ? ref : "";
        }),
      );
      jobs.push(toEasyNorenJob(lead, design, urls));
    }
    return NextResponse.json({ jobs }, { headers });
  } catch (err) {
    console.error("noren inbox", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ error: "inbox unavailable" }, { status: 500, headers });
  }
}
