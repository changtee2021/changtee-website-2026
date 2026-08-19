"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Eye, FileDown, RefreshCw, Search } from "lucide-react";
import { requestInboxBadgeRefresh } from "@/lib/admin-inbox";
import { DEMO_VISITS } from "@/lib/visits/visits-demo";
import {
  formatVisitSites,
  VISIT_SESSIONS,
  VISIT_SESSION_LABELS,
  VISIT_SESSION_SHORT_LABELS,
  VISIT_STATUSES,
  VISIT_STATUS_STYLES,
  visitStatusLabel,
  type FactoryVisitBooking,
  type VisitSession,
  type VisitStatus,
} from "@/lib/visits/types";
import {
  averageOutcomeScore,
  VISIT_NEXT_STEP_LABELS,
  VISIT_SCORE_KEYS,
  visitScoreLabels,
} from "@/lib/visits/outcome";
import {
  VisitFollowupDialogs,
  type VisitFollowupMode,
} from "@/components/admin/VisitFollowupDialogs";
import {
  VISIT_MODE_LABELS,
  visitKindOf,
  type VisitBookingKind,
} from "@/lib/visits/modes";
import {
  PRESENTATION_VENUE_LABELS,
  type PresentationVenueId,
} from "@/lib/visits/presentation";
import { CmsModal, DemoBadge, FilterChip, StatPill } from "@/components/admin/cms/CmsShared";
import { cn } from "@/lib/utils";

const COPY: Record<
  VisitBookingKind,
  { title: string; formHref: string; formLabel: string; intro: string }
> = {
  "factory-visit": {
    title: "นัดเยี่ยมชมโรงงาน",
    formHref: "/visit-factory",
    formLabel: "/visit-factory",
    intro: "คำขอนัดจากฟอร์มเยี่ยมชมโรงงาน — ยืนยันกับลูกค้าแล้วอัปเดตสถานะที่นี่",
  },
  "product-presentation": {
    title: "นัดนำเสนอสินค้า",
    formHref: "/visit-factory?mode=presentation",
    formLabel: "นัดนำเสนอสินค้า",
    intro:
      "คำขอนัดจากฟอร์มนำเสนอสินค้า — ทีมเข้าพบ / โชว์รูม / ออนไลน์ อัปเดตสถานะที่นี่",
  },
};

function venueLabel(id: string | null | undefined): string {
  if (!id) return "";
  return PRESENTATION_VENUE_LABELS[id as PresentationVenueId] || id;
}

