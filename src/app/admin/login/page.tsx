import type { Metadata } from "next";
import { headers } from "next/headers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
};

export default async function AdminLoginPage() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";

  return <AdminLoginForm basePath={basePath} />;
}
