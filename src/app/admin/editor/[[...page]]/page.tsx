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
  const headerStore = await headers();
  const onAdminHost = headerStore.get("x-changtee-admin-host") === "1";
  const basePath = onAdminHost ? "" : "/admin";
  const root = basePath || "/";

  if (!isPageEditorEnabled()) {
    redirect(root);
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
      const dest = `${basePath}/editor/${first.id.replace(/\./g, "/")}`;
      redirect(dest.startsWith("//") ? dest.slice(1) : dest || "/editor/home");
    }
  }

  return (
    <PageEditorApp page={page} basePath={basePath} siteUrl={getSiteUrl()} />
  );
}
