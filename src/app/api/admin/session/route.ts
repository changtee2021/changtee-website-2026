import { NextResponse } from "next/server";
import { previewLogin } from "@/lib/admin-auth";
import {
  assertLoginAllowed,
  getClientIp,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/admin-login-rate-limit";
import { isRateLimited } from "@/lib/security/rate-limit";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_USER_COOKIE,
  SESSION_MAX_AGE_SEC,
  adminSessionCookieOptions,
  createAdminSessionToken,
  getAdminSessionSecret,
} from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (
    await isRateLimited(request, {
      scope: "admin-login",
      windowMs: 15 * 60 * 1000,
      max: 20,
    })
  ) {
    return NextResponse.json(
      { ok: false, error: "ลองเข้าสู่ระบบบ่อยเกินไป — รอสักครู่แล้วลองใหม่" },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }
  const limited = assertLoginAllowed(ip);
  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `ลองเข้าสู่ระบบบ่อยเกินไป — รอ ${limited.retryAfterSec} วินาที`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const employeeCode =
    typeof body?.employeeCode === "string" ? body.employeeCode.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!employeeCode || !password) {
    return NextResponse.json(
      { ok: false, error: "กรอกรหัสพนักงานและรหัสผ่าน" },
      { status: 400 },
    );
  }

  if (!getAdminSessionSecret()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ยังไม่ได้ตั้ง ADMIN_SESSION_SECRET บนเซิร์ฟเวอร์ — ติดต่อผู้ดูแลระบบ",
      },
      { status: 503 },
    );
  }

  const result = previewLogin(employeeCode, password);
  if (!result.ok) {
    recordLoginFailure(ip);
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  const token = await createAdminSessionToken(result.user.employeeCode);
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถสร้าง session ได้" },
      { status: 503 },
    );
  }

  recordLoginSuccess(ip);
  const cookieOpts = adminSessionCookieOptions(SESSION_MAX_AGE_SEC);
  const response = NextResponse.json({ ok: true, user: result.user });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, cookieOpts);
  response.cookies.set(
    ADMIN_SESSION_USER_COOKIE,
    result.user.employeeCode,
    cookieOpts,
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function DELETE() {
  const cookieOpts = { ...adminSessionCookieOptions(0), maxAge: 0 };
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", cookieOpts);
  response.cookies.set(ADMIN_SESSION_USER_COOKIE, "", cookieOpts);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
