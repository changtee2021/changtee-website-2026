"use client";

import { useEffect, useRef, useState } from "react";

/** Load Google Maps iframe only after the block is near the viewport (or on click). */
export function LazyMapsEmbed({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || active) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  return (
    <div ref={ref} className={className}>
      {active ? (
        <iframe
          title={title}
          src={src}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-paper px-4 text-center text-sm font-medium text-navy hover:bg-white"
        >
          <span>แตะเพื่อโหลดแผนที่</span>
          <span className="text-xs font-normal text-muted">Google Maps</span>
        </button>
      )}
    </div>
  );
}
