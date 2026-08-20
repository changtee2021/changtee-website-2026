import { randomUUID } from "crypto";
import { createServiceSupabase } from "@/lib/supabase/server";

export const UPLOAD_BUCKET = "changtee-uploads";
export const PRIVATE_UPLOAD_BUCKET = "changtee-private";

const PRIVATE_FOLDERS = new Set(["leads", "careers", "factory-visits"]);

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

function safeFolder(folder: string) {
  return (
    folder
      .split("/")
      .map((part) => part.replace(/[^a-z0-9_-]/gi, ""))
      .filter(Boolean)
      .join("/") || "misc"
  );
}

function objectPath(folder: string, fileName: string) {
  const safeBase = asciiSafeFileBase(fileName);
  const extMatch = fileName.match(/\.[a-z0-9]+$/i);
  const ext = extMatch?.[0]?.toLowerCase() || "";
  return `${safeFolder(folder)}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}${ext}`;
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

  const path = objectPath(opts.folder, opts.fileName);
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

  const path = objectPath(opts.folder, opts.fileName);
  const supabase = createServiceSupabase();
  const { error } = await supabase.storage
    .from(PRIVATE_UPLOAD_BUCKET)
    .upload(path, opts.bytes, {
      contentType: opts.contentType,
      upsert: false,
    });

  if (error) throw new Error(error.message);
  return { path };
}

function bucketForPath(path: string) {
  const folder = path.split("/")[0] || "";
  return PRIVATE_FOLDERS.has(folder) ? PRIVATE_UPLOAD_BUCKET : UPLOAD_BUCKET;
}

export async function downloadStoredFile(path: string) {
  if (!canUseSupabaseStorage()) return null;
  const supabase = createServiceSupabase();
  const preferred = bucketForPath(path);
  const order =
    preferred === PRIVATE_UPLOAD_BUCKET
      ? [PRIVATE_UPLOAD_BUCKET, UPLOAD_BUCKET]
      : [UPLOAD_BUCKET, PRIVATE_UPLOAD_BUCKET];

  for (const bucket of order) {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) continue;
    return {
      bytes: Buffer.from(await data.arrayBuffer()),
      contentType: data.type || "application/octet-stream",
    };
  }
  return null;
}

export async function createSignedUploadUrl(path: string, expiresSec = 60 * 60) {
  if (!canUseSupabaseStorage()) return null;
  const supabase = createServiceSupabase();
  const preferred = bucketForPath(path);
  const order =
    preferred === PRIVATE_UPLOAD_BUCKET
      ? [PRIVATE_UPLOAD_BUCKET, UPLOAD_BUCKET]
      : [UPLOAD_BUCKET, PRIVATE_UPLOAD_BUCKET];

  for (const bucket of order) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresSec);
    if (!error && data?.signedUrl) return data.signedUrl;
  }
  return null;
}
