import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "ภาพรวมสถิติ",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";

  return <AdminDashboard basePath={basePath} />;
}
