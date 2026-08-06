"use client";

import Link from "next/link";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-navy">
        โหลดหน้านี้ไม่สำเร็จ
      </h1>
      <p className="mt-2 text-sm text-muted">
        ลองรีเฟรชอีกครั้ง หรือกลับไปหน้าแรก
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          ลองอีกครั้ง
        </button>
        <Link
          href="/"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
        >
          ไปหน้าแรก
        </Link>
      </div>
    </div>
  );
}
