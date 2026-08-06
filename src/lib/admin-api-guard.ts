import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionValue,
} from "@/lib/admin-session";

export function assertAdminApiAccess(request: Request): NextResponse | null {
  if (process.env.ALLOW_OPEN_ADMIN_API === "true") return null;

  const session = request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(`${ADMIN_SESSION_COOKIE}=`.length);

  const hasValidSession = isValidAdminSessionValue(session);
  const hasValidDevKey =
    Boolean(process.env.ADMIN_DEV_API_KEY) &&
    request.headers.get("x-admin-dev-key") === process.env.ADMIN_DEV_API_KEY;

  if (hasValidSession || hasValidDevKey) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
