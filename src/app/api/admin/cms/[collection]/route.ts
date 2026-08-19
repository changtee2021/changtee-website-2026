import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { isAdminCmsCollection } from "@/lib/cms/cms-collections";
import { readCmsCollection, writeCmsCollection } from "@/lib/cms/cms-server";
import {
  canUseLocalCmsStore,
  readLocalCmsCollection,
  writeLocalCmsCollection,
} from "@/lib/cms/cms-local-store";
import { revalidateCmsCollection } from "@/lib/cms/revalidate-cms";

export const runtime = "nodejs";

const MERGE_BY_ID = new Set([
  "portfolio",
  "blog",
  "hero-slides",
  "catalogs",
  "careers",
  "reviews",
]);

function mergeCmsItems<T extends { id?: string }>(
  existing: T[] | null,
  incoming: T[],
  deletedIds: string[],
  collection: string,
): T[] {
  if (!MERGE_BY_ID.has(collection) || !existing?.length) return incoming;
  const byId = new Map<string, T>();
  for (const item of existing) {
    if (typeof item?.id === "string" && item.id) byId.set(item.id, item);
  }
  for (const id of deletedIds) byId.delete(id);
  for (const item of incoming) {
    if (typeof item?.id === "string" && item.id) byId.set(item.id, item);
  }
  return [...byId.values()];
}

type Props = { params: Promise<{ collection: string }> };

export async function GET(request: Request, { params }: Props) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const { collection } = await params;
  if (!isAdminCmsCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const remote = await readCmsCollection(collection);
  const items = remote ?? (await readLocalCmsCollection(collection));
  return NextResponse.json({
    items: items ?? [],
    source: remote ? "supabase" : items ? "local" : "empty",
  });
}

export async function PUT(request: Request, { params }: Props) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const { collection } = await params;
  if (!isAdminCmsCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const items = body?.items;
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "items must be an array" }, { status: 400 });
  }

  const deletedIds = Array.isArray(body?.deletedIds)
    ? body.deletedIds.filter((id: unknown) => typeof id === "string")
    : [];
  const existing =
    (await readCmsCollection<Record<string, unknown>>(collection)) ??
    (await readLocalCmsCollection<Record<string, unknown>>(collection));
  const merged = mergeCmsItems(existing, items, deletedIds, collection);

  let result = await writeCmsCollection(collection, merged);
  if (!result.ok && canUseLocalCmsStore()) {
    result = await writeLocalCmsCollection(collection, merged);
  }
  if (!result.ok) {
    const error =
      result.error === "Local CMS store is not available"
        ? "บันทึกขึ้นเซิร์ฟเวอร์ไม่สำเร็จ — ลองอีกครั้ง"
        : result.error;
    return NextResponse.json({ error }, { status: 503 });
  }
  revalidateCmsCollection(collection);
  return NextResponse.json({ ok: true, updatedAt: result.updatedAt });
}
