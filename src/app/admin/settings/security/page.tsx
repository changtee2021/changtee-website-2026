import type { Metadata } from "next";
import { headers } from "next/headers";
import { SettingsSoonBoard } from "@/components/admin/SettingsSoonBoard";

export const metadata: Metadata = {
  title: "ความปลอดภัย",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  return (
    <SettingsSoonBoard
      basePath={basePath}
      title="ความปลอดภัย"
      description="ล็อกอินแอดมินเปิดอยู่บน production · เข้าที่ /admin/login ด้วยรหัสพนักงาน"
    />
  );
}
