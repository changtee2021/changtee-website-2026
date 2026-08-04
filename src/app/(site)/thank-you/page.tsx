import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ขอบคุณที่ติดต่อเรา",
};

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold text-navy">รับเรื่องเรียบร้อยแล้ว</h1>
      <p className="mt-3 text-muted">
        เราได้ส่งอีเมลยืนยันให้คุณแล้ว (หากระบุอีเมลไว้)
        ทีมงานช่างตี๋จะติดต่อกลับโดยเร็วที่สุดผ่านอีเมลหรือช่องทางที่คุณให้ไว้
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
          กลับหน้าแรก
        </Link>
        <Link href="/quote" className="inline-flex rounded-full border border-navy px-5 py-3 text-sm font-semibold text-navy">
          ส่งคำขออีกครั้ง
        </Link>
      </div>
    </div>
  );
}
