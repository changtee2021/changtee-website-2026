import Link from "next/link";
import { HomePanel, PanelHeading } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { homeServices } from "@/lib/mock-content";

export function ServicesStrip() {
  return (
    <HomePanel tone="clear">
      <div className="px-1 py-4 sm:px-2 sm:py-6 md:py-8">
        <PanelHeading title="บริการของเรา" />

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {homeServices.map((service, i) => {
            const featured = i === 0;
            return (
              <Reveal key={service.href} delayStep={i}>
                <Link
                  href={service.href}
                  className={`group flex h-full min-h-[260px] flex-col rounded-[1.5rem] p-7 transition duration-300 md:min-h-[320px] ${
                    featured
                      ? "bg-navy text-white hover:bg-navy-deep"
                      : "bg-paper text-navy hover:bg-line/40"
                  }`}
                >
                  <span
                    className={`self-end font-display text-3xl font-semibold tabular-nums ${
                      featured ? "text-white/40" : "text-navy/20"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-auto font-display text-xl font-semibold md:text-2xl">
                    {service.title}
                  </h3>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      featured ? "text-white/75" : "text-muted"
                    }`}
                  >
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
