import { NextResponse } from "next/server";

const DEMO_SESSION_VALUE = "1";

export function assertAdminApiAccess(request: Request): NextResponse | null {
  if (process.env.ALLOW_OPEN_ADMIN_API === "true") return null;

  const session = request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("changtee_admin="))
    ?.slice("changtee_admin=".length);
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const hasValidSession =
    (process.env.NODE_ENV !== "production" && session === DEMO_SESSION_VALUE) ||
    (Boolean(sessionSecret) && session === sessionSecret);
  const hasValidDevKey =
    Boolean(process.env.ADMIN_DEV_API_KEY) &&
    request.headers.get("x-admin-dev-key") === process.env.ADMIN_DEV_API_KEY;

  if (hasValidSession || hasValidDevKey) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
