export const APPLICATION_STATUSES = [
  "new",
  "reviewing",
  "interview_scheduled",
  "hired",
  "rejected",
  "talent_pool",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "ใบสมัครใหม่",
  reviewing: "กำลังพิจารณา",
  interview_scheduled: "นัดสัมภาษณ์แล้ว",
  hired: "รับเข้าทำงาน",
  rejected: "ไม่ผ่านการพิจารณา",
  talent_pool: "เก็บไว้ (Talent Pool)",
};

export const APPLICATION_STATUS_STYLES: Record<
  ApplicationStatus,
  { select: string }
> = {
  new: { select: "border-sky-300 bg-sky-50 text-sky-800" },
  reviewing: { select: "border-amber-300 bg-amber-50 text-amber-900" },
  interview_scheduled: { select: "border-violet-300 bg-violet-50 text-violet-900" },
  hired: { select: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  rejected: { select: "border-rose-300 bg-rose-50 text-rose-800" },
  talent_pool: { select: "border-slate-300 bg-slate-50 text-slate-800" },
};

export const EDUCATION_LEVELS = [
  "ต่ำกว่ามัธยมศึกษา",
  "มัธยมศึกษา / ปวช.",
  "ปวส. / อนุปริญญา",
  "ปริญญาตรี",
  "ปริญญาโทขึ้นไป",
  "อื่นๆ",
] as const;

export type JobApplication = {
  id: string;
  jobPostingId?: string | null;
  jobTitle?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  lineId?: string | null;
  address?: string | null;
  education?: string | null;
  experienceNote?: string | null;
  coverNote?: string | null;
  expectedSalary?: string | null;
  availableFrom?: string | null;
  resumeFileName?: string | null;
  /** Storage ref (`storage:<path>`) — never expose directly to the browser */
  resumeFilePath?: string | null;
  /** Time-limited signed URL, populated only for admin viewing */
  resumeSignedUrl?: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};
