import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { ApplicationStatus, JobApplication } from "@/lib/careers/types";
import { isStorageRef, storagePathFromRef } from "@/lib/security/lead-media";
import { createSignedUploadUrl } from "@/lib/storage/upload";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "job-applications.json");

function allowLocalFallback() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_LOCAL_LEAD_STORE === "true"
  );
}

function persistenceUnavailable(): never {
  throw new Error("APPLICATION_PERSISTENCE_UNAVAILABLE");
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<JobApplication[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw) as JobApplication[];
  } catch {
    return [];
  }
}

async function writeAll(applications: JobApplication[]) {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(applications, null, 2), "utf8");
}

function mapDbApplication(row: Record<string, unknown>): JobApplication {
  return {
    id: String(row.id),
    jobPostingId: (row.job_posting_id as string) || null,
    jobTitle: (row.job_title as string) || null,
    fullName: String(row.full_name || ""),
    phone: String(row.phone || ""),
    email: (row.email as string) || null,
    lineId: (row.line_id as string) || null,
    address: (row.address as string) || null,
    education: (row.education as string) || null,
    experienceNote: (row.experience_note as string) || null,
    coverNote: (row.cover_note as string) || null,
    expectedSalary: (row.expected_salary as string) || null,
    availableFrom: (row.available_from as string) || null,
    resumeFileName: (row.resume_file_name as string) || null,
    resumeFilePath: (row.resume_file_path as string) || null,
    status: (row.status as ApplicationStatus) || "new",
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

export async function createJobApplication(
  input: Omit<JobApplication, "id" | "createdAt" | "updatedAt" | "status">,
): Promise<JobApplication> {
  const now = new Date().toISOString();
  const application: JobApplication = {
    ...input,
    id: randomUUID(),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("job_applications")
      .insert({
        id: application.id,
        job_posting_id: application.jobPostingId || null,
        job_title: application.jobTitle || null,
        full_name: application.fullName,
        phone: application.phone,
        email: application.email || null,
        line_id: application.lineId || null,
        address: application.address || null,
        education: application.education || null,
        experience_note: application.experienceNote || null,
        cover_note: application.coverNote || null,
        expected_salary: application.expectedSalary || null,
        available_from: application.availableFrom || null,
        resume_file_name: application.resumeFileName || null,
        resume_file_path: application.resumeFilePath || null,
        status: application.status,
        pdpa_accepted: true,
        form_payload: application,
      })
      .select("id")
      .single();

    if (!error && data) return application;
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!allowLocalFallback()) persistenceUnavailable();
  const all = await readAll();
  all.unshift(application);
  await writeAll(all);
  return application;
}

/** List applications with a short-lived signed URL for each resume (admin only). */
export async function listJobApplications(): Promise<JobApplication[]> {
  let applications: JobApplication[] | null = null;

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) applications = data.map(mapDbApplication);
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!applications) {
    if (!allowLocalFallback()) persistenceUnavailable();
    applications = await readAll();
  }

  return Promise.all(
    applications.map(async (application) => {
      if (!application.resumeFilePath) return application;
      const path = isStorageRef(application.resumeFilePath)
        ? storagePathFromRef(application.resumeFilePath)
        : application.resumeFilePath;
      const signedUrl = await createSignedUploadUrl(path, 60 * 30);
      return { ...application, resumeSignedUrl: signedUrl };
    }),
  );
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<JobApplication | null> {
  const now = new Date().toISOString();

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("job_applications")
      .update({ status, updated_at: now })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (!error) return data ? mapDbApplication(data) : null;
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!allowLocalFallback()) persistenceUnavailable();
  const all = await readAll();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status, updatedAt: now };
  await writeAll(all);
  return all[idx];
}
