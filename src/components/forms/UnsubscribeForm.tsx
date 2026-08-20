"use client";

import { useState } from "react";

export function UnsubscribeForm({ token }: { token: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!token) {
      setError("ลิงก์ไม่ครบ กรุณาเปิดจากอีเมลข่าวสารอีกครั้ง หรือติดต่อร้าน");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/public/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "ถอนไม่สำเร็จ");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="mt-6 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink">
        ถอนการรับข่าวสารแล้ว จะไม่ส่งโปรโมชันไปที่อีเมลนี้อีก
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {error ? (
        <p className="text-sm text-brand-red" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void onSubmit()}
        disabled={pending}
        className="min-h-11 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "กำลังดำเนินการ..." : "ยืนยันถอนการรับข่าวสาร"}
      </button>
    </div>
  );
}
