"use client";

import { useEffect, useState } from "react";
import { isVideoMediaName } from "@/lib/leads/site-media";
import { isDirectMediaUrl, isStorageRef } from "@/lib/security/lead-media";

export function LeadSiteImages({ refs }: { refs: string[] }) {
  const [urls, setUrls] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const ref of refs) {
      if (isDirectMediaUrl(ref)) initial[ref] = ref;
    }
    return initial;
  });

  useEffect(() => {
    const privateRefs = refs.filter((ref) => isStorageRef(ref));
    if (!privateRefs.length) return;

    let cancelled = false;
    void fetch("/api/admin/leads/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refs: privateRefs }),
    })
      .then((res) => res.json() as Promise<{ urls?: Record<string, string> }>)
      .then((json) => {
        if (cancelled || !json.urls) return;
        setUrls((prev) => ({ ...prev, ...json.urls }));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [refs]);

  if (!refs.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {refs.map((ref, i) => {
        const href = urls[ref];
        if (!href) {
          return (
            <div
              key={`${ref}-${i}`}
              className="flex size-20 items-center justify-center rounded-lg border border-line bg-paper text-[10px] text-muted"
            >
              กำลังเปิดไฟล์
            </div>
          );
        }
        return (
          <a
            key={`${ref}-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block size-20 overflow-hidden rounded-lg border border-line bg-paper"
            title={isVideoMediaName(ref) || isVideoMediaName(href) ? `คลิปที่ ${i + 1}` : `รูปที่ ${i + 1}`}
          >
            {isVideoMediaName(ref) || isVideoMediaName(href) ? (
              <video
                src={href}
                className="size-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={href} alt={`แนบ ${i + 1}`} className="size-full object-cover" />
            )}
          </a>
        );
      })}
    </div>
  );
}
