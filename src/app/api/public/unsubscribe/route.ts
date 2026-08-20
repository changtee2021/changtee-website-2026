import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/marketing/store";
import { isRateLimited } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (
    await isRateLimited(request, {
      scope: "unsubscribe",
      windowMs: 15 * 60 * 1000,
      max: 20,
    })
  ) {
    return NextResponse.json(
      { error: "ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง" },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim() || "";
  if (!token) {
    return NextResponse.json({ error: "ลิงก์ไม่ถูกต้อง" }, { status: 400 });
  }

  const result = await unsubscribeByToken(token);
  if (!result.ok) {
    return NextResponse.json({ error: "ลิงก์ไม่ถูกต้องหรือใช้ไปแล้ว" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
