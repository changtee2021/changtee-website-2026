"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IBM_Plex_Sans_Thai, Prompt } from "next/font/google";
import { reportClientError } from "@/lib/security/report-client-error";

const sans = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Prompt({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <html lang="th">
      <body
        className={`${sans.className} ${display.className} flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center text-slate-900`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          HTTP 500
        </p>
        <h1 className="mt-3 text-2xl font-semibold">เซิร์ฟเวอร์ขัดข้อง</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          ระบบมีปัญหาชั่วคราว ลองใหม่อีกครั้งหรือกลับหน้าแรก
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            ลองใหม่
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold"
          >
            หน้าแรก
          </Link>
        </div>
      </body>
    </html>
  );
}
