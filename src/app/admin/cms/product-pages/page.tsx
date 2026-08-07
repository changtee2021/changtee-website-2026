import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminProductPagesCmsPage() {
  const onAdminHost = (await headers()).get("x-changtee-admin-host") === "1";
  redirect(
    onAdminHost ? "/editor/products/detail" : "/admin/editor/products/detail",
  );
}
