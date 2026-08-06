import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-shell px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        {siteConfig.nameEn}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
        ไม่พบหน้านี้
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        ลิงก์อาจหมดอายุ หรือหน้าที่คุณต้องการไม่มีในเว็บไซต์
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
        >
          กลับหน้าแรก
        </Link>
        <Link
          href="/quote"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
        >
          ขอใบเสนอราคา
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper"
        >
          ติดต่อเรา
        </Link>
      </div>
    </div>
  );
}
