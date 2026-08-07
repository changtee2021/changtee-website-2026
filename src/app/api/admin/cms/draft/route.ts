import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import type { PageSectionRecord } from "@/lib/cms/page-sections";
import {
  readPageSectionsDraft,
  writePageKeyDraft,
} from "@/lib/editor/draft-server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const draft = await readPageSectionsDraft();
  return NextResponse.json({
    items: draft?.items ?? [],
    updatedAt: draft?.updatedAt ?? null,
    source: draft ? "supabase" : "empty",
  });
}

export async function PUT(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const pageKey = typeof body?.pageKey === "string" ? body.pageKey : null;
  const sections = body?.sections as PageSectionRecord[] | undefined;
  const baseUpdatedAt =
    typeof body?.baseUpdatedAt === "string" ? body.baseUpdatedAt : null;

  if (!pageKey || !Array.isArray(sections)) {
    return NextResponse.json(
      { error: "pageKey and sections[] required" },
      { status: 400 },
    );
  }

  const result = await writePageKeyDraft(pageKey, sections, baseUpdatedAt);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 503 },
    );
  }
  return NextResponse.json({ ok: true, updatedAt: result.updatedAt });
}
