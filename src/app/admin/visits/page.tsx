import type { Metadata } from "next";
import { VisitsBoard } from "@/components/admin/VisitsBoard";

export const metadata: Metadata = {
  title: "นัดเยี่ยมชมโรงงาน",
  robots: { index: false, follow: false },
};

export default function AdminVisitsPage() {
  return <VisitsBoard />;
}
