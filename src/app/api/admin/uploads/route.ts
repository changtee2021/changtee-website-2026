import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { assertAdminApiAccess } from "@/lib/admin-api-guard";

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

    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadsDir, { recursive: true });
    const baseName =
      file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^\w\-ก-๙]+/g, "_")
        .replace(/^_+|_+$/g, "") || "upload";
    const safeName = `${Date.now()}-${baseName}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, safeName), buffer);

    const url = `/uploads/${folder}/${safeName}`;
    return NextResponse.json({ url, name: file.name });
  } catch (error) {
    console.error("admin upload failed", error);
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ" }, { status: 500 });
  }
}
