"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Check, Link2, Play, Video } from "lucide-react";
import { LEARN_ROOMS, LEARN_SHEETS, type LearnRoomId } from "@/lib/learn";
import { Reveal } from "@/components/home/Reveal";
import { PageHero } from "@/components/ui/page-hero";

const CHECKS = [
  "หน้าผ้ากับทิศทางลาย — ทำไมม่านสูงต้องต่อผืน",
  "รูปแบบเปิด-ปิดฉากกั้น 5 แบบ",
  "คลิปติดมอเตอร์ มู่ลี่ไม้ อลูมิเนียม ม่านม้วน",
  "เซลคัดลอกลิงก์ส่งลูกค้าได้ทันที",
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "แผ่นความรู้ร้าน",
    body: "data ที่ใช้สอนเซล ไม่ใช่บทความโปรโมท — อ่านจบแล้วคุยหน้างานได้",
  },
  {
    icon: Video,
    title: "คลิปสอนหน้างาน",
    body: "ช่างตี๋ติดมอเตอร์ให้ดูจริง บีบอัดให้เปิดบนมือถือได้ลื่น",
  },
  {
    icon: Link2,
    title: "ส่งลิงก์ให้ลูกค้า",
    body: "แผ่นละหนึ่ง URL กดคัดลอก วางใน LINE ได้เลย",
  },
];

export function LearnHub() {
  const [room, setRoom] = useState<LearnRoomId | "all">("all");
  const sheets = useMemo(
    () => (room === "all" ? LEARN_SHEETS : LEARN_SHEETS.filter((s) => s.room === room)),
    [room],
  );
  const videos = LEARN_SHEETS.filter((s) => s.kind === "video");

  return (
    <div className="bg-shell pb-16">
      <PageHero
        image="/images/generated/ct-hero-learn.webp"
        imageAlt="ทีมช่างตี๋สอนลูกค้าเลือกผ้าม่านและตัวอย่างวัสดุในโชว์รูม"
        eyebrow="ใหม่ · คัมภีร์ช่างตี๋ · Learning Room"
        title={
          <>
            ห้องเรียนรู้ผ้าม่าน
            <span className="mt-1 block text-brand-red-soft">
              ความรู้ที่ร้านใช้คุยกับลูกค้าจริง
            </span>
          </>
        }
        description="แผ่นความรู้และคลิปสอนที่ร้านใช้คุยกับลูกค้า ไม่ใช่คอนเทนต์อ่านเล่น — ส่งลิงก์ได้เลย"
        actions={
          <>
            <Link
              href="/learn/fabric"
              className="inline-flex items-center justify-center rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white hover:bg-brand-red-soft"
            >
              เริ่มที่แผ่นผ้า
            </Link>
            <a
              href="#videos"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              ดูคลิปมอเตอร์
            </a>
          </>
        }
        extra={
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/70">
            <li className="inline-flex items-center gap-1.5">
              <BookOpen className="size-3.5" /> แผ่นความรู้
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Play className="size-3.5" /> คลิปสอนจริง
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Link2 className="size-3.5" /> ส่งลิงก์ลูกค้า
            </li>
          </ul>
        }
      />

      <section className="mx-auto max-w-5xl px-6 py-14 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_0.85fr_1fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
              ทำไมต้องมีห้องนี้
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy">
              ความรู้ที่คนทั่วไปถูกร้านบอกน้อย
            </h2>
            <ul className="mt-6 space-y-3">
              {CHECKS.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink/90">
                  <Check className="mt-0.5 size-4 shrink-0 text-navy" strokeWidth={2.4} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/learn/fabric"
              className="mt-7 inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              เปิดแผ่นแรก
            </Link>
          </div>

          <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-[1.75rem] bg-paper">
            <Image
              src="/images/learn/learn-feature-measure.jpg"
              alt="ช่างตี๋วัดหน้าต่างหน้างาน"
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>

          <ul className="space-y-6">
            {FEATURES.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="font-display font-semibold text-navy">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="videos"
        className="scroll-mt-24 bg-gradient-to-br from-navy via-[#1a2f55] to-brand-red px-6 py-14 sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase">
            คลิปสอน
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">
            ติดตั้งมอเตอร์ โดยช่างตี๋
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/70">
            3 คลิปจากหน้างานจริง — กดเล่นในหน้าแผ่นได้เลย
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {videos.map((sheet) => (
              <Link
                key={sheet.slug}
                href={`/learn/${sheet.slug}`}
                className="group overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm transition hover:-translate-y-0.5"
              >
                <div className="relative aspect-video">
                  <Image
                    src={sheet.cover}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    sizes="300px"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-white text-navy shadow-lg">
                      <Play className="size-5 fill-current" />
                    </span>
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-white">{sheet.title}</p>
                  <p className="mt-1 text-xs text-white/65">{sheet.videoDuration} · เปิดคลิป</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pt-14 sm:px-10 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
              คลังแผ่น
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-navy md:text-3xl">
              เลือกห้อง แล้วเปิดแผ่น
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <RoomChip
              label="ทุกห้อง"
              active={room === "all"}
              onClick={() => setRoom("all")}
            />
            {LEARN_ROOMS.map((r) => (
              <RoomChip
                key={r.id}
                label={r.label}
                active={room === r.id}
                onClick={() => setRoom(r.id)}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-12">
          {(room === "all" ? LEARN_ROOMS : LEARN_ROOMS.filter((r) => r.id === room)).map(
            (r) => (
              <section key={r.id}>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
                  {r.label}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-navy">
                  {r.title}
                </h3>
                <p className="mt-1 max-w-xl text-sm text-muted">{r.blurb}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sheets
                    .filter((s) => s.room === r.id)
                    .map((sheet, i) => (
                      <Reveal key={sheet.slug} delayStep={i}>
                        <Link
                          href={`/learn/${sheet.slug}`}
                          className="group block overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="relative aspect-[4/3] bg-paper">
                            <Image
                              src={sheet.cover}
                              alt=""
                              fill
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                              sizes="(max-width: 640px) 90vw, 280px"
                            />
                            <span className="absolute top-3 left-3 rounded-full bg-navy/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
                              {sheet.kind === "video" ? "คลิปสอน" : "แผ่นความรู้"}
                            </span>
                          </div>
                          <div className="p-4">
                            <h4 className="font-display text-lg font-semibold text-navy">
                              {sheet.title}
                            </h4>
                            <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                              {sheet.summary}
                            </p>
                            <p className="mt-3 text-xs font-semibold text-brand-red">
                              {sheet.minutes} นาที · เปิดแผ่น →
                            </p>
                          </div>
                        </Link>
                      </Reveal>
                    ))}
                </div>
              </section>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function RoomChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
        active ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-line"
      }`}
    >
      {label}
    </button>
  );
}
