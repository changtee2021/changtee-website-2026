import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { adminHref } from "@/lib/admin-nav";

export const metadata: Metadata = {
  title: "การเชื่อมต่อ",
  robots: { index: false, follow: false },
};

function flag(value: string | undefined, fallbackUsed = false) {
  if (value?.trim()) return { ok: true, label: "ตั้งใน env แล้ว" };
  if (fallbackUsed) return { ok: true, label: "ใช้ค่าจากเว็บเดิม" };
  return { ok: false, label: "ยังไม่ตั้ง" };
}

export default async function Page() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";

  const rows = [
    {
      name: "GTM",
      ...flag(process.env.NEXT_PUBLIC_GTM_ID, true),
      note: "โหลดหลังลูกค้ายินยอมคุกกี้วิเคราะห์ · ค่าเริ่ม GTM-5JX8PGT จากเว็บเดิม",
    },
    {
      name: "GA4",
      ...flag(process.env.NEXT_PUBLIC_GA4_ID),
      note: "ใส่ถ้าจะยิงตรงจากเว็บ นอกเหนือแท็กใน GTM",
    },
    {
      name: "Meta Pixel",
      ...flag(process.env.NEXT_PUBLIC_META_PIXEL_ID),
      note: "โหลดหลังยินยอมคุกกี้การตลาด · เว็บเดิมยังไม่มี pixel",
    },
    {
      name: "Turnstile",
      ...flag(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
      note: "บังคับบน production",
    },
    {
      name: "SMTP",
      ...flag(process.env.SMTP_PASS),
      note: "ทีมกำลังตั้งค่า — ไม่โชว์รหัส",
    },
    {
      name: "LINE notify",
      ...flag(process.env.LINE_CHANNEL_ACCESS_TOKEN),
      note: "ยังไม่เปิดรอบนี้",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <Link
          href={adminHref(basePath, "/settings")}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-navy"
        >
          <ArrowLeft className="size-4" />
          ตั้งค่าระบบ
        </Link>
        <h2 className="mt-3 font-display text-xl font-semibold text-navy">
          การเชื่อมต่อ
        </h2>
        <p className="mt-2 text-sm text-muted">
          สถานะ env แบบ configured / missing — ไม่โชว์ค่าลับ
        </p>
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
          {rows.map((row) => (
            <li key={row.name} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-navy">{row.name}</p>
                <p className="mt-0.5 text-xs text-muted">{row.note}</p>
              </div>
              <span
                className={
                  row.ok
                    ? "shrink-0 rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy"
                    : "shrink-0 rounded-full bg-shell px-2.5 py-1 text-xs font-medium text-muted"
                }
              >
                {row.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
