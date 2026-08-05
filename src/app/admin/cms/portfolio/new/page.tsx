import type { Metadata } from "next";
import { NewPortfolioClient } from "./new-client";

export const metadata: Metadata = {
  title: "ลงผลงาน",
  robots: { index: false, follow: false },
};

export default function AdminPortfolioNewPage() {
  return <NewPortfolioClient />;
}
