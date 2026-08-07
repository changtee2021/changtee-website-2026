import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { isAdminCmsCollection } from "@/lib/cms/cms-collections";
import { readCmsCollection, writeCmsCollection } from "@/lib/cms/cms-server";

export const runtime = "nodejs";

type Props = { params: Promise<{ collection: string }> };

export async function GET(request: Request, { params }: Props) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const { collection } = await params;
  if (!isAdminCmsCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const items = await readCmsCollection(collection);
  return NextResponse.json({
    items: items ?? [],
    source: items ? "supabase" : "empty",
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

  const result = await writeCmsCollection(collection, items);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }
  return NextResponse.json({ ok: true, updatedAt: result.updatedAt });
}
