import { NextResponse } from "next/server";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";
import { bytesMatchDeclaredType, isJsonBytes, isPdfBytes } from "@/lib/security/file-magic";
import {
  canUseSupabaseStorage,
  uploadPublicFile,
} from "@/lib/storage/upload";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PDF_BYTES = 40 * 1024 * 1024;
const MAX_JSON_BYTES = 2 * 1024 * 1024;

const IMAGE_ALLOWED: Record<string, ".jpg" | ".png" | ".webp" | ".gif"> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function resolvedImageType(file: File): string {
  const raw = file.type.toLowerCase();
  if (raw === "image/jpg" || raw === "image/pjpeg") return "image/jpeg";
  if (IMAGE_ALLOWED[raw]) return raw;
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  return raw;
}

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
    const folder =
      folderRaw
        .split("/")
        .map((part) => part.replace(/[^a-z0-9_-]/gi, ""))
        .filter(Boolean)
        .join("/") || "misc";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    const lowerName = file.name.toLowerCase();
    const isPdf =
      file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isJson =
      file.type === "application/json" ||
      file.type === "text/json" ||
      lowerName.endsWith(".json");

    if (isPdf) {
      if (file.size > MAX_PDF_BYTES) {
        return NextResponse.json(
          { error: "PDF ใหญ่เกิน 40MB" },
          { status: 400 },
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!isPdfBytes(buffer)) {
        return NextResponse.json({ error: "ไฟล์ไม่ใช่ PDF จริง" }, { status: 400 });
      }
      const baseName =
        file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[^\w\-ก-๙]+/g, "_")
          .replace(/^_+|_+$/g, "") || "catalog";
      const uploaded = await uploadPublicFile({
        folder,
        fileName: `${baseName}.pdf`,
        bytes: buffer,
        contentType: "application/pdf",
      });
      return NextResponse.json({ url: uploaded.url, name: file.name, path: uploaded.path });
    }

    if (isJson) {
      if (file.size > MAX_JSON_BYTES) {
        return NextResponse.json(
          { error: "JSON ใหญ่เกิน 2MB" },
          { status: 400 },
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!isJsonBytes(buffer)) {
        return NextResponse.json({ error: "ไฟล์ไม่ใช่ JSON จริง" }, { status: 400 });
      }
      const baseName =
        file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[^\w\-ก-๙]+/g, "_")
          .replace(/^_+|_+$/g, "") || "manifest";
      const uploaded = await uploadPublicFile({
        folder,
        fileName: `${baseName}.json`,
        bytes: buffer,
        contentType: "application/json",
      });
      return NextResponse.json({ url: uploaded.url, name: file.name, path: uploaded.path });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "ไฟล์ใหญ่เกิน 8MB — บันทึกเป็น JPG แล้วลองใหม่" },
        { status: 400 },
      );
    }
    const imageType = resolvedImageType(file);
    const extension = IMAGE_ALLOWED[imageType] ?? IMAGE_ALLOWED[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "รองรับเฉพาะ JPG, PNG, WEBP, GIF, PDF หรือ JSON" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!bytesMatchDeclaredType(buffer, imageType)) {
      return NextResponse.json({ error: "เนื้อไฟล์ไม่ตรงกับชนิดที่ประกาศ" }, { status: 400 });
    }
    const baseName =
      file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^\w\-ก-๙]+/g, "_")
        .replace(/^_+|_+$/g, "") || "upload";
    const uploaded = await uploadPublicFile({
      folder,
      fileName: `${baseName}${extension}`,
      bytes: buffer,
      contentType: imageType,
    });

    return NextResponse.json({ url: uploaded.url, name: file.name, path: uploaded.path });
  } catch (error) {
    console.error("admin upload failed", error);
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 });
  }
}
