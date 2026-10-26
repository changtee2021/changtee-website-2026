import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { LeadStatus, QuoteLead } from "@/lib/leads/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "leads.json");

export function allowLocalLeadFallback() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_LOCAL_LEAD_STORE === "true"
  );
}

function persistenceUnavailable(): never {
  throw new Error("LEAD_PERSISTENCE_UNAVAILABLE");
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<QuoteLead[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw) as QuoteLead[];
  } catch {
    return [];
  }
}

async function writeAll(leads: QuoteLead[]) {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2), "utf8");
}

export async function createLead(
  input: Omit<QuoteLead, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: LeadStatus;
  },
): Promise<QuoteLead> {
  const now = new Date().toISOString();
  const lead: QuoteLead = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "new",
    createdAt: now,
    updatedAt: now,
  };

  // Prefer Supabase when configured
  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        id: lead.id,
        source: lead.source,
        status: lead.status,
        full_name: lead.contactName,
        phone: lead.phone,
        email: lead.email,
        line_id: lead.lineId ?? null,
        message: lead.note ?? null,
        product_interest: lead.productType,
        job_title: lead.jobTitle ?? null,
        contact_type: lead.contactType,
        business_name: lead.businessName ?? null,
        install_address: lead.installAddress,
        billing_address: lead.billingAddress ?? null,
        tax_id: lead.taxId ?? null,
        product_type: lead.productType,
        requested_size: lead.requestedSize ?? null,
        site_image_url: lead.siteImageUrl ?? null,
        callback_date: lead.callbackDate ?? null,
        referral_source: lead.referralSource,
        estimate_payload: lead.estimatePayload ?? null,
        form_payload: lead,
        pdpa_accepted: true,
      })
      .select("id, quote_no")
      .single();

    if (!error && data) {
      lead.quoteNo = (data.quote_no as string | null) ?? null;
      await supabase.from("lead_events").insert({
        lead_id: lead.id,
        from_status: null,
        to_status: "new",
        note: "สร้างจากเว็บไซต์",
      });
      return lead;
    }
    if (error) {
      console.error("createLead supabase", error.message, error.code);
    }
  } catch (err) {
    console.error(
      "createLead",
      err instanceof Error ? err.message : "unknown error",
    );
  }

  if (!allowLocalLeadFallback()) persistenceUnavailable();
  const all = await readAll();
  all.unshift(lead);
  await writeAll(all);
  return lead;
}

export async function listLeads(): Promise<QuoteLead[]> {
  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("listLeads supabase", error.message);
    } else if (data) {
      return data.map(mapDbLead);
    }
  } catch (err) {
    console.error(
      "listLeads",
      err instanceof Error ? err.message : "unknown error",
    );
  }

  if (!allowLocalLeadFallback()) persistenceUnavailable();
  return readAll();
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<QuoteLead | null> {
  const now = new Date().toISOString();

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data: current } = await supabase
      .from("leads")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await supabase
      .from("leads")
      .update({ status, updated_at: now })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (!error) {
      await supabase.from("lead_events").insert({
        lead_id: id,
        from_status: current?.status ?? null,
        to_status: status,
        note: "อัปเดตจากแอดมิน",
      });
      return data ? mapDbLead(data) : null;
    }
  } catch {
    // Use the local store only when explicitly permitted.
  }

  if (!allowLocalLeadFallback()) persistenceUnavailable();
  const all = await readAll();
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) {
    // maybe only in supabase — reload list shape
    const listed = await listLeads();
    const found = listed.find((l) => l.id === id);
    if (!found) return null;
    return { ...found, status, updatedAt: now };
  }

  all[idx] = { ...all[idx], status, updatedAt: now };
  await writeAll(all);
  return all[idx];
}

export type LeadLineClaim = {
  lead: QuoteLead;
  claimedBy: string;
  claimedAt: string;
  isNewClaim: boolean;
};

/**
 * First tap wins: the update only matches while `line_claimed_by` is empty, so
 * two salespeople tapping at once cannot both own the lead.
 */
export async function claimLeadFromLine(
  id: string,
  claimedBy: string,
  lineUserId: string | null,
): Promise<LeadLineClaim | null> {
  const { createServiceSupabase } = await import("@/lib/supabase/server");
  const supabase = createServiceSupabase();
  const claimedAt = new Date().toISOString();

  const { data: claimed, error } = await supabase
    .from("leads")
    .update({
      line_claimed_by: claimedBy,
      line_claimed_at: claimedAt,
      line_claimed_user_id: lineUserId,
      updated_at: claimedAt,
    })
    .eq("id", id)
    .is("line_claimed_by", null)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("claimLeadFromLine", error.message, error.code);
    return null;
  }

  if (claimed) {
    await supabase.from("lead_events").insert({
      lead_id: id,
      from_status: claimed.status ?? null,
      to_status: claimed.status,
      note: `รับงานผ่าน LINE: ${claimedBy}`,
    });
    return {
      lead: mapDbLead(claimed),
      claimedBy,
      claimedAt,
      isNewClaim: true,
    };
  }

  const { data: current } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!current?.line_claimed_by) return null;
  return {
    lead: mapDbLead(current),
    claimedBy: String(current.line_claimed_by),
    claimedAt: String(current.line_claimed_at),
    isNewClaim: false,
  };
}

