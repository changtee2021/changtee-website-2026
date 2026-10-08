import type { Metadata } from "next";
import { AboutPageView } from "@/components/about/AboutPageView";
import { pageMetadata } from "@/lib/seo/meta";

export const metadata: Metadata = pageMetadata({
  title: "เกี่ยวกับเรา",
  description:
    "Crafted by Experience. Designed for Life. — ช่าง + งานฝีมือ + ประสบการณ์ Premium Window Covering Brand ออกแบบ ผลิต ติดตั้งครบวงจร มีโรงงานเอง วัดหน้างานฟรี รับประกัน 1 ปี",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageView />;
}
