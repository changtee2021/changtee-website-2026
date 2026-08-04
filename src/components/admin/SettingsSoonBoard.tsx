"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminHref } from "@/lib/admin-nav";

type SettingsSoonBoardProps = {
  basePath: string;
  title: string;
  description: string;
};

export function SettingsSoonBoard({
  basePath,
  title,
  description,
}: SettingsSoonBoardProps) {
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
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 rounded-xl border border-dashed border-line bg-paper px-4 py-6 text-center text-sm text-muted">
          เร็วๆ นี้ — โครงเมนูพร้อมแล้ว รอลงรายละเอียดรอบถัดไป
        </div>
      </section>
    </div>
  );
}
