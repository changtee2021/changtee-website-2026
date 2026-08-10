import type { Metadata } from "next";
import { CatalogsCmsBoard } from "@/components/admin/CatalogsCmsBoard";

export const metadata: Metadata = {
  title: "แคตตาล็อก",
  robots: { index: false, follow: false },
};

export default function AdminCatalogsCmsPage() {
  return <CatalogsCmsBoard />;
}
