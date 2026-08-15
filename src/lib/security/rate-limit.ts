import { createServiceSupabase } from "@/lib/supabase/server";

const memoryBuckets = new Map<string, number[]>();

function pruneMemory(key: string, now: number, windowMs: number) {
  const next = (memoryBuckets.get(key) ?? []).filter((t) => t > now - windowMs);
  memoryBuckets.set(key, next);
  return next;
}

function memoryHit(key: string, windowMs: number, max: number) {
  const now = Date.now();
  const timestamps = pruneMemory(key, now, windowMs);
  timestamps.push(now);
  memoryBuckets.set(key, timestamps);
  return timestamps.length > max;
}

async function supabaseHit(key: string, windowMs: number, max: number) {
  const supabase = createServiceSupabase();
  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { data: existing, error: readError } = await supabase
    .from("rate_limits")
    .select("key, window_started_at, hit_count")
    .eq("key", key)
    .maybeSingle();

  if (readError) throw readError;

  const nowIso = new Date().toISOString();
  const stale =
    !existing ||
    new Date(String(existing.window_started_at)).getTime() < Date.now() - windowMs;

  if (stale) {
    const { error } = await supabase.from("rate_limits").upsert({
      key,
      window_started_at: nowIso,
      hit_count: 1,
      updated_at: nowIso,
    });
    if (error) throw error;
    return false;
  }

  const nextCount = Number(existing.hit_count || 0) + 1;
  const { error } = await supabase
    .from("rate_limits")
    .update({ hit_count: nextCount, updated_at: nowIso })
    .eq("key", key)
    .gte("window_started_at", windowStart);
  if (error) throw error;
  return nextCount > max;
}

export function getRequestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Durable when Supabase is configured; otherwise in-memory (dev / isolate). */
export async function isRateLimited(
  request: Request,
  opts: { scope: string; windowMs: number; max: number },
) {
  const key = `${opts.scope}:${getRequestIp(request)}`;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return await supabaseHit(key, opts.windowMs, opts.max);
    }
  } catch (error) {
    console.warn("rate-limit supabase fallback", error);
  }
  return memoryHit(key, opts.windowMs, opts.max);
}
