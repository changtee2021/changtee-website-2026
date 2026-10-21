import type { Metadata } from "next";
import { HttpStatusPage } from "@/components/errors/HttpStatusPage";

export const metadata: Metadata = {
  title: "505 · ไม่รองรับโปรโตคอล",
  robots: { index: false, follow: false },
};

export default function HttpVersionNotSupportedPage() {
  return <HttpStatusPage code={505} showQuote={false} />;
}
