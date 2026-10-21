import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEARN_ENABLED } from "@/lib/learn";
import { LearnHub } from "@/components/learn/LearnHub";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "ห้องเรียนรู้",
    description:
      "คัมภีร์ช่างตี๋ — แผ่นความรู้เรื่องผ้า ฉากกั้น และคลิปสอนติดมอเตอร์ สำหรับเซลส่งให้ลูกค้า",
    path: "/learn",
    keywords: ["ความรู้ผ้าม่าน", "วัดหน้างาน", "ติดตั้งมอเตอร์", "ช่างตี๋"],
    locale,
    translationScope: "cms",
  });
}

export default function LearnPage() {
  if (!LEARN_ENABLED) notFound();
  return <LearnHub />;
}
