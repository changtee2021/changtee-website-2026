import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { isAdminAuthEnforced } from "@/lib/admin-auth-edge";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session";
import { createPreviewToken } from "@/lib/editor/preview-token";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`),
  );
  const session = await verifyAdminSessionToken(
    match?.[1] ? decodeURIComponent(match[1]) : null,
  );

  // When login is optional, still issue preview tokens for the open admin UI.
  const employeeCode =
    session?.employeeCode ||
    (!isAdminAuthEnforced() ? "open-admin" : null);

  if (!employeeCode) {
    return NextResponse.json(
      { error: "Unauthorized — กรุณาล็อกอินก่อนใช้พรีวิว" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const pageKey =
    typeof body?.pageKey === "string" ? body.pageKey.slice(0, 80) : undefined;

  const token = await createPreviewToken(employeeCode, pageKey);
  if (!token) {
    return NextResponse.json(
      {
        error:
          "ADMIN_SESSION_SECRET ยังไม่ได้ตั้งบนเซิร์ฟเวอร์ — ตั้งค่าแล้ว redeploy",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ token });
}
