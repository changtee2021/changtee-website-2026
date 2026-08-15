import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { isStorageRef, storagePathFromRef } from "@/lib/security/lead-media";
import { createSignedUploadUrl } from "@/lib/storage/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as { refs?: unknown };
    const refs = Array.isArray(body.refs)
      ? body.refs.filter((v): v is string => typeof v === "string").slice(0, 20)
      : [];

    const urls: Record<string, string> = {};
    await Promise.all(
      refs.map(async (ref) => {
        if (!isStorageRef(ref)) {
          urls[ref] = ref;
          return;
        }
        const signed = await createSignedUploadUrl(storagePathFromRef(ref), 60 * 60);
        if (signed) urls[ref] = signed;
      }),
    );

    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถเปิดรูปได้" }, { status: 500 });
  }
}
