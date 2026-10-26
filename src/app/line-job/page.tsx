import type { Metadata } from "next";
import { preconnect, preload } from "react-dom";
import LineJobClient from "./LineJobClient";
import { LIFF_SDK_URL } from "./liff-sdk";

export const metadata: Metadata = {
  title: "อัปเดตสถานะงาน",
  robots: { index: false, follow: false },
};

export default function LineJobPage() {
  preload(LIFF_SDK_URL, { as: "script" });
  preconnect("https://api.line.me");
  preconnect("https://access.line.me");
  return <LineJobClient liffId={process.env.NEXT_PUBLIC_LIFF_ID ?? ""} />;
}
