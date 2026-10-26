import type { Metadata } from "next";
import LineJobClient from "./LineJobClient";

export const metadata: Metadata = {
  title: "อัปเดตสถานะงาน",
  robots: { index: false, follow: false },
};

export default function LineJobPage() {
  return <LineJobClient liffId={process.env.NEXT_PUBLIC_LIFF_ID ?? ""} />;
}
