import {
  compressSiteImage,
  normalizeSiteMediaType,
  putToSignedUrl,
  readJsonResponse,
  siteMediaKind,
  type SiteUploadTicket,
} from "@/lib/leads/site-media";
import { toStorageRef } from "@/lib/security/lead-media";

export const VISIT_DOC_MAX_FILES = 2;
export const VISIT_DOC_MAX_BYTES = 8 * 1024 * 1024;
export const VISIT_DOC_IMAGE_MAX_BYTES = 12 * 1024 * 1024;

export type VisitDocKind = "image" | "pdf";

export function visitDocAccept() {
  return "application/pdf,image/jpeg,image/png,image/heic,image/heif,.pdf,.jpg,.jpeg,.png,.heic";
}

export function normalizeVisitDocType(file: Pick<File, "type" | "name">): string {
  const raw = file.type.toLowerCase();
  if (raw === "application/pdf") return "application/pdf";
  if (file.name.toLowerCase().endsWith(".pdf")) return "application/pdf";
  return normalizeSiteMediaType(file);
}

export function visitDocKind(contentType: string): VisitDocKind | null {
  if (contentType === "application/pdf") return "pdf";
  if (siteMediaKind(contentType) === "image") return "image";
  return null;
}

export function visitDocExtension(contentType: string): ".pdf" | ".jpg" | ".png" | null {
  if (contentType === "application/pdf") return ".pdf";
  if (contentType === "image/png") return ".png";
  if (
    contentType === "image/jpeg" ||
    contentType === "image/heic" ||
    contentType === "image/jpg"
  ) {
    return ".jpg";
  }
  return null;
}

export async function prepareVisitDocument(file: File): Promise<File> {
  const type = normalizeVisitDocType(file);
  const kind = visitDocKind(type);
  if (!kind) {
    throw new Error("รองรับไฟล์ PDF, JPG หรือ PNG");
  }
  if (kind === "pdf") {
    if (file.size > VISIT_DOC_MAX_BYTES) {
      throw new Error("ไฟล์ PDF ต้องมีขนาดไม่เกิน 8 MB");
    }
    return file;
  }
  if (file.size > VISIT_DOC_IMAGE_MAX_BYTES) {
    throw new Error("รูปใหญ่เกินไป — เลือกรูปใหม่แล้วระบบจะย่อให้อัตโนมัติ");
  }
  return compressSiteImage(file);
}

export async function requestVisitUploadTicket(file: File): Promise<SiteUploadTicket> {
  const res = await fetch("/api/factory-visits/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });
  const json = await readJsonResponse<SiteUploadTicket & { error?: string }>(res);
  if (!res.ok) throw new Error(json.error || "ไม่สามารถเตรียมอัปโหลดได้");
  if (json.mode === "direct") return { mode: "direct" };
  if (json.mode === "signed" && json.signedUrl && json.path) return json;
  throw new Error("ไม่สามารถเตรียมอัปโหลดได้");
}

export async function attachVisitDocuments(formData: FormData, files: File[]) {
  formData.delete("visitDocuments");
  formData.delete("companyProfile");
  formData.delete("businessCard");
  formData.delete("visitDocumentRef");
  formData.delete("visitDocumentName");

  const leftover: File[] = [];
  for (const file of files.slice(0, VISIT_DOC_MAX_FILES)) {
    const ticket = await requestVisitUploadTicket(file);
    if (ticket.mode === "direct") {
      leftover.push(file);
      continue;
    }
    await putToSignedUrl(ticket, file);
    formData.append("visitDocumentRef", toStorageRef(ticket.path));
    formData.append("visitDocumentName", file.name);
  }
  for (const file of leftover) {
    formData.append("visitDocuments", file, file.name);
  }
}
