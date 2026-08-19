import {
  createPublicServiceSupabase,
  createServiceSupabase,
} from "@/lib/supabase/server";
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

function parseCmsItems<T>(value: unknown): T[] | null {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { items?: unknown }).items)
  ) {
    return (value as { items: T[] }).items;
  }
  return null;
}

async function readSiteSettingViaRpc(key: string): Promise<unknown | null> {
  try {
    const supabase = createPublicServiceSupabase();
    const { data, error } = await supabase.rpc("changtee_read_site_setting", {
      p_key: key,
    });
    if (error) {
      console.error("CMS RPC read failed", { key, error: error.message });
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.error("CMS RPC read failed", err);
    return null;
  }
}

async function writeSiteSettingViaRpc(
  key: string,
  value: unknown,
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  try {
    const supabase = createPublicServiceSupabase();
    const { data, error } = await supabase.rpc("changtee_upsert_site_setting", {
      p_key: key,
      p_value: value,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    const updatedAt =
      typeof data === "string" ? data : new Date().toISOString();
    return { ok: true, updatedAt };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "CMS RPC write failed",
    };
  }
}

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
    const key = cmsSettingsKey(collection);
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    const value =
      !error && data
        ? data.value
        : await readSiteSettingViaRpc(key);
    return parseCmsItems<T>(value);
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
    return {
      ok: false,
      error: "ยังไม่ได้ตั้งคีย์เซิร์ฟเวอร์ — บันทึกขึ้นเว็บไม่ได้",
    };
  }
  try {
    const key = cmsSettingsKey(collection);
    const updatedAt = new Date().toISOString();
    const value = { items, updatedAt };
    const supabase = createServiceSupabase();
    const { error } = await supabase.from("site_settings").upsert(
      {
        key,
        value,
        updated_at: updatedAt,
      },
      { onConflict: "key" },
    );
    if (!error) return { ok: true, updatedAt };

    const rpc = await writeSiteSettingViaRpc(key, value);
    if (rpc.ok) return rpc;
    console.error("CMS write failed", { collection, table: error.message, rpc: rpc.error });
    return { ok: false, error: rpc.error || error.message };
  } catch (err) {
    try {
      const key = cmsSettingsKey(collection);
      const updatedAt = new Date().toISOString();
      const rpc = await writeSiteSettingViaRpc(key, { items, updatedAt });
      if (rpc.ok) return rpc;
    } catch {
      /* fall through */
    }
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
    if (!error && data) return (data.value as T) ?? null;
    const viaRpc = await readSiteSettingViaRpc(key);
    return (viaRpc as T) ?? null;
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
    return {
      ok: false,
      error: "ยังไม่ได้ตั้งคีย์เซิร์ฟเวอร์ — บันทึกขึ้นเว็บไม่ได้",
    };
  }
  try {
    const supabase = createServiceSupabase();
    const updatedAt = new Date().toISOString();
    const { error } = await supabase.from("site_settings").upsert(
      {
        key,
        value,
        updated_at: updatedAt,
      },
      { onConflict: "key" },
    );
    if (!error) return { ok: true, updatedAt };
    return writeSiteSettingViaRpc(key, value);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Settings write failed",
    };
  }
}
