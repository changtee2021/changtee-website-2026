import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { listVisitBookings } from "@/lib/visits/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  try {
    const visits = await listVisitBookings();
    return NextResponse.json({ visits });
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
