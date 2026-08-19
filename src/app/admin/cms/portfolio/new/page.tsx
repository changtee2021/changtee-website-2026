import type { Metadata } from "next";
import { PortfolioAiWizard } from "@/components/admin/PortfolioAiWizard";

export const metadata: Metadata = {
  title: "ลงผลงาน",
  robots: { index: false, follow: false },
};

export default function AdminPortfolioNewPage() {
  return <PortfolioAiWizard />;
}
