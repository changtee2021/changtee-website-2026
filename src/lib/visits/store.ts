import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { FactoryVisitBooking, VisitStatus } from "@/lib/visits/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "factory-visits.json");

function allowLocalFallback() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_LOCAL_LEAD_STORE === "true"
  );
}

function persistenceUnavailable(): never {
  throw new Error("VISIT_PERSISTENCE_UNAVAILABLE");
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<FactoryVisitBooking[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw) as FactoryVisitBooking[];
  } catch {
    return [];
  }
}

async function writeAll(bookings: FactoryVisitBooking[]) {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2), "utf8");
}

function payloadField(row: Record<string, unknown>, key: string): string {
  const payload = row.form_payload;
  if (!payload || typeof payload !== "object") return "";
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function payloadStringArray(row: Record<string, unknown>, key: string): string[] {
  const payload = row.form_payload;
  if (!payload || typeof payload !== "object") return [];
  const value = (payload as Record<string, unknown>)[key];
  return Array.isArray(value) ? value.map(String) : [];
}

function mapDbBooking(row: Record<string, unknown>): FactoryVisitBooking {
  return {
    id: String(row.id),
    fullName: String(row.full_name || ""),
    phone: String(row.phone || ""),
    email: (row.email as string) || null,
    lineId: (row.line_id as string) || null,
    businessName: (row.business_name as string) || null,
    contactPosition:
      (row.contact_position as string) || payloadField(row, "contactPosition") || null,
    taxId: (row.tax_id as string) || payloadField(row, "taxId") || null,
    visitSites: payloadStringArray(row, "visitSites"),
    companyProfileName: payloadField(row, "companyProfileName") || null,
    companyProfilePath: payloadField(row, "companyProfilePath") || null,
    businessCardName: payloadField(row, "businessCardName") || null,
    businessCardPath: payloadField(row, "businessCardPath") || null,
    visitDate: String(row.visit_date || ""),
    session: (row.session as FactoryVisitBooking["session"]) || "morning",
    visitorCount: Number(row.visitor_count || 1),
    purpose: (row.purpose as string) || null,
    productInterest: (row.product_interest as string) || null,
    note: (row.note as string) || null,
    status: (row.status as VisitStatus) || "pending",
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

export async function createVisitBooking(
  input: Omit<FactoryVisitBooking, "id" | "createdAt" | "updatedAt" | "status">,
): Promise<FactoryVisitBooking> {
  const now = new Date().toISOString();
  const booking: FactoryVisitBooking = {
    ...input,
    id: randomUUID(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("factory_visit_bookings")
      .insert({
        id: booking.id,
        full_name: booking.fullName,
        phone: booking.phone,
        email: booking.email || null,
        line_id: booking.lineId || null,
        business_name: booking.businessName || null,
        contact_position: booking.contactPosition || null,
        visit_date: booking.visitDate,
        session: booking.session,
        visitor_count: booking.visitorCount,
        purpose: booking.purpose || null,
        product_interest: booking.productInterest || null,
        note: booking.note || null,
        status: booking.status,
        pdpa_accepted: true,
        form_payload: booking,
      })
      .select("id")
      .single();

    if (!error && data) return booking;
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!allowLocalFallback()) persistenceUnavailable();
  const all = await readAll();
  all.unshift(booking);
  await writeAll(all);
  return booking;
}

export async function listVisitBookings(): Promise<FactoryVisitBooking[]> {
  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("factory_visit_bookings")
      .select("*")
      .order("visit_date", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) return data.map(mapDbBooking);
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!allowLocalFallback()) persistenceUnavailable();
  return readAll();
}

export async function updateVisitBookingStatus(
  id: string,
  status: VisitStatus,
): Promise<FactoryVisitBooking | null> {
  const now = new Date().toISOString();

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("factory_visit_bookings")
      .update({ status, updated_at: now })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (!error) return data ? mapDbBooking(data) : null;
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!allowLocalFallback()) persistenceUnavailable();
  const all = await readAll();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status, updatedAt: now };
  await writeAll(all);
  return all[idx];
}
