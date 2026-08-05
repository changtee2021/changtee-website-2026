import { BadgeCheck, Ruler, Truck } from "lucide-react";
import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { whyItems } from "@/lib/mock-content";

const icons = [Ruler, Truck, BadgeCheck] as const;

export function FeatureStrip() {
  return (
    <HomePanel>
      <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {whyItems.map((item, i) => {
          const Icon = icons[i] ?? BadgeCheck;
          return (
            <Reveal
              key={item.title}
              delayStep={i}
              className="flex items-center gap-4 px-6 py-6 sm:px-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper text-navy">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-navy">{item.title}</span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">
                  {item.desc}
                </span>
              </span>
            </Reveal>
          );
        })}
      </div>
    </HomePanel>
  );
}
