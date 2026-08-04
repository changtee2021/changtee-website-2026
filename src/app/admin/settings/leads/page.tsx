import type { Metadata } from "next";
import { headers } from "next/headers";
import { SettingsSoonBoard } from "@/components/admin/SettingsSoonBoard";

export const metadata: Metadata = {
  title: "ค่าเริ่มต้น Lead",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  return (
    <SettingsSoonBoard
      basePath={basePath}
      title="ค่าเริ่มต้น Lead"
      description="สถานะเริ่มต้น มอบหมายเซลล์อัตโนมัติ และฟิลด์บังคับในฟอร์ม"
    />
  );
}
