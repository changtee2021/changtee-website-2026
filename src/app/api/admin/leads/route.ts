import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { listLeads } from "@/lib/leads/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  try {
    const leads = await listLeads();
    return NextResponse.json({ leads });
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
