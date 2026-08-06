import { DEMO_STAFF, findStaffByEmployeeCode, type StaffUser } from "@/lib/admin-users";

export const ADMIN_SESSION_COOKIE = "changtee_admin";
export const ADMIN_SESSION_USER_COOKIE = "changtee_admin_uid";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 8;

type SessionPayload = {
  v: 1;
  sub: string;
  exp: number;
};

function getRawSecret(): string | null {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  if (configured) return configured;
  // Local/dev only fallback — never in production / Vercel
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) return null;
  return "changtee-local-dev-session";
}

export function getAdminSessionSecret(): string | null {
  return getRawSecret();
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i += 1) binary += String.fromCharCode(arr[i]!);
  const b64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const b64 = padded + pad;
  const binary =
    typeof atob === "function"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("binary");
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return toBase64Url(sig);
}

async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < aa.length; i += 1) out |= aa[i]! ^ bb[i]!;
  return out === 0;
}

export async function createAdminSessionToken(
  employeeCode: string,
  maxAgeSec = SESSION_MAX_AGE_SEC,
): Promise<string | null> {
  const secret = getRawSecret();
  if (!secret) return null;
  const payload: SessionPayload = {
    v: 1,
    sub: employeeCode.trim(),
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
): Promise<{ employeeCode: string } | null> {
  if (!token || !token.includes(".")) return null;
  const secret = getRawSecret();
  if (!secret) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = await hmacSign(secret, body);
  if (!(await timingSafeEqual(sig, expected))) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.v !== 1 || typeof payload.sub !== "string") return null;
    if (!payload.sub || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { employeeCode: payload.sub };
  } catch {
    return null;
  }
}

/** @deprecated use verifyAdminSessionToken — kept name for call-site clarity */
export async function isValidAdminSessionValue(
  session: string | undefined | null,
): Promise<boolean> {
  return (await verifyAdminSessionToken(session)) !== null;
}

export function resolveStaffFromEmployeeCode(
  employeeCode: string | undefined | null,
  users: StaffUser[] = DEMO_STAFF,
): StaffUser | null {
  if (!employeeCode) return null;
  const staff = findStaffByEmployeeCode(employeeCode, users);
  if (!staff || !staff.active) return null;
  return staff;
}

export function adminSessionCookieOptions(maxAge = SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
