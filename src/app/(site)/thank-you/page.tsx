import type { Metadata } from "next";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { ThankYouCard } from "@/components/thank-you/ThankYouCard";
import { pageMetadata } from "@/lib/seo/meta";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "ขอบคุณที่ติดต่อเรา",
    description:
      "รับเรื่องขอใบเสนอราคาเรียบร้อยแล้ว — ติดตามเรื่องได้ทางโทรหรือ LINE และดูผลงานติดตั้งจริงของช่างตี๋ ผ้าม่าน",
    path: "/thank-you",
  }),
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <div>
      <ThankYouCard />
      <PortfolioPreview
        title="ระหว่างรอ ดูผลงานติดตั้งจริงได้เลย"
        subtitle="งานจริงจากบ้าน คอนโด ร้านค้า และองค์กร — กดเข้าดูรายละเอียดได้"
      />
    </div>
  );
}
