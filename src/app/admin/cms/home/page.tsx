import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminHomeSectionsPage() {
  const onAdminHost = (await headers()).get("x-changtee-admin-host") === "1";
  redirect(onAdminHost ? "/editor/home" : "/admin/editor/home");
}
