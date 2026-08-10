"use client";

import Image from "next/image";
import { useState } from "react";
import type { InstallVideoClip } from "@/lib/product-decision-aids";
import {
  YOUTUBE_CHANNEL_URL,
  clipYoutubeId,
  ytEmbed,
} from "@/lib/product-decision-aids";

export function YouTubeEmbedCard({ clip }: { clip: InstallVideoClip }) {
  const [playing, setPlaying] = useState(false);
  const youtubeId = clipYoutubeId(clip);
  const href = clip.videoUrl?.trim() || YOUTUBE_CHANNEL_URL;

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-video bg-paper">
        {playing && youtubeId ? (
          <iframe
            src={ytEmbed(youtubeId, true)}
            title={clip.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (youtubeId) setPlaying(true);
              else window.open(href, "_blank", "noopener,noreferrer");
            }}
            className="group absolute inset-0 block w-full cursor-pointer text-left"
            aria-label={`เล่นวิดีโอ: ${clip.title}`}
          >
            <Image
              src={clip.thumbnail}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-navy/15 transition group-hover:bg-navy/25" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-white/95 text-brand-red shadow-md transition group-hover:scale-105 sm:size-14">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-0.5 size-5 fill-current sm:size-6"
                  aria-hidden
                >
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </span>
            </span>
            {clip.duration ? (
              <span className="absolute bottom-2 right-2 rounded bg-navy/85 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                {clip.duration}
              </span>
            ) : null}
          </button>
        )}
      </div>
      <div className="px-3 py-3 sm:px-4">
        <p className="text-sm font-semibold text-navy">{clip.title}</p>
      </div>
    </article>
  );
}
