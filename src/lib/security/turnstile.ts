export function turnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
}

/** Verify Turnstile when keys exist. Production requires keys; local may skip. */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  ip?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!turnstileConfigured()) {
    if (isProductionRuntime()) {
      return {
        ok: false,
        error: "ระบบป้องกันสแปมยังไม่พร้อม กรุณาลองใหม่หรือติดต่อทาง LINE",
      };
    }
    return { ok: true };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY!.trim();
  if (!token?.trim()) {
    return { ok: false, error: "กรุณายืนยันว่าคุณไม่ใช่บอท" };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token.trim());
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const json = (await res.json()) as { success?: boolean };
    if (!json.success) {
      return { ok: false, error: "ยืนยันตัวตนไม่สำเร็จ ลองใหม่อีกครั้ง" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "ตรวจสอบความปลอดภัยล้มเหลวชั่วคราว" };
  }
}
