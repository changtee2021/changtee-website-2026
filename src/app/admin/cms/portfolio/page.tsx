import type { Metadata } from "next";
import { PortfolioCmsBoard } from "@/components/admin/PortfolioCmsBoard";

export const metadata: Metadata = {
  title: "ผลงาน",
  robots: { index: false, follow: false },
};

export default function AdminPortfolioCmsPage() {
  return <PortfolioCmsBoard />;
}
