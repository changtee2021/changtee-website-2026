import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthEnforced } from "@/lib/admin-auth-edge";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
};

export default async function AdminLoginPage() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";

  if (!isAdminAuthEnforced()) {
    redirect(basePath || "/");
  }

  return <AdminLoginForm basePath={basePath} />;
}
