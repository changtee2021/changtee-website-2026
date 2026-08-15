import type { Metadata } from "next";
import { LearnHub } from "@/components/learn/LearnHub";
import { pageMetadata } from "@/lib/seo/meta";

export const metadata: Metadata = pageMetadata({
  title: "ห้องเรียนรู้",
  description:
    "คัมภีร์ช่างตี๋ — แผ่นความรู้เรื่องผ้า ฉากกั้น และคลิปสอนติดมอเตอร์ สำหรับเซลส่งให้ลูกค้า",
  path: "/learn",
  keywords: ["ความรู้ผ้าม่าน", "วัดหน้างาน", "ติดตั้งมอเตอร์", "ช่างตี๋"],
});

export default function LearnPage() {
  return <LearnHub />;
}
