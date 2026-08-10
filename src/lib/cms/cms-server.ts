import { createServiceSupabase } from "@/lib/supabase/server";
import {
  cmsSettingsKey,
  type AdminCmsCollection,
  type PublicCmsCollection,
} from "@/lib/cms/cms-collections";

export function canUseCmsServer(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

type CmsKey = AdminCmsCollection | PublicCmsCollection;

/**
 * Read collection items.
 * - `null` = never set / unavailable (use seed fallback)
 * - `[]` = intentionally empty
 */
export async function readCmsCollection<T>(
  collection: CmsKey,
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
    const value = data.value as { items?: T[]; updatedAt?: string } | T[] | null;
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.items)) return value.items;
    return null;
  } catch {
    return null;
  }
}

/** Read items + envelope metadata (updatedAt) for optimistic locking */
export async function readCmsCollectionMeta<T>(
  collection: CmsKey,
): Promise<{ items: T[]; updatedAt: string | null } | null> {
  if (!canUseCmsServer()) return null;
  try {
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", cmsSettingsKey(collection))
      .maybeSingle();
    if (error || !data) return null;
    const value = data.value as { items?: T[]; updatedAt?: string } | T[] | null;
    let items: T[] | null = null;
    let envelopeUpdatedAt: string | null = null;
    if (Array.isArray(value)) {
      items = value;
    } else if (value && Array.isArray(value.items)) {
      items = value.items;
      envelopeUpdatedAt =
        typeof value.updatedAt === "string" ? value.updatedAt : null;
    }
    if (!items) return null;
    return {
      items,
      updatedAt: envelopeUpdatedAt || data.updated_at || null,
    };
  } catch {
    return null;
  }
}

export async function writeCmsCollection<T>(
  collection: CmsKey,
  items: T[],
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  if (!canUseCmsServer()) {
    return { ok: false, error: "Supabase service role is not configured" };
  }
  try {
    const supabase = createServiceSupabase();
    const updatedAt = new Date().toISOString();
    const { error } = await supabase.from("site_settings").upsert({
      key: cmsSettingsKey(collection),
      value: { items, updatedAt },
      updated_at: updatedAt,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, updatedAt };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "CMS write failed",
    };
  }
}

/** Read a non-collection site_settings value by exact key. */
export async function readSiteSetting<T>(key: string): Promise<T | null> {
  if (!canUseCmsServer()) return null;
  try {
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return null;
    return (data.value as T) ?? null;
  } catch {
    return null;
  }
}

/** Upsert a non-collection site_settings value by exact key. */
export async function writeSiteSetting<T>(
  key: string,
  value: T,
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  if (!canUseCmsServer()) {
    return { ok: false, error: "Supabase service role is not configured" };
  }
  try {
    const supabase = createServiceSupabase();
    const updatedAt = new Date().toISOString();
    const { error } = await supabase.from("site_settings").upsert({
      key,
      value,
      updated_at: updatedAt,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, updatedAt };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Settings write failed",
    };
  }
}
