import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { listJobApplications } from "@/lib/careers/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  try {
    const applications = await listJobApplications();
    return NextResponse.json({ applications });
  } catch (err) {
    const message =
      process.env.NODE_ENV === "production"
        ? "Server error"
        : err instanceof Error
          ? err.message
          : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
