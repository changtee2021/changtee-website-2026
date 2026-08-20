import type { Metadata } from "next";
import { SubscribersBoard } from "@/components/admin/SubscribersBoard";

export const metadata: Metadata = {
  title: "เมลลูกค้า",
  robots: { index: false, follow: false },
};

export default function AdminSubscribersPage() {
  return <SubscribersBoard />;
}
