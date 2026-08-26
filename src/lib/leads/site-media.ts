export const MAX_SITE_FILES = 10;
export const MAX_SITE_VIDEOS = 3;
export const MAX_SITE_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_SITE_VIDEO_BYTES = 40 * 1024 * 1024;

export const SITE_IMAGE_TYPES: Record<string, ".jpg" | ".png" | ".webp"> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const SITE_VIDEO_TYPES: Record<string, ".mp4" | ".webm" | ".mov" | ".3gp"> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/3gpp": ".3gp",
};

export type SiteMediaKind = "image" | "video";

export function normalizeSiteMediaType(file: Pick<File, "type" | "name">): string {
  const raw = file.type.toLowerCase();
  if (SITE_IMAGE_TYPES[raw] || SITE_VIDEO_TYPES[raw]) {
    return raw === "image/jpg" || raw === "image/pjpeg" ? "image/jpeg" : raw;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".mp4") || name.endsWith(".m4v")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".mov")) return "video/quicktime";
  if (name.endsWith(".3gp") || name.endsWith(".3gpp")) return "video/3gpp";
  if (name.endsWith(".heic") || name.endsWith(".heif") || raw === "image/heic" || raw === "image/heif") {
    return "image/heic";
  }
  return raw;
}

export function siteMediaKind(contentType: string): SiteMediaKind | null {
  if (contentType === "image/heic" || SITE_IMAGE_TYPES[contentType]) return "image";
  if (SITE_VIDEO_TYPES[contentType]) return "video";
  return null;
}

export function siteMediaExtension(contentType: string): string | null {
  if (contentType === "image/heic") return ".jpg";
  return SITE_IMAGE_TYPES[contentType] ?? SITE_VIDEO_TYPES[contentType] ?? null;
}

export function isVideoMediaName(value: string) {
  return /\.(mp4|m4v|webm|mov|3gp)(\?|#|$)/i.test(value);
}

export function siteMediaAccept() {
  return "image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/webm,video/quicktime,video/3gpp,.jpg,.jpeg,.png,.webp,.heic,.mp4,.mov,.webm,.3gp";
}

export async function readJsonResponse<T extends { error?: string }>(
  res: Response,
): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (res.status === 413 || /request entity too large/i.test(text)) {
      throw new Error(
        "ไฟล์ใหญ่เกินที่ระบบรับได้ กรุณาเลือกรูปที่เล็กกว่า หรือคลิปสั้นลง",
      );
    }
    throw new Error(res.ok ? "ตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง" : "ส่งแบบฟอร์มไม่สำเร็จ");
  }
}

const SITE_IMAGE_TARGET_BYTES = 280 * 1024;
const SITE_IMAGE_SKIP_BYTES = 350 * 1024;
const SITE_IMAGE_MAX_EDGE = 1280;

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
}

/** Shrink phone photos so the form can send them. Preview-quality is enough. */
export async function compressSiteImage(file: File): Promise<File> {
  const type = normalizeSiteMediaType(file);
  if (type !== "image/heic" && type === "image/jpeg" && file.size <= SITE_IMAGE_SKIP_BYTES) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    if (type === "image/heic") {
      throw new Error("รูป HEIC เปิดไม่ได้ในเบราว์เซอร์นี้ — บันทึกเป็น JPG แล้วลองใหม่");
    }
    return file;
  }

  const scale = Math.min(1, SITE_IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let best: Blob | null = null;
  for (const quality of [0.62, 0.5, 0.38]) {
    const blob = await canvasToJpeg(canvas, quality);
    if (!blob) continue;
    best = blob;
    if (blob.size <= SITE_IMAGE_TARGET_BYTES) break;
  }
  if (!best) return file;
  const base = file.name.replace(/\.[^.]+$/, "") || "site";
  return new File([best], `${base}.jpg`, { type: "image/jpeg" });
}

export async function prepareSiteFile(file: File): Promise<File> {
  const type = normalizeSiteMediaType(file);
  const kind = siteMediaKind(type);
  if (!kind) {
    throw new Error("รองรับรูป JPG, PNG, WebP และคลิป MP4, MOV, WebM");
  }
  if (kind === "video") {
    if (file.size > MAX_SITE_VIDEO_BYTES) {
      throw new Error("คลิปใหญ่เกิน 40 MB — ถ่ายสั้นลงหรือลดความละเอียดแล้วลองใหม่");
    }
    return file;
  }
  if (file.size > MAX_SITE_IMAGE_BYTES) {
    throw new Error("รูปใหญ่เกินไป — เลือกรูปใหม่แล้วระบบจะย่อให้อัตโนมัติ");
  }
  return compressSiteImage(file);
}

export type SiteUploadTicket =
  | {
      mode: "signed";
      path: string;
      signedUrl: string;
      token: string;
      contentType: string;
    }
  | { mode: "direct" };

export async function requestSiteUploadTicket(opts: {
  file: File;
  turnstileToken: string | null;
}): Promise<SiteUploadTicket> {
  const res = await fetch("/api/leads/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: opts.file.name,
      contentType: opts.file.type,
      size: opts.file.size,
      turnstileToken: opts.turnstileToken || "",
    }),
  });
  const json = await readJsonResponse<SiteUploadTicket & { error?: string }>(res);
  if (!res.ok) throw new Error(json.error || "ไม่สามารถเตรียมอัปโหลดได้");
  if (json.mode === "direct") return { mode: "direct" };
  if (json.mode === "signed" && json.signedUrl && json.path) return json;
  throw new Error("ไม่สามารถเตรียมอัปโหลดได้");
}

export async function putToSignedUrl(ticket: Extract<SiteUploadTicket, { mode: "signed" }>, file: File) {
  const res = await fetch(ticket.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": ticket.contentType || file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error("อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่");
  }
}
