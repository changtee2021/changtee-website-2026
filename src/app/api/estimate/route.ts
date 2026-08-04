import { NextResponse } from "next/server";
import {
  calculateEstimateRange,
  estimateInputSchema,
} from "@/lib/validations/estimate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = estimateInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const range = calculateEstimateRange(parsed.data);
    return NextResponse.json(range);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
