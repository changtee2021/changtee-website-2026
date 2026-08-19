import { NextResponse } from "next/server";
import { isPublicCmsCollection } from "@/lib/cms/cms-collections";
import { readCmsCollection } from "@/lib/cms/cms-server";
import { readLocalCmsCollection } from "@/lib/cms/cms-local-store";

export const runtime = "nodejs";

type Props = { params: Promise<{ collection: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { collection } = await params;
  // Draft / history must never be public — allowlist only
  if (!isPublicCmsCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const remote = await readCmsCollection(collection);
  const items = remote ?? (await readLocalCmsCollection(collection));
  const headers = { "Cache-Control": "no-store" };
  if (!items) {
    return NextResponse.json({ items: null, source: "seed" }, { headers });
  }
  return NextResponse.json(
    { items, source: remote ? "supabase" : "local" },
    { headers },
  );
}
