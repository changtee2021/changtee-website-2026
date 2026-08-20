import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  MARKETING_CONSENT_TEXT,
  MARKETING_CONSENT_VERSION,
  normalizeMarketingEmail,
  type MarketingSource,
} from "@/lib/marketing/consent";
import type {
  MarketingStatus,
  MarketingSubscriber,
} from "@/lib/marketing/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "marketing-subscribers.json");

function allowLocalFallback() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_LOCAL_LEAD_STORE === "true"
  );
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readLocal(): Promise<MarketingSubscriber[]> {
  await ensureFile();
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as MarketingSubscriber[];
  } catch {
    return [];
  }
}

async function writeLocal(rows: MarketingSubscriber[]) {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
}

function mapRow(row: Record<string, unknown>): MarketingSubscriber {
  return {
    id: String(row.id),
    email: String(row.email || ""),
    emailNormalized: String(row.email_normalized || ""),
    fullName: row.full_name ? String(row.full_name) : null,
    source: row.source as MarketingSource,
    status: row.status as MarketingStatus,
    consentVersion: String(row.consent_version || ""),
    consentText: String(row.consent_text || ""),
    consentedAt: row.consented_at ? String(row.consented_at) : null,
    unsubscribedAt: row.unsubscribed_at ? String(row.unsubscribed_at) : null,
    unsubscribeToken: String(row.unsubscribe_token || ""),
    leadId: row.lead_id ? String(row.lead_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function upsertMarketingSubscriber(input: {
  email: string;
  fullName?: string | null;
  source: MarketingSource;
  leadId?: string | null;
}): Promise<MarketingSubscriber | null> {
  const email = input.email.trim();
  const emailNormalized = normalizeMarketingEmail(email);
  if (!emailNormalized || !emailNormalized.includes("@")) return null;

  const now = new Date().toISOString();
  const token = randomUUID();

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("marketing_subscribers")
      .upsert(
        {
          email,
          email_normalized: emailNormalized,
          full_name: input.fullName?.trim() || null,
          source: input.source,
          status: "subscribed",
          consent_version: MARKETING_CONSENT_VERSION,
          consent_text: MARKETING_CONSENT_TEXT,
          consented_at: now,
          unsubscribed_at: null,
          unsubscribe_token: token,
          lead_id: input.leadId || null,
          updated_at: now,
        },
        { onConflict: "email_normalized" },
      )
      .select("*")
      .single();

    if (!error && data) return mapRow(data as Record<string, unknown>);
    if (error) {
      console.error("marketing subscribe supabase", error.message);
      if (input.leadId) {
        const retry = await supabase
          .from("marketing_subscribers")
          .upsert(
            {
              email,
              email_normalized: emailNormalized,
              full_name: input.fullName?.trim() || null,
              source: input.source,
              status: "subscribed",
              consent_version: MARKETING_CONSENT_VERSION,
              consent_text: MARKETING_CONSENT_TEXT,
              consented_at: now,
              unsubscribed_at: null,
              unsubscribe_token: token,
              lead_id: null,
              updated_at: now,
            },
            { onConflict: "email_normalized" },
          )
          .select("*")
          .single();
        if (!retry.error && retry.data) {
          return mapRow(retry.data as Record<string, unknown>);
        }
      }
    }
  } catch (err) {
    console.error("marketing subscribe failed", err);
  }

  if (!allowLocalFallback()) return null;

  const all = await readLocal();
  const existing = all.find((row) => row.emailNormalized === emailNormalized);
  const row: MarketingSubscriber = {
    id: existing?.id ?? randomUUID(),
    email,
    emailNormalized,
    fullName: input.fullName?.trim() || existing?.fullName || null,
    source: input.source,
    status: "subscribed",
    consentVersion: MARKETING_CONSENT_VERSION,
    consentText: MARKETING_CONSENT_TEXT,
    consentedAt: now,
    unsubscribedAt: null,
    unsubscribeToken: token,
    leadId: input.leadId || existing?.leadId || null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const next = [row, ...all.filter((item) => item.id !== row.id)];
  await writeLocal(next);
  return row;
}

export async function subscribeIfOptedIn(input: {
  optedIn: boolean;
  email?: string | null;
  fullName?: string | null;
  source: MarketingSource;
  leadId?: string | null;
}): Promise<void> {
  if (!input.optedIn) return;
  try {
    await upsertMarketingSubscriber({
      email: input.email || "",
      fullName: input.fullName,
      source: input.source,
      leadId: input.leadId,
    });
  } catch (err) {
    console.error("marketing subscribeIfOptedIn", err);
  }
}

export async function listMarketingSubscribers(): Promise<MarketingSubscriber[]> {
  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("marketing_subscribers")
      .select(
        "id, email, email_normalized, full_name, source, status, consent_version, consent_text, consented_at, unsubscribed_at, unsubscribe_token, lead_id, created_at, updated_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => mapRow(row as Record<string, unknown>));
  } catch (err) {
    if (!allowLocalFallback()) throw err;
    return readLocal();
  }
}

export async function unsubscribeByToken(
  token: string,
): Promise<{ ok: true; email: string } | { ok: false }> {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false };
  const now = new Date().toISOString();

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("marketing_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: now,
        updated_at: now,
      })
      .eq("unsubscribe_token", trimmed)
      .select("email")
      .maybeSingle();
    if (!error && data?.email) return { ok: true, email: String(data.email) };
  } catch (err) {
    console.error("unsubscribeByToken supabase", err);
  }

  if (!allowLocalFallback()) return { ok: false };
  const all = await readLocal();
  const match = all.find((row) => row.unsubscribeToken === trimmed);
  if (!match) return { ok: false };
  match.status = "unsubscribed";
  match.unsubscribedAt = now;
  match.updatedAt = now;
  await writeLocal(all);
  return { ok: true, email: match.email };
}

export async function unsubscribeById(id: string): Promise<boolean> {
  const now = new Date().toISOString();
  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("marketing_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: now,
        updated_at: now,
      })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (!error && data) return true;
  } catch (err) {
    console.error("unsubscribeById supabase", err);
  }

  if (!allowLocalFallback()) return false;
  const all = await readLocal();
  const match = all.find((row) => row.id === id);
  if (!match) return false;
  match.status = "unsubscribed";
  match.unsubscribedAt = now;
  match.updatedAt = now;
  await writeLocal(all);
  return true;
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "อีเมลที่ลงทะเบียนไว้";
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, user.length - 2))}@${domain}`;
}