function DetailGroup({
  title,
  children,
  asList = true,
}: {
  title: string;
  children: ReactNode;
  asList?: boolean;
}) {
  return (
    <section className="space-y-2 rounded-2xl border border-line bg-paper/40 p-4">
      <h4 className="font-display text-sm font-semibold text-navy">{title}</h4>
      {asList ? (
        <dl className="space-y-2 text-sm">{children}</dl>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </section>
  );
}

function FileRow({
  label,
  name,
  href,
}: {
  label: string;
  name?: string | null;
  href?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="truncate text-sm text-navy">{name?.trim() || "ไม่มีไฟล์"}</p>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium text-navy hover:bg-paper sm:min-h-9"
        >
          <FileDown className="size-4" />
          เปิดดู
        </a>
      ) : name ? (
        <span className="text-xs text-muted">ยังไม่มีลิงก์ไฟล์</span>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const text =
    value === 0 || value ? String(value).trim() : "";
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-line/70 pb-2">
      <dt className="text-muted">{label}</dt>
      <dd className="col-span-2 whitespace-pre-wrap text-navy">
        {text || "-"}
      </dd>
    </div>
  );
}

export function VisitsBoard({
  kind = "factory-visit",
}: {
  kind?: VisitBookingKind;
}) {
  const copy = COPY[kind];
  const [visits, setVisits] = useState<FactoryVisitBooking[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VisitStatus | "all">("all");
  const [sessionFilter, setSessionFilter] = useState<VisitSession | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<FactoryVisitBooking | null>(null);
  const [followup, setFollowup] = useState<{
    visit: FactoryVisitBooking;
    mode: VisitFollowupMode;
  } | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/visits");
      const json = (await res.json()) as {
        visits?: FactoryVisitBooking[];
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "โหลดไม่สำเร็จ");
      const rows = json.visits || [];
      if (rows.length === 0) {
        setVisits(DEMO_VISITS);
        setUsingDemo(true);
      } else {
        setVisits(rows);
        setUsingDemo(false);
      }
    } catch (err) {
      setVisits(DEMO_VISITS);
      setUsingDemo(true);
      setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const scoped = useMemo(
    () => visits.filter((v) => visitKindOf(v.bookingKind) === kind),
    [visits, kind],
  );

  const sessionScoped = useMemo(
    () =>
      sessionFilter === "all"
        ? scoped
        : scoped.filter((v) => v.session === sessionFilter),
    [scoped, sessionFilter],
  );

  const counts = useMemo(() => {
    const c: Record<VisitStatus | "all", number> = {
      all: sessionScoped.length,
      pending: 0,
      confirmed: 0,
      rescheduled: 0,
      cancelled: 0,
      completed: 0,
    };
    for (const v of sessionScoped) c[v.status] += 1;
    return c;
  }, [sessionScoped]);

  const sessionCounts = useMemo(() => {
    const c: Record<VisitSession | "all", number> = {
      all: scoped.length,
      morning: 0,
      evening: 0,
    };
    for (const v of scoped) c[v.session] += 1;
    return c;
  }, [scoped]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sessionScoped.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (!query) return true;
      return (
        v.fullName.toLowerCase().includes(query) ||
        v.phone.includes(query) ||
        (v.businessName ?? "").toLowerCase().includes(query)
      );
    });
  }, [sessionScoped, statusFilter, search]);

  function applyVisit(next: FactoryVisitBooking) {
    setVisits((prev) => prev.map((v) => (v.id === next.id ? next : v)));
    setSelected((prev) => (prev && prev.id === next.id ? next : prev));
  }

  function onStatusSelect(visit: FactoryVisitBooking, next: VisitStatus) {
    if (next === visit.status) return;
    if (next === "rescheduled" || next === "cancelled" || next === "completed") {
      setFollowup({ visit, mode: next });
      return;
    }
    void saveVisit(visit.id, { status: next });
  }

  async function saveVisit(id: string, payload: Record<string, unknown>) {
    setSavingId(id);
    setError(null);
    const current = visits.find((v) => v.id === id);
    const optimistic = current
      ? ({ ...current, ...payload, updatedAt: new Date().toISOString() } as FactoryVisitBooking)
      : null;
    if (optimistic) applyVisit(optimistic);

    if (!usingDemo) {
      try {
        const res = await fetch(`/api/admin/visits/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = (await res.json()) as {
          visit?: FactoryVisitBooking;
          error?: string;
        };
        if (!res.ok) throw new Error(json.error || "อัปเดตไม่สำเร็จ");
        if (json.visit) applyVisit(json.visit);
      } catch (err) {
        setError(err instanceof Error ? err.message : "อัปเดตสถานะไม่สำเร็จ");
      }
    }
    setSavingId(null);
    setFollowup(null);
    requestInboxBadgeRefresh();
  }

  const isPresentation = kind === "product-presentation";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              {copy.title}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {copy.intro}{" "}
              <a
                href={copy.formHref}
                target="_blank"
                className="text-navy underline"
                rel="noreferrer"
              >
                {copy.formLabel}
              </a>
              {usingDemo ? (
                <span className="ml-1">
                  <DemoBadge />
                </span>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm text-navy hover:bg-paper sm:min-h-9"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            รีเฟรช
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <StatPill label="ทั้งหมด" value={counts.all} />
          <StatPill label="รอยืนยัน" value={counts.pending} />
          <StatPill label="ยืนยันแล้ว" value={counts.confirmed} tone="green" />
          <StatPill label="เลื่อนนัด" value={counts.rescheduled} tone="amber" />
          <StatPill label="ยกเลิก" value={counts.cancelled} tone="red" />
          <StatPill
            label={isPresentation ? "นำเสนอแล้ว" : "เยี่ยมชมแล้ว"}
            value={counts.completed}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label={`ทั้งหมด (${counts.all})`}
            />
            {VISIT_STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                label={`${visitStatusLabel(s, kind)} (${counts[s]})`}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="ดูตามรอบ"
            >
              <FilterChip
                active={sessionFilter === "all"}
                onClick={() => setSessionFilter("all")}
                label={`ทุกรอบ (${sessionCounts.all})`}
              />
              {VISIT_SESSIONS.map((session) => (
                <FilterChip
                  key={session}
                  active={sessionFilter === session}
                  onClick={() => setSessionFilter(session)}
                  label={`${VISIT_SESSION_SHORT_LABELS[session]} (${sessionCounts[session]})`}
                />
              ))}
            </div>
            <label className="relative block w-full sm:w-56 lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อ / เบอร์ / บริษัท"
                className="w-full rounded-xl border border-line py-2 pl-9 pr-3 text-sm outline-none focus:border-navy/40"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">วันที่ / รอบ</th>
                <th className="px-4 py-3 font-medium">ผู้ติดต่อ</th>
                <th className="px-4 py-3 font-medium">ติดต่อ</th>
                <th className="px-4 py-3 font-medium">
                  {isPresentation ? "สถานที่" : "โรงงาน"}
                </th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">ดู</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    ไม่พบรายการตามตัวกรอง
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-navy">{v.visitDate}</div>
                      <div className="text-xs text-muted">
                        {VISIT_SESSION_SHORT_LABELS[v.session]}
                      </div>
                      {v.status === "rescheduled" && v.previousVisitDate ? (
                        <div className="mt-0.5 text-[11px] text-amber-800">
                          จาก {v.previousVisitDate}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy">{v.fullName}</div>
                      {v.contactPosition ? (
                        <div className="text-xs text-muted">
                          {v.contactPosition}
                        </div>
                      ) : null}
                      {v.businessName ? (
                        <div className="text-xs text-muted">{v.businessName}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      <div>{v.phone}</div>
                      {v.lineId ? <div>LINE: {v.lineId}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {isPresentation
                        ? venueLabel(v.presentationVenue) || "-"
                        : formatVisitSites(v.visitSites) || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={v.status}
                        disabled={savingId === v.id}
                        onChange={(e) =>
                          onStatusSelect(v, e.target.value as VisitStatus)
                        }
                        className={cn(
                          "min-h-9 rounded-lg border px-2 py-1.5 text-xs font-medium outline-none",
                          VISIT_STATUS_STYLES[v.status].select,
                        )}
                      >
                        {VISIT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {visitStatusLabel(s, kind)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-label={`ดูรายละเอียด ${v.fullName}`}
                        title="ดูรายละเอียดทั้งหมด"
                        onClick={() => setSelected(v)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line text-navy hover:bg-paper sm:min-h-9 sm:min-w-9"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {error ? <p className="text-sm text-brand-red">{error}</p> : null}
      </section>

      {followup ? (
        <VisitFollowupDialogs
          visit={followup.visit}
          mode={followup.mode}
          busy={savingId === followup.visit.id}
          onClose={() => setFollowup(null)}
          onSubmit={(payload) => void saveVisit(followup.visit.id, payload)}
        />
      ) : null}

      {selected ? (
        <CmsModal
          title={selected.fullName}
          subtitle={VISIT_MODE_LABELS[visitKindOf(selected.bookingKind)]}
          onClose={() => setSelected(null)}
          wide
        >
          <div className="space-y-5">
            <DetailGroup title="ผู้ติดต่อ">
              <DetailRow label="ตำแหน่ง" value={selected.contactPosition} />
              <DetailRow label="บริษัท / ร้าน" value={selected.businessName} />
              <DetailRow label="แผนก" value={selected.department} />
              <DetailRow label="เบอร์โทร" value={selected.phone} />
              <DetailRow label="LINE ID" value={selected.lineId} />
              <DetailRow label="อีเมล" value={selected.email} />
            </DetailGroup>

            <DetailGroup title="ข้อมูลบริษัท">
              <DetailRow
                label="เลขนิติบุคคล / บัตรประชาชน"
                value={selected.taxId}
              />
              <DetailRow
                label="ประเภทนิติบุคคล"
                value={selected.legalEntityType}
              />
              <DetailRow label="ประเภทธุรกิจ" value={selected.industry} />
              <DetailRow
                label="ที่อยู่สำนักงาน"
                value={selected.officeAddress}
              />
            </DetailGroup>

            <DetailGroup title="รายละเอียดนัด">
              <DetailRow label="วันที่นัด" value={selected.visitDate} />
              <DetailRow
                label="รอบเวลา"
                value={VISIT_SESSION_LABELS[selected.session]}
              />
              <DetailRow
                label="จำนวนผู้มา"
                value={`${selected.visitorCount} คน`}
              />
              {isPresentation ? (
                <>
                  <DetailRow
                    label="สถานที่นำเสนอ"
                    value={venueLabel(selected.presentationVenue)}
                  />
                  <DetailRow
                    label="ที่อยู่สถานที่"
                    value={selected.venueAddress}
                  />
                  <DetailRow label="ประเภทงาน" value={selected.jobType} />
                  <DetailRow
                    label="ไทม์ไลน์ตัดสินใจ"
                    value={selected.decisionTimeline}
                  />
                  <DetailRow
                    label="ขอบเขตงาน"
                    value={selected.estimatedScope}
                  />
                </>
              ) : (
                <DetailRow
                  label="โรงงานที่อยากดู"
                  value={formatVisitSites(selected.visitSites)}
                />
              )}
              <DetailRow label="วัตถุประสงค์" value={selected.purpose} />
              <DetailRow
                label="สินค้าที่สนใจ"
                value={selected.productInterest}
              />
              <DetailRow label="หมายเหตุ" value={selected.note} />
              <DetailRow
                label="ส่งคำขอเมื่อ"
                value={new Date(selected.createdAt).toLocaleString("th-TH")}
              />
            </DetailGroup>

            <DetailGroup title="ไฟล์แนบ" asList={false}>
              <FileRow
                label="โปรไฟล์บริษัท"
                name={selected.companyProfileName}
                href={selected.companyProfileUrl}
              />
              <FileRow
                label="นามบัตร"
                name={selected.businessCardName}
                href={selected.businessCardUrl}
              />
            </DetailGroup>

            {selected.rescheduleReason ||
            selected.cancelReason ||
            selected.outcomeScores ||
            selected.outcomeNote ||
            selected.outcomeNextStep ? (
              <DetailGroup title="สรุปการติดตาม">
                {selected.rescheduleReason ? (
                  <DetailRow
                    label="เหตุผลเลื่อนนัด"
                    value={
                      selected.previousVisitDate
                        ? `จาก ${selected.previousVisitDate} ${selected.previousSession ? VISIT_SESSION_SHORT_LABELS[selected.previousSession] : ""} → ${selected.visitDate} ${VISIT_SESSION_SHORT_LABELS[selected.session]}\n${selected.rescheduleReason}`
                        : selected.rescheduleReason
                    }
                  />
                ) : null}
                {selected.cancelReason ? (
                  <DetailRow
                    label="เหตุผลยกเลิก"
                    value={selected.cancelReason}
                  />
                ) : null}
                {selected.outcomeScores ? (
                  <DetailRow
                    label="คะแนนสรุปนัด"
                    value={[
                      `เฉลี่ย ${averageOutcomeScore(selected.outcomeScores) ?? "-"} / 5`,
                      ...VISIT_SCORE_KEYS.map(
                        (key) =>
                          `${visitScoreLabels(kind)[key].title}: ${selected.outcomeScores?.[key] ?? "-"}`,
                      ),
                    ].join("\n")}
                  />
                ) : null}
                {selected.outcomeNextStep ? (
                  <DetailRow
                    label="ขั้นตอนถัดไป"
                    value={VISIT_NEXT_STEP_LABELS[selected.outcomeNextStep]}
                  />
                ) : null}
                {selected.outcomeNote ? (
                  <DetailRow label="โน้ตสรุปนัด" value={selected.outcomeNote} />
                ) : null}
              </DetailGroup>
            ) : null}
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <label className="block text-sm font-medium text-navy">
              สถานะ
              <select
                value={selected.status}
                disabled={savingId === selected.id}
                onChange={(e) =>
                  onStatusSelect(selected, e.target.value as VisitStatus)
                }
                className={cn(
                  "mt-1 block min-h-11 w-full rounded-xl border px-3 text-sm font-medium outline-none sm:min-h-9",
                  VISIT_STATUS_STYLES[selected.status].select,
                )}
              >
                {VISIT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {visitStatusLabel(s, kind)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CmsModal>
      ) : null}
    </div>
  );
}
