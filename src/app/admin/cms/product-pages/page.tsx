import type { Metadata } from "next";
import { ProductPagesCmsBoard } from "@/components/admin/ProductPagesCmsBoard";

export const metadata: Metadata = {
  title: "หน้าสินค้า — sections",
  robots: { index: false, follow: false },
};

export default function AdminProductPagesCmsPage() {
  return <ProductPagesCmsBoard />;
}
