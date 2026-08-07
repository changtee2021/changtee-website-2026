import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { publishPageKey } from "@/lib/editor/publish";
import { blastRadiusForPageKey } from "@/lib/editor/blast-radius";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const pageKey = typeof body?.pageKey === "string" ? body.pageKey : null;
  const baseDraftUpdatedAt =
    typeof body?.baseDraftUpdatedAt === "string"
      ? body.baseDraftUpdatedAt
      : null;

  if (!pageKey) {
    return NextResponse.json({ error: "pageKey required" }, { status: 400 });
  }

  const result = await publishPageKey(pageKey, baseDraftUpdatedAt);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 503 },
    );
  }

  const blast = blastRadiusForPageKey(pageKey);
  return NextResponse.json({
    ok: true,
    updatedAt: result.updatedAt,
    revalidated: result.revalidated,
    blast,
  });
}
