import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  parseOutcomeScores,
  type VisitNextStep,
  type VisitOutcomeScores,
} from "@/lib/visits/outcome";
import { isStorageRef, storagePathFromRef } from "@/lib/security/lead-media";
import { createSignedUploadUrl } from "@/lib/storage/upload";
import type {
  FactoryVisitBooking,
  VisitSession,
  VisitStatus,
} from "@/lib/visits/types";

export type VisitBookingPatch = {
  status?: VisitStatus;
  visitDate?: string;
  session?: VisitSession;
  cancelReason?: string | null;
  rescheduleReason?: string | null;
  previousVisitDate?: string | null;
  previousSession?: VisitSession | null;
  outcomeScores?: VisitOutcomeScores | null;
  outcomeNote?: string | null;
  outcomeNextStep?: VisitNextStep | null;
};

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
    bookingKind:
      payloadField(row, "bookingKind") === "product-presentation"
        ? "product-presentation"
        : "factory-visit",
    department: payloadField(row, "department") || null,
    legalEntityType: payloadField(row, "legalEntityType") || null,
    industry: payloadField(row, "industry") || null,
    officeAddress: payloadField(row, "officeAddress") || null,
    visitSites: payloadStringArray(row, "visitSites"),
    presentationVenue: payloadField(row, "presentationVenue") || null,
    venueAddress: payloadField(row, "venueAddress") || null,
    jobType: payloadField(row, "jobType") || null,
    decisionTimeline: payloadField(row, "decisionTimeline") || null,
    estimatedScope: payloadField(row, "estimatedScope") || null,
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
    cancelReason:
      (row.cancel_reason as string) || payloadField(row, "cancelReason") || null,
    rescheduleReason:
      (row.reschedule_reason as string) ||
      payloadField(row, "rescheduleReason") ||
      null,
    previousVisitDate:
      (row.previous_visit_date as string) ||
      payloadField(row, "previousVisitDate") ||
      null,
    previousSession:
      ((row.previous_session as VisitSession) ||
        (payloadField(row, "previousSession") as VisitSession)) ||
      null,
    outcomeScores:
      parseOutcomeScores(row.outcome_scores) ||
      parseOutcomeScores(
        (row.form_payload as Record<string, unknown> | null)?.outcomeScores,
      ),
    outcomeNote:
      (row.outcome_note as string) || payloadField(row, "outcomeNote") || null,
    outcomeNextStep:
      ((row.outcome_next_step as VisitNextStep) ||
        (payloadField(row, "outcomeNextStep") as VisitNextStep)) ||
      null,
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

    if (!error && data) {
      return Promise.all(data.map((row) => withSignedVisitFiles(mapDbBooking(row))));
    }
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!allowLocalFallback()) persistenceUnavailable();
  return Promise.all((await readAll()).map(withSignedVisitFiles));
}

async function signVisitFile(path: string | null | undefined) {
  if (!path) return null;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/")
  ) {
    return path;
  }
  const storagePath = isStorageRef(path) ? storagePathFromRef(path) : path;
  return createSignedUploadUrl(storagePath, 60 * 30);
}

async function withSignedVisitFiles(
  booking: FactoryVisitBooking,
): Promise<FactoryVisitBooking> {
  const [companyProfileUrl, businessCardUrl] = await Promise.all([
    booking.companyProfileUrl || signVisitFile(booking.companyProfilePath),
    booking.businessCardUrl || signVisitFile(booking.businessCardPath),
  ]);
  return {
    ...booking,
    companyProfileUrl: companyProfileUrl || null,
    businessCardUrl: businessCardUrl || null,
  };
}

function applyPatch(
  current: FactoryVisitBooking,
  patch: VisitBookingPatch,
  now: string,
): FactoryVisitBooking {
  return {
    ...current,
    ...patch,
    updatedAt: now,
  };
}

export async function updateVisitBooking(
  id: string,
  patch: VisitBookingPatch,
): Promise<FactoryVisitBooking | null> {
  const now = new Date().toISOString();

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data: existing, error: readError } = await supabase
      .from("factory_visit_bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!readError && existing) {
      const mapped = mapDbBooking(existing as Record<string, unknown>);
      const next = applyPatch(mapped, patch, now);
      const payload =
        existing.form_payload && typeof existing.form_payload === "object"
          ? { ...(existing.form_payload as Record<string, unknown>), ...next }
          : next;

      const { data, error } = await supabase
        .from("factory_visit_bookings")
        .update({
          status: next.status,
          visit_date: next.visitDate,
          session: next.session,
          cancel_reason: next.cancelReason ?? null,
          reschedule_reason: next.rescheduleReason ?? null,
          previous_visit_date: next.previousVisitDate || null,
          previous_session: next.previousSession || null,
          outcome_scores: next.outcomeScores ?? null,
          outcome_note: next.outcomeNote ?? null,
          outcome_next_step: next.outcomeNextStep ?? null,
          form_payload: payload,
          updated_at: now,
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (!error) return data ? mapDbBooking(data as Record<string, unknown>) : next;
    }
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!allowLocalFallback()) persistenceUnavailable();
  const all = await readAll();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  all[idx] = applyPatch(all[idx], patch, now);
  await writeAll(all);
  return all[idx];
}

export async function updateVisitBookingStatus(
  id: string,
  status: VisitStatus,
): Promise<FactoryVisitBooking | null> {
  return updateVisitBooking(id, { status });
}
