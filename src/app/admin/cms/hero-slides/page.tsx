import type { Metadata } from "next";
import { HeroSlidesCmsBoard } from "@/components/admin/HeroSlidesCmsBoard";

export const metadata: Metadata = {
  title: "สไลด์หน้าแรก",
  robots: { index: false, follow: false },
};

export default function AdminHeroSlidesPage() {
  return <HeroSlidesCmsBoard />;
}
