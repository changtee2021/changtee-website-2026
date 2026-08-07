import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import {
  canUseSupabaseStorage,
  uploadPublicFile,
} from "@/lib/storage/upload";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED: Record<string, ".jpg" | ".png" | ".webp" | ".gif"> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: Request) {
  const unauthorized = await assertAdminApiAccess(request);
  if (unauthorized) return unauthorized;

  try {
    if (!canUseSupabaseStorage()) {
      return NextResponse.json(
        {
          error:
            "ยังไม่ได้ตั้ง Supabase Storage (SUPABASE_SERVICE_ROLE_KEY) — อัปโหลดบน production ใช้ไม่ได้",
        },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    const folderRaw = String(form.get("folder") || "misc");
    const folder = folderRaw.replace(/[^a-z0-9_-]/gi, "") || "misc";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "ไฟล์ใหญ่เกิน 8MB" },
        { status: 400 },
      );
    }
    const extension = ALLOWED[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "รองรับเฉพาะ JPG, PNG, WEBP, GIF" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const baseName =
      file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^\w\-ก-๙]+/g, "_")
        .replace(/^_+|_+$/g, "") || "upload";
    const uploaded = await uploadPublicFile({
      folder,
      fileName: `${baseName}${extension}`,
      bytes: buffer,
      contentType: file.type,
    });

    return NextResponse.json({ url: uploaded.url, name: file.name });
  } catch (error) {
    console.error("admin upload failed", error);
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 });
  }
}
