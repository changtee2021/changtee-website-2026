import type { Metadata } from "next";
import { AboutPageView } from "@/components/about/AboutPageView";
import { pageMetadata } from "@/lib/seo/meta";

export const metadata: Metadata = pageMetadata({
  title: "เกี่ยวกับเรา",
  description:
    "ช่างม่านที่เข้าใจคุณ — ออกแบบ ผลิต ติดตั้งผ้าม่านครบวงจร มีโรงงานเอง วัดหน้างานฟรี รับประกัน 1 ปี",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageView />;
}
