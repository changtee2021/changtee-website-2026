import type { Metadata } from "next";
import { ReviewsCmsBoard } from "@/components/admin/ReviewsCmsBoard";

export const metadata: Metadata = {
  title: "รีวิว",
  robots: { index: false, follow: false },
};

export default function AdminReviewsCmsPage() {
  return <ReviewsCmsBoard />;
}
