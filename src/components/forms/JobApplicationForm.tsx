"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PdpaConsentField } from "@/components/forms/PdpaConsentField";
import {
  isTurnstileEnabled,
  TurnstileField,
} from "@/components/forms/TurnstileField";
import { EDUCATION_LEVELS } from "@/lib/careers/types";
import type { JobPosting } from "@/lib/cms/careers-demo";

const GENERAL_APPLICATION = "__general__";

export function JobApplicationForm({
  jobs,
  defaultJobId,
}: {
  jobs: JobPosting[];
  defaultJobId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const onTurnstile = useCallback((token: string | null) => {
    setTurnstileToken(token);
  }, []);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    if (isTurnstileEnabled() && !turnstileToken) {
      setError("กรุณายืนยันว่าคุณไม่ใช่บอท");
      setPending(false);
      return;
    }

    const jobPostingId = String(formData.get("jobPostingId") || "");
    const job = jobs.find((j) => j.id === jobPostingId);
    formData.set("jobPostingId", jobPostingId === GENERAL_APPLICATION ? "" : jobPostingId);
    formData.set("jobTitle", job?.title || "");
    if (turnstileToken) formData.set("turnstileToken", turnstileToken);

    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "ส่งใบสมัครไม่สำเร็จ");
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">ตำแหน่งที่สนใจ</span>
        <select
          name="jobPostingId"
          defaultValue={defaultJobId || GENERAL_APPLICATION}
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
        >
          <option value={GENERAL_APPLICATION}>สมัครทั่วไป (ยังไม่มีตำแหน่งที่ตรง)</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ชื่อ-นามสกุล" name="fullName" autoComplete="name" required />
        <Field label="เบอร์โทรศัพท์" name="phone" type="tel" autoComplete="tel" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="อีเมล" name="email" type="email" autoComplete="email" required />
        <Field label="LINE ID (ถ้ามี)" name="lineId" />
      </div>
      <Field label="ที่อยู่ / จังหวัดที่พักอาศัยปัจจุบัน" name="address" autoComplete="address-level2" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">ระดับการศึกษา</span>
          <select
            name="education"
            defaultValue=""
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
          >
            <option value="" disabled>
              เลือกระดับการศึกษา
            </option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <Field label="วันที่พร้อมเริ่มงาน" name="availableFrom" type="date" />
      </div>

      <Field
        label="เงินเดือนที่คาดหวัง"
        name="expectedSalary"
        placeholder="เช่น 15,000 บาท หรือ ตามตกลง"
      />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">ประสบการณ์ทำงาน / ตำแหน่งล่าสุด</span>
        <textarea
          name="experienceNote"
          rows={3}
          placeholder="สรุปประสบการณ์ทำงานที่เกี่ยวข้อง"
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">ข้อความถึงเรา (ถ้ามี)</span>
        <textarea
          name="coverNote"
          rows={3}
          placeholder="เหตุผลที่อยากร่วมงานกับเรา หรือข้อมูลเพิ่มเติม"
          className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">แนบเรซูเม่ (PDF / JPG / PNG ไม่เกิน 8MB)</span>
        <input
          name="resume"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => setResumeName(e.target.files?.[0]?.name ?? null)}
          className="block w-full cursor-pointer rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-navy focus:border-navy"
        />
        {resumeName ? (
          <span className="mt-1 block text-xs text-muted">ไฟล์ที่เลือก: {resumeName}</span>
        ) : null}
      </label>

      <PdpaConsentField />
      <TurnstileField onToken={onTurnstile} />
      {error ? (
        <p className="text-sm text-brand-red" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-soft disabled:opacity-60 sm:w-auto"
      >
        {pending ? "กำลังส่งใบสมัคร..." : "ส่งใบสมัครงาน"}
      </button>
      <p className="text-xs text-muted">
        ไม่พบตำแหน่งที่ตรงกับคุณสมบัติของคุณตอนนี้? ส่งใบสมัครทั่วไปไว้ได้ ทีมงานจะเก็บข้อมูลไว้ติดต่อเมื่อมีตำแหน่งที่เหมาะสม
      </p>
    </form>
  );
}

const FIELD_HINTS: Record<string, { autoComplete?: string; inputMode?: "tel" }> = {
  phone: { autoComplete: "tel", inputMode: "tel" },
};

function Field({
  label,
  name,
  required,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  const hints = FIELD_HINTS[name] || {};
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete ?? hints.autoComplete}
        inputMode={hints.inputMode}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-navy"
      />
    </label>
  );
}
