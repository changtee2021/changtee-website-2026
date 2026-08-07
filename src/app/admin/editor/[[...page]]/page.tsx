import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { PageEditorApp } from "@/components/admin/editor/PageEditorApp";
import { getSiteUrl } from "@/lib/admin-host";
import {
  findPage,
  isPageEditorEnabled,
  resolveEditorPageId,
} from "@/lib/editor/page-registry";

type Props = { params: Promise<{ page?: string[] }> };

export default async function AdminPageEditorPage({ params }: Props) {
  if (!isPageEditorEnabled()) {
    redirect("/admin");
  }

  const { page: segments } = await params;
  const pageId = resolveEditorPageId(segments);
  const page = findPage(pageId);
  if (!page) notFound();

  // Group nodes are not editable destinations — send to first editable child or home
  if (!page.pageKey && page.children?.length) {
    const first =
      page.children.find((c) => c.status === "editable") || page.children[0];
    if (first) {
      redirect(`/admin/editor/${first.id.replace(/\./g, "/")}`);
    }
  }

  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";

  return (
    <PageEditorApp page={page} basePath={basePath} siteUrl={getSiteUrl()} />
  );
}
