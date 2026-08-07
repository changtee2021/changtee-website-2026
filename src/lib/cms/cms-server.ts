import { createServiceSupabase } from "@/lib/supabase/server";
import {
  cmsSettingsKey,
  type CmsCollection,
} from "@/lib/cms/cms-collections";

export function canUseCmsServer(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function readCmsCollection<T>(
  collection: CmsCollection,
): Promise<T[] | null> {
  if (!canUseCmsServer()) return null;
  try {
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", cmsSettingsKey(collection))
      .maybeSingle();
    if (error || !data) return null;
    const value = data.value as { items?: T[] } | T[] | null;
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.items)) return value.items;
    return null;
  } catch {
    return null;
  }
}

export async function writeCmsCollection<T>(
  collection: CmsCollection,
  items: T[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!canUseCmsServer()) {
    return { ok: false, error: "Supabase service role is not configured" };
  }
  try {
    const supabase = createServiceSupabase();
    const { error } = await supabase.from("site_settings").upsert({
      key: cmsSettingsKey(collection),
      value: { items, updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "CMS write failed",
    };
  }
}
