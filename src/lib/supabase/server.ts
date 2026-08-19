import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SCHEMA } from "@/lib/erp-config";

/** Server client with anon key (RLS applies). */
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, anonKey, {
    db: { schema: SUPABASE_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function serviceRoleEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return { url, serviceKey };
}

/** Service-role client for trusted API routes only. */
export function createServiceSupabase() {
  const { url, serviceKey } = serviceRoleEnv();
  return createClient(url, serviceKey, {
    db: { schema: SUPABASE_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Public-schema service client for RPCs that live in `public`. */
export function createPublicServiceSupabase() {
  const { url, serviceKey } = serviceRoleEnv();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
