"use client";

import { useState } from "react";
import { CmsModal } from "@/components/admin/cms/CmsShared";
import type { JobApplication } from "@/lib/careers/types";

function toDateInput(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInput(iso: string | null | undefined) {
  if (!iso) return "10:00";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "10:00";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function InterviewDialog({
  application,
  busy,
  onClose,
  onSubmit,
}: {
  application: JobApplication;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: { status: "interview_scheduled"; interviewAt: string }) => void;
}) {
  const [date, setDate] = useState(
    toDateInput(application.interviewAt) ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [time, setTime] = useState(toTimeInput(application.interviewAt));
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!date || !time) {
      setError("กรุณาเลือกวันที่และเวลา");
      return;
    }
    const interviewAt = new Date(`${date}T${time}:00`).toISOString();
    if (Number.isNaN(new Date(interviewAt).getTime())) {
      setError("วันหรือเวลาไม่ถูกต้อง");
      return;
    }
    onSubmit({ status: "interview_scheduled", interviewAt });
  }

  return (
    <CmsModal
      title="นัดสัมภาษณ์"
      subtitle={application.fullName}
      onClose={onClose}
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-navy">
          วันที่สัมภาษณ์
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-navy/40 sm:min-h-9"
          />
        </label>
        <label className="block text-sm font-medium text-navy">
          เวลา
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-navy/40 sm:min-h-9"
          />
        </label>
        {error ? <p className="text-sm text-brand-red">{error}</p> : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-medium text-navy hover:bg-paper sm:min-h-9"
          >
            กลับ
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60 sm:min-h-9"
          >
            บันทึกนัดสัมภาษณ์
          </button>
        </div>
      </div>
    </CmsModal>
  );
}

export function RejectDialog({
  application,
  busy,
  onClose,
  onSubmit,
}: {
  application: JobApplication;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: { status: "rejected"; rejectReason: string }) => void;
}) {
  const [reason, setReason] = useState(application.rejectReason ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!reason.trim()) {
      setError("กรุณาระบุสาเหตุที่ไม่ผ่านการพิจารณา");
      return;
    }
    onSubmit({ status: "rejected", rejectReason: reason.trim() });
  }

  return (
    <CmsModal
      title="ไม่ผ่านการพิจารณา"
      subtitle={application.fullName}
      onClose={onClose}
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-navy">
          สาเหตุ
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="เช่น คุณสมบัติไม่ตรงตำแหน่ง / มีผู้สมัครที่เหมาะสมกว่า / ตำแหน่งปิดรับแล้ว"
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-navy/40"
          />
        </label>
        {error ? <p className="text-sm text-brand-red">{error}</p> : null}
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-medium text-navy hover:bg-paper sm:min-h-9"
          >
            กลับ
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="inline-flex min-h-11 items-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60 sm:min-h-9"
          >
            บันทึกสาเหตุ
          </button>
        </div>
      </div>
    </CmsModal>
  );
}
