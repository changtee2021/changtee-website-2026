"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";
import {
  YOUTUBE_CHANNEL_URL,
  clipYoutubeId,
  getFeaturedInstallVideos,
  ytEmbed,
  type InstallVideoClip,
} from "@/lib/product-decision-aids";

function PlayIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}

function YoutubeMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z"
      />
    </svg>
  );
}

export function HomeInstallVideosSection() {
  const { values, enabled } = useSectionValues(
    "home",
    "installVideos",
    HOME_SECTION_DEFAULTS.installVideos,
  );
  const clips = getFeaturedInstallVideos(12);
  const [activeId, setActiveId] = useState(clips[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  if (!enabled || clips.length === 0) return null;

  const active =
    clips.find((c) => c.id === activeId) ?? clips[0];
  const youtubeId = clipYoutubeId(active);

  function selectClip(clip: InstallVideoClip) {
    setActiveId(clip.id);
    setPlaying(true);
  }

  function scrollStrip(direction: -1 | 1) {
    const el = stripRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.75, 480);
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <HomePanel tone="clear" className="!p-0">
      <Reveal>
        <div className="overflow-hidden rounded-[var(--radius-panel)] bg-navy text-white">
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.75fr)] lg:items-center lg:gap-8 lg:p-9">
            {/* Featured player */}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy-deep shadow-lg ring-1 ring-white/10">
              {playing && youtubeId ? (
                <iframe
                  key={youtubeId}
                  src={ytEmbed(youtubeId, true)}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="group absolute inset-0 block w-full"
                  aria-label={`เล่นวิดีโอ: ${active.title}`}
                >
                  <Image
                    src={active.thumbnail}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 640px"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-navy/25 transition group-hover:bg-navy/35" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-[#FF0000] text-white shadow-lg transition group-hover:scale-105 sm:size-[4.5rem]">
                      <PlayIcon className="ml-1 size-7 sm:size-8" />
                    </span>
                  </span>
                  {active.duration ? (
                    <span className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-0.5 text-xs font-semibold tabular-nums">
                      {active.duration}
                    </span>
                  ) : null}
                </button>
              )}
            </div>

            {/* Channel CTA */}
            <div className="flex flex-col items-center text-center lg:items-start lg:pl-2 lg:text-left">
              <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-md sm:size-24">
                <Image
                  src="/images/brand/logo-mark.png"
                  alt=""
                  width={88}
                  height={88}
                  className="size-[72%] object-contain"
                />
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/80">
                <YoutubeMark className="size-5 text-[#FF0000]" />
                <EditableSpot
                  sectionId="installVideos"
                  fieldKey="eyebrow"
                  label="ป้ายเล็ก"
                >
                  <span>{values.eyebrow || "Youtube Channel"}</span>
                </EditableSpot>
              </div>

              <EditableSpot
                sectionId="installVideos"
                fieldKey="title"
                label="ชื่อช่อง"
              >
                <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
                  {values.title}
                </h2>
              </EditableSpot>

              <EditableSpot
                sectionId="installVideos"
                fieldKey="subtitle"
                label="คำโปรย"
              >
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
                  {values.subtitle}
                </p>
              </EditableSpot>

              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 fill-current"
                  aria-hidden
                >
                  <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z" />
                </svg>
                {values.channelLabel || "ติดตาม"}
              </a>
            </div>
          </div>

          {/* Thumbnail strip — horizontal scroll */}
          <div className="border-t border-white/10 bg-navy-deep/40 py-5 sm:py-6">
            <div
              ref={stripRef}
              className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1 sm:gap-4 sm:px-7 lg:px-9"
            >
              {clips.map((clip) => {
                const selected = clip.id === active.id;
                return (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => selectClip(clip)}
                    className={`group w-[min(72vw,240px)] shrink-0 overflow-hidden rounded-xl text-left transition sm:w-[220px] ${
                      selected
                        ? "ring-2 ring-brand-red ring-offset-2 ring-offset-navy"
                        : "ring-1 ring-white/10 hover:ring-white/30"
                    }`}
                    aria-label={`เล่น: ${clip.title}`}
                    aria-pressed={selected}
                  >
                    <div className="relative aspect-video bg-navy">
                      <Image
                        src={clip.thumbnail}
                        alt=""
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="240px"
                      />
                      <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/30" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#FF0000] text-white shadow transition group-hover:scale-105">
                          <PlayIcon className="ml-0.5 size-4" />
                        </span>
                      </span>
                      {clip.duration ? (
                        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                          {clip.duration}
                        </span>
                      ) : null}
                    </div>
                    <div className="bg-navy/80 px-3 py-2.5">
                      <p className="line-clamp-2 text-xs font-semibold leading-snug text-white sm:text-sm">
                        {clip.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 px-5 sm:px-7 lg:px-9">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollStrip(-1)}
                  aria-label="เลื่อนคลิปไปทางซ้าย"
                  className="flex size-9 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-white/50 hover:bg-white/10"
                >
                  <ChevronLeft className="size-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollStrip(1)}
                  aria-label="เลื่อนคลิปไปทางขวา"
                  className="flex size-9 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-white/50 hover:bg-white/10"
                >
                  <ChevronRight className="size-5" strokeWidth={2} />
                </button>
              </div>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline"
              >
                ดูคลิปเพิ่มบน YouTube →
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </HomePanel>
  );
}
