import type { Metadata } from "next";
import { headers } from "next/headers";
import { SettingsHub } from "@/components/admin/SettingsHub";

export const metadata: Metadata = {
  title: "ตั้งค่าระบบ",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  return <SettingsHub basePath={basePath} />;
}
