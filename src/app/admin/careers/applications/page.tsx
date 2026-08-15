import type { Metadata } from "next";
import { JobApplicationsBoard } from "@/components/admin/JobApplicationsBoard";

export const metadata: Metadata = {
  title: "ใบสมัครงาน",
  robots: { index: false, follow: false },
};

export default function AdminJobApplicationsPage() {
  return <JobApplicationsBoard />;
}
