import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SCHEMA } from "@/lib/erp-config";

export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, anonKey, {
    db: { schema: SUPABASE_SCHEMA },
    auth: { persistSession: true, autoRefreshToken: true },
  });
}
