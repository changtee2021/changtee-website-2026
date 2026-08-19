/** Client-side admin upload: shrink images before Vercel 4.5MB body limit. */

const SAFE_UPLOAD_BYTES = 3.2 * 1024 * 1024;
const MAX_EDGE = 2560;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type UploadPrepPhase =
  | "inspect"
  | "convert"
  | "compress"
  | "shrink"
  | "upload";

export type UploadPrepStatus = {
  phase: UploadPrepPhase;
  label: string;
  percent: number;
  preparing: boolean;
};

export type UploadStatusHandler = (status: UploadPrepStatus) => void;

export function normalizeImageType(file: File): string {
  const raw = file.type.toLowerCase();
  if (raw === "image/jpg" || raw === "image/pjpeg") return "image/jpeg";
  if (IMAGE_TYPES.has(raw)) return raw;
  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  return raw;
}

export function imageNeedsPrep(file: File): boolean {
  const type = normalizeImageType(file);
  if (!IMAGE_TYPES.has(type)) return false;
  if (type === "image/gif") return false;
  if (file.size <= SAFE_UPLOAD_BYTES && type === "image/jpeg") return false;
  return true;
}

export async function parseAdminUploadResponse(
  res: Response,
): Promise<{ url?: string; error?: string }> {
  const text = await res.text();
  try {
    return JSON.parse(text) as { url?: string; error?: string };
  } catch {
    const tooLarge =
      res.status === 413 ||
      /request entity too large|payload too large|entity too large/i.test(
        text,
      );
    return {
      error: tooLarge
        ? "ไฟล์ใหญ่เกินที่เซิร์ฟเวอร์รับได้ — ลองอีกครั้ง หรือลดขนาดรูปเหลือไม่เกิน 4MB"
        : "อัปโหลดไม่สำเร็จ",
    };
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("เปิดรูปไม่ได้"));
        el.src = url;
      });
      return await createImageBitmap(img);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("ย่อรูปไม่สำเร็จ"))),
      "image/jpeg",
      quality,
    );
  });
}

function notify(onStatus: UploadStatusHandler | undefined, status: UploadPrepStatus) {
  onStatus?.(status);
}

export async function prepareImageForUpload(
  file: File,
  onStatus?: UploadStatusHandler,
): Promise<File> {
  const type = normalizeImageType(file);
  if (!IMAGE_TYPES.has(type)) {
    throw new Error("รองรับเฉพาะ JPG, PNG, WEBP, GIF");
  }
  if (type === "image/gif") {
    if (file.size > SAFE_UPLOAD_BYTES) {
      throw new Error("GIF ใหญ่เกิน 3MB — แปลงเป็น JPG ก่อนแล้วลองใหม่");
    }
    return file;
  }
  if (file.size <= SAFE_UPLOAD_BYTES && type === "image/jpeg") {
    return file;
  }

  const needsConvert = type !== "image/jpeg";
  notify(onStatus, {
    phase: "inspect",
    label: "กำลังตรวจไฟล์...",
    percent: 8,
    preparing: true,
  });

  let bitmap: ImageBitmap;
  try {
    notify(onStatus, {
      phase: needsConvert ? "convert" : "compress",
      label: needsConvert
        ? "กำลังแปลงไฟล์ให้สามารถอัปโหลดได้..."
        : "กำลังบีบอัดภาพ...",
      percent: 18,
      preparing: true,
    });
    bitmap = await loadBitmap(file);
  } catch {
    throw new Error("เปิดรูปไม่ได้ — ลองบันทึกเป็น JPG แล้วอัปใหม่");
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    let maxEdge = Math.min(longest, MAX_EDGE);
    let quality = 0.84;
    let blob: Blob | null = null;
    const needsResize = longest > MAX_EDGE;

    for (let i = 0; i < 8; i += 1) {
      const shrinking = i > 0;
      notify(onStatus, {
        phase: shrinking ? "shrink" : needsConvert ? "convert" : "compress",
        label: shrinking
          ? "กำลังลดขนาดไฟล์..."
          : needsConvert
            ? "กำลังแปลงไฟล์ให้สามารถอัปโหลดได้..."
            : needsResize
              ? "กำลังบีบอัดภาพ..."
              : "กำลังลดขนาดไฟล์...",
        percent: Math.min(78, 22 + i * 8),
        preparing: true,
      });

      const scale = Math.min(1, maxEdge / longest);
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("ย่อรูปไม่สำเร็จ");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);
      blob = await canvasToJpeg(canvas, quality);
      if (blob.size <= SAFE_UPLOAD_BYTES) break;
      if (quality > 0.58) quality -= 0.1;
      else maxEdge = Math.round(maxEdge * 0.75);
    }

    if (!blob) throw new Error("ย่อรูปไม่สำเร็จ");
    const name = `${file.name.replace(/\.[^.]+$/, "") || "upload"}.jpg`;
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

export async function uploadAdminFile(
  file: File,
  folder: string,
  onStatus?: UploadStatusHandler,
): Promise<string> {
  const type = normalizeImageType(file);
  const preparing = IMAGE_TYPES.has(type) && imageNeedsPrep(file);
  if (preparing) {
    notify(onStatus, {
      phase: "inspect",
      label: "กำลังตรวจไฟล์...",
      percent: 6,
      preparing: true,
    });
  }

  const toSend = IMAGE_TYPES.has(type)
    ? await prepareImageForUpload(file, onStatus)
    : file;

  notify(onStatus, {
    phase: "upload",
    label: preparing ? "เตรียมไฟล์แล้ว กำลังอัปโหลด..." : "กำลังอัปโหลด...",
    percent: preparing ? 84 : 40,
    preparing,
  });

  const body = new FormData();
  body.set("file", toSend);
  body.set("folder", folder);
  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    body,
    credentials: "include",
  });
  const data = await parseAdminUploadResponse(res);
  if (!res.ok || !data.url) {
    throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
  }

  notify(onStatus, {
    phase: "upload",
    label: "อัปโหลดสำเร็จ",
    percent: 100,
    preparing,
  });
  return data.url;
}
