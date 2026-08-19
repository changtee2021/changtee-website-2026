"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LockKeyhole, UserRound } from "lucide-react";
import { BOOTSTRAP_ADMIN_CODE } from "@/lib/admin-users";
import { adminHref } from "@/lib/admin-nav";

type AdminLoginFormProps = {
  basePath: string;
};

export function AdminLoginForm({ basePath }: AdminLoginFormProps) {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState(BOOTSTRAP_ADMIN_CODE);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ employeeCode, password }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        user?: { fullName: string; roleLabel: string };
      };

      if (!response.ok || !result.ok || !result.user) {
        setError(result.error || "ไม่สามารถเข้าสู่ระบบได้");
        return;
      }

      router.replace(adminHref(basePath, ""));
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบเข้าสู่ระบบได้");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2f7] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="relative size-11 overflow-hidden rounded-xl bg-navy ring-1 ring-line">
            <Image
              src="/images/brand/logo-mark-nav.png"
              alt="ช่างตี๋"
              fill
              className="object-contain p-0.5"
              sizes="44px"
              priority
            />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-navy">
              เข้าสู่ระบบ Admin
            </h1>
            <p className="text-sm text-muted">ช่างตี๋ · ระบบหลังบ้านเว็บไซต์</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-paper px-3 py-2.5 text-xs text-muted">
          ต้องเข้าสู่ระบบก่อนเข้าใช้งานหลังบ้าน
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-xs text-muted">
            รหัสพนักงาน
            <div className="relative mt-1">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                autoComplete="username"
                placeholder="000000"
                className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-3 text-sm text-navy outline-none focus:border-navy"
              />
            </div>
          </label>

          <label className="block text-xs text-muted">
            รหัสผ่าน
            <div className="relative mt-1">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-3 text-sm text-navy outline-none focus:border-navy"
              />
            </div>
          </label>

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-navy py-2.5 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60"
          >
            {isSubmitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ Admin"}
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-line bg-paper px-3 py-3 text-xs text-muted">
          <div className="font-medium text-navy">บัญชี bootstrap</div>
          <div className="mt-1">
            รหัสพนักงาน:{" "}
            <span className="font-mono text-navy">{BOOTSTRAP_ADMIN_CODE}</span>
            {" · "}
            บทบาท: แอดมิน
          </div>
          <div className="mt-1">
            Local: รหัสผ่านเริ่มต้นใน{" "}
            <span className="font-mono">DEMO_ADMIN_PASSWORD</span> (หรือ{" "}
            <span className="font-mono">changtee000000</span>)
          </div>
          <div>
            Production: ต้องตั้ง{" "}
            <span className="font-mono">DEMO_ADMIN_PASSWORD</span> และ{" "}
            <span className="font-mono">ADMIN_SESSION_SECRET</span>
          </div>
        </div>
      </div>
    </div>
  );
}
