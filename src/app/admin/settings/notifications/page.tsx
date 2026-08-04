import type { Metadata } from "next";
import { headers } from "next/headers";
import { SettingsSoonBoard } from "@/components/admin/SettingsSoonBoard";

export const metadata: Metadata = {
  title: "การแจ้งเตือน",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  return (
    <SettingsSoonBoard
      basePath={basePath}
      title="การแจ้งเตือน"
      description="อีเมล · LINE · webhook เมื่อมี lead ใหม่ — ใช้ outbound_jobs"
    />
  );
}
