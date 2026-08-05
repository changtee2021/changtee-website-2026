import type { Metadata } from "next";
import { HomeSectionsCmsBoard } from "@/components/admin/HomeSectionsCmsBoard";

export const metadata: Metadata = {
  title: "หน้าแรก — sections",
  robots: { index: false, follow: false },
};

export default function AdminHomeSectionsPage() {
  return <HomeSectionsCmsBoard />;
}
