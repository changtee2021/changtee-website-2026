import type { Metadata } from "next";
import { HttpStatusPage } from "@/components/errors/HttpStatusPage";

export const metadata: Metadata = {
  title: "500 · เซิร์ฟเวอร์ขัดข้อง",
  robots: { index: false, follow: false },
};

export default function ServerErrorPage() {
  return <HttpStatusPage code={500} showQuote={false} />;
}
