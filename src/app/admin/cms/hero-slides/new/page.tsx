import type { Metadata } from "next";
import { HeroSlideEditor } from "@/components/admin/HeroSlideEditor";

export const metadata: Metadata = {
  title: "เพิ่มสไลด์",
  robots: { index: false, follow: false },
};

export default function AdminHeroSlideNewPage() {
  return <HeroSlideEditor />;
}
