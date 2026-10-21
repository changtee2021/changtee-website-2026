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
  const { data, error } = await supabase.rpc("rate_limit_hit", {
    _key: key,
    _window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    _max: max,
  });
  if (error) throw error;
  return Boolean(data);
}

export function getRequestIp(request: Request) {
  const vercelForwarded = request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (vercelForwarded) return vercelForwarded;
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
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
