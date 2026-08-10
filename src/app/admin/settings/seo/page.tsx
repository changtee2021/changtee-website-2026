import type { Metadata } from "next";
import { headers } from "next/headers";
import { SeoSettingsBoard } from "@/components/admin/SeoSettingsBoard";
import { loadSeoDefaults } from "@/lib/seo/seo-defaults";

export const metadata: Metadata = {
  title: "SEO / Meta เริ่มต้น",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  const initial = await loadSeoDefaults();
  return <SeoSettingsBoard basePath={basePath} initial={initial} />;
}
