import type { Metadata } from "next";
import { headers } from "next/headers";
import { EstimatorRatesBoard } from "@/components/admin/EstimatorRatesBoard";

export const metadata: Metadata = {
  title: "อัตราประเมินราคา",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  return <EstimatorRatesBoard basePath={basePath} />;
}
