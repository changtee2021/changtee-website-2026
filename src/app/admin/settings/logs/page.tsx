import type { Metadata } from "next";
import { headers } from "next/headers";
import { SystemLogsBoard } from "@/components/admin/SystemLogsBoard";

export const metadata: Metadata = {
  title: "Logs / ประวัติ",
  robots: { index: false, follow: false },
};

export default async function AdminLogsPage() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  return <SystemLogsBoard basePath={basePath} />;
}
