import type { Metadata } from "next";
import { CareersCmsBoard } from "@/components/admin/CareersCmsBoard";

export const metadata: Metadata = {
  title: "ประกาศรับสมัครงาน",
  robots: { index: false, follow: false },
};

export default function AdminCareersPage() {
  return <CareersCmsBoard />;
}
