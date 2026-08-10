import type { ReactNode } from "react";
import type { InstallVideoClip } from "@/lib/product-decision-aids";
import { YOUTUBE_CHANNEL_URL } from "@/lib/product-decision-aids";
import { YouTubeEmbedCard } from "@/components/media/YouTubeEmbedCard";

export function InstallVideosSection({
  label = "Install videos",
  title,
  intro,
  clips,
  channelLabel = "ดูบน YouTube →",
  channelHref = YOUTUBE_CHANNEL_URL,
  className = "",
  headingAs: Heading = "h2",
}: {
  label?: string;
  title: ReactNode;
  intro?: ReactNode;
  clips: InstallVideoClip[];
  channelLabel?: string;
  channelHref?: string;
  className?: string;
  headingAs?: "h2" | "h3";
}) {
  if (clips.length === 0) return null;

  return (
    <section className={className}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {label ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {label}
            </p>
          ) : null}
          <Heading
            className={`font-display text-2xl font-semibold text-navy sm:text-3xl ${label ? "mt-2" : ""}`}
          >
            {title}
          </Heading>
          {intro ? (
            <div className="mt-1 text-sm text-muted">{intro}</div>
          ) : null}
        </div>
        <a
          href={channelHref}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
        >
          {channelLabel}
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {clips.slice(0, 3).map((clip) => (
          <YouTubeEmbedCard key={clip.id} clip={clip} />
        ))}
      </div>
    </section>
  );
}
