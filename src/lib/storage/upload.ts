import { randomUUID } from "crypto";
import { createServiceSupabase } from "@/lib/supabase/server";

export const UPLOAD_BUCKET = "changtee-uploads";

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
  const safeBase =
    opts.fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-ก-๙]+/g, "_")
      .replace(/^_+|_+$/g, "") || "upload";
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
