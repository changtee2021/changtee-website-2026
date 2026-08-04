import type { Metadata } from "next";
import { headers } from "next/headers";
import { CompanySettingsBoard } from "@/components/admin/CompanySettingsBoard";

export const metadata: Metadata = {
  title: "ข้อมูลบริษัท",
  robots: { index: false, follow: false },
};

export default async function AdminCompanySettingsPage() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  return <CompanySettingsBoard basePath={basePath} />;
}
