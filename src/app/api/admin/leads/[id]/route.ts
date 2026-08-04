import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { LEAD_STATUSES } from "@/lib/leads/types";
import { updateLeadStatus } from "@/lib/leads/store";

export const runtime = "nodejs";

const bodySchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const unauthorized = assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
    }

    const lead = await updateLeadStatus(id, parsed.data.status);
    if (!lead) {
      return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
