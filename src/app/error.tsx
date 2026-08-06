"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="font-display text-2xl font-semibold text-navy">
        เกิดข้อผิดพลาด
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        โหลดหน้าไม่สำเร็จ ลองใหม่อีกครั้ง หรือกลับไปหน้าแรก
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
        >
          ลองใหม่
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
        >
          หน้าแรก
        </Link>
      </div>
    </div>
  );
}
