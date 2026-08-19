import type { Metadata } from "next";
import { PortfolioAiWizard } from "@/components/admin/PortfolioAiWizard";

export const metadata: Metadata = {
  title: "แก้ไขผลงาน",
  robots: { index: false, follow: false },
};

export default async function AdminPortfolioEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PortfolioAiWizard id={id} />;
}
