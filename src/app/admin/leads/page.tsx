import type { Metadata } from "next";
import { LeadsBoard } from "@/components/admin/LeadsBoard";

export const metadata: Metadata = {
  title: "คำขอใบเสนอราคา",
  robots: { index: false, follow: false },
};

export default function AdminLeadsPage() {
  return <LeadsBoard />;
}
