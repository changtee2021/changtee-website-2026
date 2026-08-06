import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getAdminSession,
  isAdminAuthEnforced,
  isAdminLoginPath,
} from "@/lib/admin-auth";
import { getSiteUrl } from "@/lib/admin-host";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | ช่างตี๋ Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  const pathname = headerStore.get("x-changtee-pathname") || `${basePath}/`;
  const session = await getAdminSession();

  if (
    isAdminAuthEnforced() &&
    !session &&
    !isAdminLoginPath(pathname, basePath)
  ) {
    redirect(`${basePath}/login`.replace(/\/+/g, "/") || "/login");
  }

  return (
    <AdminShell
      basePath={basePath}
      siteUrl={getSiteUrl()}
      sessionLabel={
        session
          ? {
              fullName: session.fullName,
              employeeCode: session.employeeCode,
              roleLabel: session.roleLabel,
            }
          : undefined
      }
    >
      {children}
    </AdminShell>
  );
}
