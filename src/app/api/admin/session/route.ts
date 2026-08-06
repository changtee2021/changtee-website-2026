import { NextResponse } from "next/server";
import { previewLogin } from "@/lib/admin-auth";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_USER_COOKIE,
  getAdminSessionSecret,
} from "@/lib/admin-session";

export const runtime = "nodejs";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const employeeCode = typeof body?.employeeCode === "string" ? body.employeeCode : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const result = previewLogin(employeeCode, password);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  const sessionValue = getAdminSessionSecret();
  if (!sessionValue) {
    return NextResponse.json(
      {
        ok: false,
        error: "Admin session is not configured — set ADMIN_SESSION_SECRET",
      },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true, user: result.user });
  response.cookies.set(ADMIN_SESSION_COOKIE, sessionValue, COOKIE_OPTS);
  response.cookies.set(
    ADMIN_SESSION_USER_COOKIE,
    result.user.employeeCode,
    COOKIE_OPTS,
  );
  return response;
}

export function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
  response.cookies.set(ADMIN_SESSION_USER_COOKIE, "", {
    ...COOKIE_OPTS,
    maxAge: 0,
  });
  return response;
}
