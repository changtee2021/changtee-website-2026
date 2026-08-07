import { getAdminSessionSecret } from "@/lib/admin-session";
import { PREVIEW_TOKEN_TTL_MS } from "@/lib/editor/protocol";

type PreviewPayload = {
  v: 1;
  /** Admin session subject (employee code) — token is useless if stolen alone */
  sub: string;
  /** Page key being previewed (optional scope hint) */
  pageKey?: string;
  exp: number;
};

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

export async function createPreviewToken(
  employeeCode: string,
  pageKey?: string,
  ttlMs = PREVIEW_TOKEN_TTL_MS,
): Promise<string | null> {
  const secret = getAdminSessionSecret();
  if (!secret) return null;
  const payload: PreviewPayload = {
    v: 1,
    sub: employeeCode.trim(),
    pageKey,
    exp: Math.floor((Date.now() + ttlMs) / 1000),
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSign(secret, `preview:${body}`);
  return `${body}.${sig}`;
}

export async function verifyPreviewToken(
  token: string | undefined | null,
): Promise<{ employeeCode: string; pageKey?: string } | null> {
  if (!token || !token.includes(".")) return null;
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = await hmacSign(secret, `preview:${body}`);
  if (!(await timingSafeEqual(sig, expected))) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(json) as PreviewPayload;
    if (payload.v !== 1 || typeof payload.sub !== "string" || !payload.sub) {
      return null;
    }
    if (typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      employeeCode: payload.sub,
      pageKey: typeof payload.pageKey === "string" ? payload.pageKey : undefined,
    };
  } catch {
    return null;
  }
}
