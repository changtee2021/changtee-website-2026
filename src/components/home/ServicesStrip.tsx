import Link from "next/link";
import { HomePanel, PanelHeading } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { homeServices } from "@/lib/mock-content";

/** Flat service icons — top of each item */
function IconChoose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <rect x="6" y="10" width="12" height="28" rx="2" fill="currentColor" opacity="0.25" />
      <rect x="18" y="10" width="12" height="28" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="30" y="10" width="12" height="28" rx="2" fill="currentColor" />
      <circle cx="12" cy="36" r="2.5" fill="currentColor" />
      <circle cx="24" cy="36" r="2.5" fill="currentColor" />
      <circle cx="36" cy="36" r="2.5" fill="currentColor" />
    </svg>
  );
}

function IconInstall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M14 34 28 20a5 5 0 1 0-7-7L7 27l-1.5 9.5L15 35Z"
        fill="currentColor"
      />
      <path
        d="M30 10c2.5-2.5 7-2.2 9.5.3 2.5 2.5 2.8 7 .3 9.5l-3.2 3.2-6.6-6.6L30 10Z"
        fill="currentColor"
        opacity="0.4"
      />
      <rect x="28" y="30" width="14" height="4" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="34" y="24" width="4" height="14" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function IconCustom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path d="M8 38h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M12 34 34 12l4 4L16 38H12v-4Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M30 10l8 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="10" y="8" width="10" height="6" rx="1" fill="currentColor" />
      <path d="M12 14h6v6h-2v-4h-4v-2Z" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

const SERVICE_ICONS = [IconChoose, IconInstall, IconCustom] as const;

export function ServicesStrip() {
  return (
    <HomePanel tone="clear">
      <div className="px-1 py-2 sm:px-2 sm:py-3">
        <PanelHeading title="บริการของเรา" />

        <div className="mt-5 grid gap-6 md:grid-cols-3 md:gap-8">
          {homeServices.map((service, i) => {
            const Icon = SERVICE_ICONS[i] ?? IconChoose;
            const num = String(i + 1).padStart(2, "0");
            return (
              <Reveal key={`${service.title}-${i}`} delayStep={i}>
                <Link
                  href={service.href}
                  className="group flex flex-col text-navy transition duration-300"
                >
                  <Icon className="size-8 text-navy/70 sm:size-9" />
                  <h3 className="mt-3 font-display text-lg font-semibold md:text-xl">
                    <span className="mr-2 tabular-nums text-brand-red">{num}</span>
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {service.desc}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </HomePanel>
  );
}
