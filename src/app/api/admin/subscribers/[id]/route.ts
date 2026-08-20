import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { unsubscribeById } from "@/lib/marketing/store";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;

  if (body?.status !== "unsubscribed") {
    return NextResponse.json({ error: "รองรับเฉพาะการถอนความยินยอม" }, { status: 400 });
  }

  const ok = await unsubscribeById(id);
  if (!ok) {
    return NextResponse.json({ error: "ไม่พบรายชื่อนี้" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
