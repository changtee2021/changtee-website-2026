import type { Metadata } from "next";
import { UsersBoard } from "@/components/admin/UsersBoard";

export const metadata: Metadata = {
  title: "ผู้ใช้ / บทบาท",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return <UsersBoard />;
}
