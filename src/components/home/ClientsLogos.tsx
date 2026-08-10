import Image from "next/image";
import { CLIENT_LOGOS } from "@/lib/client-logos";
import { cn } from "@/lib/utils";

/** Split all logos across 3 marquee rows */
const ROW_SIZE = Math.ceil(CLIENT_LOGOS.length / 3);
const ROW_TOP = CLIENT_LOGOS.slice(0, ROW_SIZE);
const ROW_MID = CLIENT_LOGOS.slice(ROW_SIZE, ROW_SIZE * 2);
const ROW_BOTTOM = CLIENT_LOGOS.slice(ROW_SIZE * 2);

/** Client logo marquees — rendered inside StatsStory as one combined home section. */
export function ClientsLogos() {
  return (
    <div className="px-0 py-2 sm:py-3">
      <p className="sr-only">ลูกค้าองค์กรที่ไว้วางใจช่างตี๋</p>
      <div className="space-y-1.5 sm:space-y-2">
        <LogoMarquee logos={ROW_TOP} direction="left" duration={90} />
        <LogoMarquee logos={ROW_MID} direction="right" duration={105} />
        <LogoMarquee logos={ROW_BOTTOM} direction="left" duration={95} />
      </div>
    </div>
  );
}

function LogoMarquee({
  logos,
  direction,
  duration,
}: {
  logos: readonly string[];
  direction: "left" | "right";
  duration: number;
}) {
  if (logos.length === 0) return null;

  const loop = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-panel to-transparent sm:w-16"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-panel to-transparent sm:w-16"
        aria-hidden
      />

      <div
        className={cn(
          "flex w-max items-center gap-2 sm:gap-3",
          direction === "left"
            ? "animate-logo-marquee-left"
            : "animate-logo-marquee-right",
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative flex h-16 w-auto shrink-0 items-center justify-center bg-transparent px-1 sm:h-20"
          >
            <Image
              src={src}
              alt=""
              width={180}
              height={80}
              unoptimized
              className="h-14 w-auto max-w-[9rem] object-contain sm:h-16 sm:max-w-[11rem]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
