import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { VISIT_NEXT_STEPS } from "@/lib/visits/outcome";
import { VISIT_SESSIONS, VISIT_STATUSES } from "@/lib/visits/types";
import { updateVisitBooking } from "@/lib/visits/store";

export const runtime = "nodejs";

const scoreSchema = z.object({
  welcome: z.number().int().min(1).max(5),
  process: z.number().int().min(1).max(5),
  samples: z.number().int().min(1).max(5),
  needs: z.number().int().min(1).max(5),
  deal: z.number().int().min(1).max(5),
});

const bodySchema = z.object({
  status: z.enum(VISIT_STATUSES),
  visitDate: z.string().optional(),
  session: z.enum(VISIT_SESSIONS).optional(),
  cancelReason: z.string().optional(),
  rescheduleReason: z.string().optional(),
  previousVisitDate: z.string().optional(),
  previousSession: z.enum(VISIT_SESSIONS).optional(),
  outcomeScores: scoreSchema.optional(),
  outcomeNote: z.string().optional(),
  outcomeNextStep: z.enum(VISIT_NEXT_STEPS).optional(),
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
    if (body.status === "cancelled" && !body.cancelReason?.trim()) {
      return NextResponse.json(
        { error: "กรุณาระบุเหตุผลที่ยกเลิกนัด" },
        { status: 400 },
      );
    }
    if (body.status === "rescheduled") {
      if (!body.visitDate || !body.session || !body.rescheduleReason?.trim()) {
        return NextResponse.json(
          { error: "กรุณาเลือกวัน รอบ และเหตุผลที่เลื่อนนัด" },
          { status: 400 },
        );
      }
    }
    if (body.status === "completed") {
      if (!body.outcomeScores || !body.outcomeNextStep) {
        return NextResponse.json(
          { error: "กรุณาให้คะแนน 5 ข้อ และเลือกขั้นตอนถัดไป" },
          { status: 400 },
        );
      }
    }

    const visit = await updateVisitBooking(id, {
      status: body.status,
      visitDate: body.visitDate,
      session: body.session,
      cancelReason: body.cancelReason?.trim() || null,
      rescheduleReason: body.rescheduleReason?.trim() || null,
      previousVisitDate: body.previousVisitDate || null,
      previousSession: body.previousSession,
      outcomeScores: body.outcomeScores ?? null,
      outcomeNote: body.outcomeNote?.trim() || null,
      outcomeNextStep: body.outcomeNextStep ?? null,
    });
    if (!visit) {
      return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, visit });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
