import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { APPLICATION_STATUSES } from "@/lib/careers/types";
import { updateApplication } from "@/lib/careers/store";

export const runtime = "nodejs";

const bodySchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  interviewAt: z.string().optional(),
  rejectReason: z.string().optional(),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    const body = parsed.data;
    if (body.status === "interview_scheduled" && !body.interviewAt?.trim()) {
      return NextResponse.json(
        { error: "กรุณาเลือกวันและเวลานัดสัมภาษณ์" },
        { status: 400 },
      );
    }
    if (body.status === "rejected" && !body.rejectReason?.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุสาเหตุที่ไม่ผ่านการพิจารณา" },
        { status: 400 },
      );
    }

    const application = await updateApplication(id, {
      status: body.status,
      interviewAt: body.interviewAt?.trim() || null,
      rejectReason: body.rejectReason?.trim() || null,
    });
    if (!application) {
      return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, application });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
