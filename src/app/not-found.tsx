import type { Metadata } from "next";
import { HttpStatusPage } from "@/components/errors/HttpStatusPage";

export const metadata: Metadata = {
  title: "404 · ไม่พบหน้า",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <HttpStatusPage code={404} />;
}
