import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/security/rate-limit";
import { allowLocalLeadFallback } from "@/lib/leads/store";
import {
  asciiSafeFileBase,
  createPrivateSignedPutUrl,
} from "@/lib/storage/upload";
import {
  VISIT_DOC_IMAGE_MAX_BYTES,
  VISIT_DOC_MAX_BYTES,
  normalizeVisitDocType,
  visitDocExtension,
  visitDocKind,
} from "@/lib/visits/visit-media";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (
    await isRateLimited(request, {
      scope: "visit-upload",
      windowMs: 10 * 60 * 1000,
      max: 20,
    })
  ) {
    return NextResponse.json(
      { error: "อัปโหลดบ่อยเกินไป กรุณาลองใหม่ในภายหลัง" },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as {
      fileName?: unknown;
      contentType?: unknown;
      size?: unknown;
    };
    const fileName = typeof body.fileName === "string" ? body.fileName : "";
    const size = Number(body.size);
    const contentType = normalizeVisitDocType({
      type: typeof body.contentType === "string" ? body.contentType : "",
      name: fileName,
    });
    const kind = visitDocKind(contentType);
    const extension = visitDocExtension(contentType);
    const maxBytes = kind === "pdf" ? VISIT_DOC_MAX_BYTES : VISIT_DOC_IMAGE_MAX_BYTES;

    if (!kind || !extension) {
      return NextResponse.json(
        { error: "รองรับไฟล์ PDF, JPG หรือ PNG" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(size) || size <= 0 || size > maxBytes) {
      return NextResponse.json(
        {
          error:
            kind === "pdf"
              ? "ไฟล์ PDF ต้องมีขนาดไม่เกิน 8 MB"
              : "รูปต้องมีขนาดไม่เกิน 12 MB",
        },
        { status: 400 },
      );
    }

    const signed = await createPrivateSignedPutUrl({
      folder: "factory-visits",
      fileName: `${asciiSafeFileBase(fileName)}${extension}`,
    });
    if (!signed) {
      if (allowLocalLeadFallback()) {
        return NextResponse.json({ mode: "direct" as const });
      }
      return NextResponse.json(
        { error: "ระบบอัปโหลดยังไม่พร้อม กรุณาลองใหม่" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      mode: "signed" as const,
      path: signed.path,
      signedUrl: signed.signedUrl,
      token: signed.token,
      contentType: contentType === "image/heic" ? "image/jpeg" : contentType,
    });
  } catch (err) {
    console.error("factory-visits/upload", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "ไม่สามารถเตรียมอัปโหลดได้" }, { status: 500 });
  }
}
