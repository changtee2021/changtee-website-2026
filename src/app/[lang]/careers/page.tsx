import type { Metadata } from "next";
import { CareersIndex } from "@/components/careers/CareersIndex";
import { pageMetadata } from "@/lib/seo/meta";
import { langFromParams } from "@/lib/i18n/lang-param";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = await langFromParams(params);
  return pageMetadata({
    title: "ร่วมงานกับเรา",
    description:
      "ตำแหน่งงานเปิดรับที่ช่างตี๋ ผ้าม่าน — ฝ่ายผลิต ฝ่ายขาย ฝ่ายคลังสินค้า พร้อมฟอร์มส่งใบสมัครงานแม้ยังไม่มีตำแหน่งที่ตรง",
    path: "/careers",
    locale,
  });
}

export default function CareersPage() {
  return <CareersIndex />;
}
