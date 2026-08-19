import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  ApplicationStatus,
  JobApplication,
  JobApplicationFile,
} from "@/lib/careers/types";
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

function payloadField(row: Record<string, unknown>, key: string): string {
  const payload = row.form_payload;
  if (!payload || typeof payload !== "object") return "";
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function parsePortfolioFiles(raw: unknown): JobApplicationFile[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const name = String(record.name || "").trim();
      if (!name) return null;
      return {
        name,
        path: typeof record.path === "string" ? record.path : null,
        signedUrl: typeof record.signedUrl === "string" ? record.signedUrl : null,
      };
    })
    .filter((item): item is JobApplicationFile => Boolean(item));
}

function mapDbApplication(row: Record<string, unknown>): JobApplication {
  const payload =
    row.form_payload && typeof row.form_payload === "object"
      ? (row.form_payload as Record<string, unknown>)
      : {};
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
    portfolioFiles: parsePortfolioFiles(
      row.portfolio_files ?? payload.portfolioFiles,
    ),
    interviewAt:
      (row.interview_at as string) || payloadField(row, "interviewAt") || null,
    rejectReason:
      (row.reject_reason as string) || payloadField(row, "rejectReason") || null,
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
    portfolioFiles: input.portfolioFiles ?? [],
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
        portfolio_files: application.portfolioFiles || [],
        interview_at: application.interviewAt || null,
        reject_reason: application.rejectReason || null,
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

  return Promise.all(applications.map(withSignedFiles));
}

async function signFilePath(filePath: string | null | undefined) {
  if (!filePath) return null;
  const storagePath = isStorageRef(filePath)
    ? storagePathFromRef(filePath)
    : filePath;
  return createSignedUploadUrl(storagePath, 60 * 30);
}

async function withSignedFiles(application: JobApplication): Promise<JobApplication> {
  const resumeSignedUrl = await signFilePath(application.resumeFilePath);
  const portfolioFiles = await Promise.all(
    (application.portfolioFiles || []).map(async (file) => ({
      ...file,
      signedUrl: file.signedUrl || (await signFilePath(file.path)),
    })),
  );
  return {
    ...application,
    resumeSignedUrl: resumeSignedUrl || application.resumeSignedUrl || null,
    portfolioFiles,
  };
}

export type ApplicationPatch = {
  status?: ApplicationStatus;
  interviewAt?: string | null;
  rejectReason?: string | null;
};

export async function updateApplication(
  id: string,
  patch: ApplicationPatch,
): Promise<JobApplication | null> {
  const now = new Date().toISOString();

  try {
    const { createServiceSupabase } = await import("@/lib/supabase/server");
    const supabase = createServiceSupabase();
    const { data: existing, error: readError } = await supabase
      .from("job_applications")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!readError && existing) {
      const mapped = mapDbApplication(existing as Record<string, unknown>);
      const next = { ...mapped, ...patch, updatedAt: now };
      const payload =
        existing.form_payload && typeof existing.form_payload === "object"
          ? { ...(existing.form_payload as Record<string, unknown>), ...next }
          : next;
      const { data, error } = await supabase
        .from("job_applications")
        .update({
          status: next.status,
          interview_at: next.interviewAt || null,
          reject_reason: next.rejectReason || null,
          form_payload: payload,
          updated_at: now,
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (!error) {
        return data
          ? withSignedFiles(mapDbApplication(data as Record<string, unknown>))
          : withSignedFiles(next);
      }
    }
  } catch {
    // fall through to local store when explicitly permitted
  }

  if (!allowLocalFallback()) persistenceUnavailable();
  const all = await readAll();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: now };
  await writeAll(all);
  return withSignedFiles(all[idx]);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<JobApplication | null> {
  return updateApplication(id, { status });
}
