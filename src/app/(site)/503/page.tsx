import type { Metadata } from "next";
import { HttpStatusPage } from "@/components/errors/HttpStatusPage";

export const metadata: Metadata = {
  title: "503 · ปิดปรับปรุงชั่วคราว",
  robots: { index: false, follow: false },
};

export default function ServiceUnavailablePage() {
  return <HttpStatusPage code={503} showQuote={false} />;
}
