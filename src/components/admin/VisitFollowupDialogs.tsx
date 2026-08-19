"use client";

import { useState } from "react";
import { CmsModal } from "@/components/admin/cms/CmsShared";
import {
  emptyOutcomeScores,
  isCompleteOutcomeScores,
  VISIT_NEXT_STEP_LABELS,
  VISIT_NEXT_STEPS,
  VISIT_SCORE_KEYS,
  visitScoreLabels,
  type VisitNextStep,
  type VisitOutcomeScores,
} from "@/lib/visits/outcome";
import {
  VISIT_SESSIONS,
  VISIT_SESSION_LABELS,
  visitStatusLabel,
  type FactoryVisitBooking,
  type VisitSession,
} from "@/lib/visits/types";
import { visitKindOf } from "@/lib/visits/modes";
import { cn } from "@/lib/utils";

export type VisitFollowupMode = "rescheduled" | "cancelled" | "completed";

type VisitFollowupDialogsProps = {
  visit: FactoryVisitBooking;
  mode: VisitFollowupMode;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
};

export function VisitFollowupDialogs({
  visit,
  mode,
  busy,
  onClose,
  onSubmit,
}: VisitFollowupDialogsProps) {
  const kind = visitKindOf(visit.bookingKind);

  if (mode === "rescheduled") {
    return (
      <RescheduleDialog
        visit={visit}
        busy={busy}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );
  }
  if (mode === "cancelled") {
    return (
      <CancelDialog
        visit={visit}
        busy={busy}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );
  }
  return (
    <OutcomeDialog
      visit={visit}
      kind={kind}
      busy={busy}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function RescheduleDialog({
  visit,
  busy,
  onClose,
  onSubmit,
}: Omit<VisitFollowupDialogsProps, "mode">) {
  const [visitDate, setVisitDate] = useState(visit.visitDate);
  const [session, setSession] = useState<VisitSession>(visit.session);
  const [reason, setReason] = useState(visit.rescheduleReason ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!visitDate) {
      setError("กรุณาเลือกวันที่นัดใหม่");
      return;
    }
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผลที่เลื่อนนัด");
      return;
    }
    onSubmit({
      status: "rescheduled",
      visitDate,
      session,
      rescheduleReason: reason.trim(),
      previousVisitDate: visit.visitDate,
      previousSession: visit.session,
    });
  }

  return (
    <CmsModal
      title="เลื่อนนัด"
      subtitle={`${visit.fullName} · นัดเดิม ${visit.visitDate} ${VISIT_SESSION_LABELS[visit.session]}`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-navy">
          วันที่นัดใหม่
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-navy/40 sm:min-h-9"
          />
        </label>
        <fieldset>
          <legend className="text-sm font-medium text-navy">รอบใหม่</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {VISIT_SESSIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSession(item)}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-xl border px-3 text-sm font-medium sm:min-h-9",
                  session === item
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-navy hover:bg-paper",
                )}
              >
                {VISIT_SESSION_LABELS[item]}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-medium text-navy">
          เหตุผลที่เลื่อนนัด
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="เช่น ลูกค้าติดประชุม / ฝนตกหนัก / ทีมเราขอย้ายรอบ"
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
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60 sm:min-h-9"
          >
            บันทึกเลื่อนนัด
          </button>
        </div>
      </div>
    </CmsModal>
  );
}

function CancelDialog({
  visit,
  busy,
  onClose,
  onSubmit,
}: Omit<VisitFollowupDialogsProps, "mode">) {
  const [reason, setReason] = useState(visit.cancelReason ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!reason.trim()) {
      setError("กรุณาระบุเหตุผลที่ยกเลิกนัด");
      return;
    }
    onSubmit({
      status: "cancelled",
      cancelReason: reason.trim(),
    });
  }

  return (
    <CmsModal
      title="ยกเลิกนัด"
      subtitle={visit.fullName}
      onClose={onClose}
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-navy">
          ยกเลิกเพราะอะไร
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="เช่น ลูกค้าเปลี่ยนใจ / โปรเจกต์เลื่อนไม่มีกำหนด / ติดต่อไม่ได้"
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
            ยืนยันยกเลิกนัด
          </button>
        </div>
      </div>
    </CmsModal>
  );
}

function OutcomeDialog({
  visit,
  kind,
  busy,
  onClose,
  onSubmit,
}: Omit<VisitFollowupDialogsProps, "mode"> & {
  kind: ReturnType<typeof visitKindOf>;
}) {
  const labels = visitScoreLabels(kind);
  const [scores, setScores] = useState<VisitOutcomeScores>(
    visit.outcomeScores ?? emptyOutcomeScores(),
  );
  const [nextStep, setNextStep] = useState<VisitNextStep | "">(
    visit.outcomeNextStep ?? "",
  );
  const [note, setNote] = useState(visit.outcomeNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const completedLabel = visitStatusLabel("completed", kind);

  function submit() {
    if (!isCompleteOutcomeScores(scores)) {
      setError("ให้คะแนนครบทั้ง 5 ข้อ (1–5)");
      return;
    }
    if (!nextStep) {
      setError("เลือกขั้นตอนถัดไปด้วย");
      return;
    }
    onSubmit({
      status: "completed",
      outcomeScores: scores,
      outcomeNextStep: nextStep,
      outcomeNote: note.trim(),
    });
  }

  return (
    <CmsModal
      title={`สรุป${completedLabel}`}
      subtitle={`${visit.fullName} · ให้คะแนน 1–5 แล้วเลือกงานต่อ`}
      onClose={onClose}
      wide
    >
      <div className="space-y-5">
        <div className="space-y-4">
          {VISIT_SCORE_KEYS.map((key, index) => (
            <div key={key}>
              <p className="text-sm font-medium text-navy">
                {index + 1}. {labels[key].title}
              </p>
              <p className="text-xs text-muted">{labels[key].hint}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScores((prev) => ({ ...prev, [key]: value }))}
                    className={cn(
                      "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-sm font-semibold sm:min-h-9 sm:min-w-9",
                      scores[key] === value
                        ? "border-navy bg-navy text-white"
                        : "border-line bg-white text-navy hover:bg-paper",
                    )}
                    aria-label={`${labels[key].title} ${value} คะแนน`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-navy">ขั้นตอนถัดไป</legend>
          <div className="mt-2 flex flex-col gap-2">
            {VISIT_NEXT_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setNextStep(step)}
                className={cn(
                  "min-h-11 rounded-xl border px-3 text-left text-sm font-medium sm:min-h-9",
                  nextStep === step
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-navy hover:bg-paper",
                )}
              >
                {VISIT_NEXT_STEP_LABELS[step]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-navy">
          โน้ตสรุปการนัด
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="คุยอะไรไปบ้าง ลูกค้าสนใจรุ่นไหน มีข้อกังวลอะไร"
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
            className="inline-flex min-h-11 items-center rounded-xl bg-navy px-4 text-sm font-medium text-white hover:bg-navy-deep disabled:opacity-60 sm:min-h-9"
          >
            บันทึกสรุปนัด
          </button>
        </div>
      </div>
    </CmsModal>
  );
}
