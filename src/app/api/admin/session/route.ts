import { NextResponse } from "next/server";
import { previewLogin } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const employeeCode = typeof body?.employeeCode === "string" ? body.employeeCode : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const result = previewLogin(employeeCode, password);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 });
  }

  const sessionValue =
    process.env.ADMIN_SESSION_SECRET ??
    (process.env.NODE_ENV === "production" ? null : "1");
  if (!sessionValue) {
    return NextResponse.json(
      { ok: false, error: "Admin session is not configured" },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true, user: result.user });
  response.cookies.set("changtee_admin", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("changtee_admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
