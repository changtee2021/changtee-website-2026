import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import {
  loadSeoDefaults,
  normalizeSeoDefaults,
  saveSeoDefaults,
  type SeoDefaults,
} from "@/lib/seo/seo-defaults";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const defaults = await loadSeoDefaults();
  return NextResponse.json({ defaults });
}

export async function PUT(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as Partial<SeoDefaults> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const defaults = normalizeSeoDefaults(body);
  const result = await saveSeoDefaults(defaults);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }
  return NextResponse.json({
    ok: true,
    updatedAt: result.updatedAt,
    defaults,
  });
}
