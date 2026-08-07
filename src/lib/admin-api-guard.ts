import { NextResponse } from "next/server";
import { isAdminAuthEnforced } from "@/lib/admin-auth-edge";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

function allowOpenAdminApi(): boolean {
  if (isAdminAuthEnforced()) return false;
  if (process.env.ALLOW_OPEN_ADMIN_API === "false") return false;
  return true;
}

export async function assertAdminApiAccess(
  request: Request,
): Promise<NextResponse | null> {
  if (allowOpenAdminApi()) return null;

  const session = request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(`${ADMIN_SESSION_COOKIE}=`.length);

  const verified = await verifyAdminSessionToken(
    session ? decodeURIComponent(session) : null,
  );

  const hasValidDevKey =
    !process.env.VERCEL &&
    process.env.NODE_ENV !== "production" &&
    Boolean(process.env.ADMIN_DEV_API_KEY) &&
    request.headers.get("x-admin-dev-key") === process.env.ADMIN_DEV_API_KEY;

  if (verified || hasValidDevKey) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
