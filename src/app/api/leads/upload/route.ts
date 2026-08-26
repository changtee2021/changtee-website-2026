import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/security/rate-limit";
import {
  MAX_SITE_IMAGE_BYTES,
  MAX_SITE_VIDEO_BYTES,
  siteMediaExtension,
  siteMediaKind,
  normalizeSiteMediaType,
} from "@/lib/leads/site-media";
import { allowLocalLeadFallback } from "@/lib/leads/store";
import {
  asciiSafeFileBase,
  createPrivateSignedPutUrl,
} from "@/lib/storage/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (
    await isRateLimited(request, {
      scope: "lead-upload",
      windowMs: 10 * 60 * 1000,
      max: 30,
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
    const contentType = normalizeSiteMediaType({
      type: typeof body.contentType === "string" ? body.contentType : "",
      name: fileName,
    });
    const kind = siteMediaKind(contentType);
    const extension = siteMediaExtension(contentType);
    const maxBytes = kind === "video" ? MAX_SITE_VIDEO_BYTES : MAX_SITE_IMAGE_BYTES;

    if (!kind || !extension) {
      return NextResponse.json(
        { error: "รองรับรูป JPG, PNG, WebP และคลิป MP4, MOV, WebM" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(size) || size <= 0 || size > maxBytes) {
      return NextResponse.json(
        {
          error:
            kind === "video"
              ? "คลิปต้องมีขนาดไม่เกิน 40 MB"
              : "รูปต้องมีขนาดไม่เกิน 12 MB",
        },
        { status: 400 },
      );
    }

    const signed = await createPrivateSignedPutUrl({
      folder: "leads",
      fileName: `${asciiSafeFileBase(fileName)}${extension}`,
    });
    if (!signed) {
      if (allowLocalLeadFallback() && kind === "image") {
        return NextResponse.json({ mode: "direct" as const });
      }
      return NextResponse.json(
        { error: "ระบบอัปโหลดยังไม่พร้อม กรุณาลองใหม่หรือส่งโดยไม่แนบไฟล์" },
        { status: 503 },
      );
    }

    return NextResponse.json({
      mode: "signed" as const,
      path: signed.path,
      signedUrl: signed.signedUrl,
      token: signed.token,
      contentType: kind === "image" && contentType === "image/heic" ? "image/jpeg" : contentType,
    });
  } catch (err) {
    console.error("leads/upload", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "ไม่สามารถเตรียมอัปโหลดได้" }, { status: 500 });
  }
}
