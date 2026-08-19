import type { Metadata } from "next";
import { VisitsBoard } from "@/components/admin/VisitsBoard";

export const metadata: Metadata = {
  title: "นัดนำเสนอสินค้า",
  robots: { index: false, follow: false },
};

export default function AdminPresentationsPage() {
  return <VisitsBoard kind="product-presentation" />;
}