export const JOB_STATUSES = ["done"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export type LeadJob = {
  lead: QuoteLead;
  claimedBy: string | null;
  claimedAt: string | null;
  claimedUserId: string | null;
  jobStatus: JobStatus | null;
  jobStatusAt: string | null;
};

function mapJob(row: Record<string, unknown>): LeadJob {
  return {
    lead: mapDbLead(row),
    claimedBy: (row.line_claimed_by as string) || null,
    claimedAt: (row.line_claimed_at as string) || null,
    claimedUserId: (row.line_claimed_user_id as string) || null,
    jobStatus: (row.job_status as JobStatus) || null,
    jobStatusAt: (row.job_status_at as string) || null,
  };
}

export async function getLeadJob(id: string): Promise<LeadJob | null> {
  const { createServiceSupabase } = await import("@/lib/supabase/server");
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getLeadJob", error.message, error.code);
    return null;
  }
  return data ? mapJob(data) : null;
}

/**
 * Only the LINE user who claimed the lead may move it forward, and a closed
 * job stays closed. The update re-checks both in SQL so races cannot skip it.
 */
export async function updateLeadJobStatus(
  id: string,
  status: JobStatus,
  lineUserId: string,
): Promise<{ ok: true; job: LeadJob } | { ok: false; reason: "not_found" | "forbidden" | "closed" | "error" }> {
  const current = await getLeadJob(id);
  if (!current) return { ok: false, reason: "not_found" };
  if (!current.claimedUserId || current.claimedUserId !== lineUserId) {
    return { ok: false, reason: "forbidden" };
  }
  if (current.jobStatus === "done") return { ok: false, reason: "closed" };

  const { createServiceSupabase } = await import("@/lib/supabase/server");
  const supabase = createServiceSupabase();
  const now = new Date().toISOString();
  let query = supabase
    .from("leads")
    .update({ job_status: status, job_status_at: now, updated_at: now })
    .eq("id", id)
    .eq("line_claimed_user_id", lineUserId);
  query = current.jobStatus ? query.eq("job_status", current.jobStatus) : query.is("job_status", null);
  const { data, error } = await query.select("*").maybeSingle();
  if (error) {
    console.error("updateLeadJobStatus", error.message, error.code);
    return { ok: false, reason: "error" };
  }
  if (!data) return { ok: false, reason: "closed" };

  await supabase.from("lead_events").insert({
    lead_id: id,
    from_status: data.status ?? null,
    to_status: data.status,
    note: `อัปเดตงานผ่าน LINE (${current.claimedBy}): ${status}`,
  });
  return { ok: true, job: mapJob(data) };
}

function mapDbLead(row: Record<string, unknown>): QuoteLead {
  const payload = (row.form_payload as QuoteLead | null) ?? null;
  if (payload?.contactName) {
    return {
      ...payload,
      id: String(row.id),
      quoteNo: (row.quote_no as string) || null,
      status: row.status as LeadStatus,
      createdAt: String(row.created_at ?? payload.createdAt),
      updatedAt: String(row.updated_at ?? payload.updatedAt),
    };
  }

  return {
    id: String(row.id),
    quoteNo: (row.quote_no as string) || null,
    source: (row.source as QuoteLead["source"]) || "quote",
    status: (row.status as LeadStatus) || "new",
    contactName: String(row.full_name || ""),
    jobTitle: (row.job_title as string) || null,
    phone: String(row.phone || ""),
    contactType: String(row.contact_type || ""),
    businessName: (row.business_name as string) || null,
    installAddress: String(row.install_address || ""),
    billingAddress: (row.billing_address as string) || null,
    taxId: (row.tax_id as string) || null,
    email: String(row.email || ""),
    productType: String(row.product_type || row.product_interest || ""),
    requestedSize: (row.requested_size as string) || null,
    siteImageUrl: (row.site_image_url as string) || null,
    callbackDate: (row.callback_date as string) || null,
    referralSource: String(row.referral_source || ""),
    note: (row.message as string) || null,
    lineId: (row.line_id as string) || null,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}
