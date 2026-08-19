import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminForceLight } from "@/components/admin/AdminForceLight";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getAdminSession,
  isAdminAuthEnforced,
  isAdminLoginPath,
} from "@/lib/admin-auth";
import { getSiteUrl, isEditorPath } from "@/lib/admin-host";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | ช่างตี๋ Admin",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#eef2f7",
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

  // Page Editor is its own full-bleed shell (no AdminSidebar)
  if (isEditorPath(pathname, basePath)) {
    return (
      <>
        <AdminForceLight />
        {children}
      </>
    );
  }

  return (
    <>
      <AdminForceLight />
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
    </>
  );
}
