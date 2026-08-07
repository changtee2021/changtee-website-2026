import type { Metadata } from "next";
import { HttpStatusPage } from "@/components/errors/HttpStatusPage";

export const metadata: Metadata = {
  title: "400 · คำขอไม่ถูกต้อง",
  robots: { index: false, follow: false },
};

export default function BadRequestPage() {
  return <HttpStatusPage code={400} />;
}
