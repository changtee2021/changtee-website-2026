/** Simple in-memory login rate limit (per isolate). Slows credential stuffing. */

type Bucket = { fails: number; blockedUntil: number };

const buckets = new Map<string, Bucket>();

const MAX_FAILS = 8;
const BLOCK_MS = 15 * 60 * 1000;

function prune(now: number) {
  if (buckets.size < 400) return;
  for (const [key, value] of buckets) {
    if (value.blockedUntil < now && value.fails === 0) buckets.delete(key);
  }
}

export function getClientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function assertLoginAllowed(
  ip: string,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);
  const bucket = buckets.get(ip);
  if (!bucket) return { ok: true };
  if (bucket.blockedUntil > now) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }
  return { ok: true };
}

export function recordLoginFailure(ip: string) {
  const now = Date.now();
  const prev = buckets.get(ip) ?? { fails: 0, blockedUntil: 0 };
  if (prev.blockedUntil > now) return;
  const fails = prev.fails + 1;
  if (fails >= MAX_FAILS) {
    buckets.set(ip, { fails: 0, blockedUntil: now + BLOCK_MS });
  } else {
    buckets.set(ip, { fails, blockedUntil: 0 });
  }
}

export function recordLoginSuccess(ip: string) {
  buckets.delete(ip);
}
