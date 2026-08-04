import type { Metadata } from "next";
import { headers } from "next/headers";
import { SettingsSoonBoard } from "@/components/admin/SettingsSoonBoard";

export const metadata: Metadata = {
  title: "การเชื่อมต่อ",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  return (
    <SettingsSoonBoard
      basePath={basePath}
      title="การเชื่อมต่อ"
      description="GA4 · Pixel · สถานะ env (configured / missing) โดยไม่โชว์ secret"
    />
  );
}
