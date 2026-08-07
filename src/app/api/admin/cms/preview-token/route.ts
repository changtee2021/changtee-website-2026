import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
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
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const pageKey =
    typeof body?.pageKey === "string" ? body.pageKey.slice(0, 80) : undefined;

  const token = await createPreviewToken(session.employeeCode, pageKey);
  if (!token) {
    return NextResponse.json(
      { error: "ADMIN_SESSION_SECRET is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({ token });
}
