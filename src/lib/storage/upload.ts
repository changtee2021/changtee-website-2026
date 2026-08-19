import { randomUUID } from "crypto";
import { createServiceSupabase } from "@/lib/supabase/server";

export const UPLOAD_BUCKET = "changtee-uploads";

/** Supabase Storage keys must be ASCII — Thai filenames were rejected as Invalid key. */
export function asciiSafeFileBase(fileName: string): string {
  const stem = fileName.replace(/\.[^.]+$/, "");
  const ascii = stem
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return ascii || "upload";
}

export function canUseSupabaseStorage(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function uploadPublicFile(opts: {
  folder: string;
  fileName: string;
  bytes: Buffer;
  contentType: string;
}): Promise<{ url: string; path: string }> {
  if (!canUseSupabaseStorage()) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  const folder = opts.folder
    .split("/")
    .map((part) => part.replace(/[^a-z0-9_-]/gi, ""))
    .filter(Boolean)
    .join("/") || "misc";
  const safeBase = asciiSafeFileBase(opts.fileName);
  const extMatch = opts.fileName.match(/\.[a-z0-9]+$/i);
  const ext = extMatch?.[0]?.toLowerCase() || "";
  const path = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}${ext}`;

  const supabase = createServiceSupabase();
  const { error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(path, opts.bytes, {
      contentType: opts.contentType,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Private object — no public URL. Use createSignedUploadUrl() to view. */
export async function uploadPrivateFile(opts: {
  folder: string;
  fileName: string;
  bytes: Buffer;
  contentType: string;
}): Promise<{ path: string }> {
  if (!canUseSupabaseStorage()) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  const folder = opts.folder
    .split("/")
    .map((part) => part.replace(/[^a-z0-9_-]/gi, ""))
    .filter(Boolean)
    .join("/") || "misc";
  const safeBase = asciiSafeFileBase(opts.fileName);
  const extMatch = opts.fileName.match(/\.[a-z0-9]+$/i);
  const ext = extMatch?.[0]?.toLowerCase() || "";
  const path = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}${ext}`;

  const supabase = createServiceSupabase();
  const { error } = await supabase.storage.from(UPLOAD_BUCKET).upload(path, opts.bytes, {
    contentType: opts.contentType,
    upsert: false,
  });

  if (error) throw new Error(error.message);
  return { path };
}

export async function createSignedUploadUrl(path: string, expiresSec = 60 * 60) {
  if (!canUseSupabaseStorage()) return null;
  const supabase = createServiceSupabase();
  const { data, error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .createSignedUrl(path, expiresSec);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
