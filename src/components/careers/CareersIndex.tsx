"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Banknote, Briefcase, MapPin, Users } from "lucide-react";
import { normalizeJobPosting } from "@/lib/cms/careers-demo";
import { useJobPostings } from "@/lib/cms/demo-store";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
import { cn } from "@/lib/utils";

export function CareersIndex() {
  const postings = useJobPostings();
  const openJobs = useMemo(
    () =>
      postings
        .filter((job) => job.status === "published")
        .map(normalizeJobPosting),
    [postings],
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  return (
    <div className="bg-shell pb-16">
      <section className="border-b border-line/70 bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Careers · ร่วมงานกับเรา
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-navy sm:text-4xl">
            ร่วมงานกับช่างตี๋ ผ้าม่าน
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            ทีมงานที่เข้าใจงานผ้าม่านครบวงจร ตั้งแต่โรงงานผลิตถึงหน้างานติดตั้ง —
            ดูตำแหน่งที่เปิดรับ หรือส่งใบสมัครทั่วไปไว้ล่วงหน้าได้เลย
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 pt-10">
        <h2 className="font-display text-xl font-semibold text-navy">ตำแหน่งที่เปิดรับสมัคร</h2>

        {openJobs.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-line bg-white p-6 text-sm text-muted">
            ขณะนี้ยังไม่มีตำแหน่งเปิดรับสมัคร แต่คุณสามารถส่ง
            <span className="font-semibold text-navy"> ใบสมัครทั่วไป</span>{" "}
            ไว้ล่วงหน้าได้ที่แบบฟอร์มด้านล่าง ทีมงานจะเก็บข้อมูลไว้ติดต่อเมื่อมีตำแหน่งที่เหมาะสม
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {openJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedJobId === job.id}
                onApply={() => {
                  setSelectedJobId(job.id);
                  document
                    .getElementById("apply-form")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div id="apply-form" className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16 pt-14 scroll-mt-20">
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-6 md:p-8">
          <h2 className="font-display text-lg font-semibold text-navy sm:text-xl">
            ส่งใบสมัครงาน
          </h2>
          <p className="mt-1 text-sm text-muted">
            เลือกตำแหน่งที่สนใจ หรือส่งใบสมัครทั่วไปไว้ล่วงหน้าหากยังไม่มีตำแหน่งที่ตรงกับคุณ
          </p>
          <div className="mt-6">
            <JobApplicationForm jobs={openJobs} defaultJobId={selectedJobId ?? undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({
  job,
  selected,
  onApply,
}: {
  job: ReturnType<typeof useJobPostings>[number];
  selected: boolean;
  onApply: () => void;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition",
        selected ? "border-navy ring-1 ring-navy/30" : "border-line hover:border-navy/30",
      )}
    >
      {job.coverImage ? (
        <div className="relative aspect-[16/9] w-full bg-paper">
          <Image
            src={job.coverImage}
            alt={job.coverAlt || job.title}
            fill
            className="object-cover object-center"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-navy">{job.title}</h3>
        <p className="mt-1 text-sm text-muted">{job.summary}</p>

        <dl className="mt-4 space-y-1.5 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Briefcase className="size-3.5 shrink-0" aria-hidden />
            <span>
              {job.department} · {job.employmentType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span>{job.location}</span>
          </div>
          {job.salaryRange ? (
            <div className="flex items-center gap-2">
              <Banknote className="size-3.5 shrink-0" aria-hidden />
              <span>{job.salaryRange}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0" aria-hidden />
            <span>รับ {job.headcount} ตำแหน่ง</span>
          </div>
        </dl>

        {job.requirements.length ? (
          <ul className="mt-3 space-y-1 text-xs leading-relaxed text-muted">
            {job.requirements.slice(0, 3).map((req) => (
              <li key={req} className="flex gap-1.5">
                <span className="text-brand-red">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={onApply}
          className="mt-4 inline-flex w-fit rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-deep"
        >
          สมัครตำแหน่งนี้
        </button>
      </div>
    </article>
  );
}
