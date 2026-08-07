import { NextResponse } from "next/server";
import { isPublicCmsCollection } from "@/lib/cms/cms-collections";
import { readCmsCollection } from "@/lib/cms/cms-server";

export const runtime = "nodejs";

type Props = { params: Promise<{ collection: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { collection } = await params;
  // Draft / history must never be public — allowlist only
  if (!isPublicCmsCollection(collection)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  }

  const items = await readCmsCollection(collection);
  if (!items) {
    return NextResponse.json({ items: null, source: "seed" });
  }
  return NextResponse.json({ items, source: "supabase" });
}
