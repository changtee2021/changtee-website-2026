"use client";

import { useRouter } from "next/navigation";
import { visitModeHref, type VisitBookingKind } from "@/lib/visits/modes";
import { cn } from "@/lib/utils";

const MODES: { kind: VisitBookingKind; label: string }[] = [
  { kind: "factory-visit", label: "นัดเยี่ยมชมโรงงานเรา" },
  { kind: "product-presentation", label: "นัดนำเสนอสินค้า" },
];

export function VisitModeSwitch({
  mode,
  className,
}: {
  mode: VisitBookingKind;
  className?: string;
}) {
  const router = useRouter();

  function select(kind: VisitBookingKind) {
    if (kind === mode) return;
    router.replace(visitModeHref(kind, { hash: false }), { scroll: false });
  }

  return (
    <div
      role="tablist"
      aria-label="เลือกประเภทการนัด"
      className={cn(
        "grid grid-cols-2 gap-1 rounded-full border border-line bg-paper p-1",
        className,
      )}
    >
      {MODES.map((item) => {
        const active = item.kind === mode;
        return (
          <button
            key={item.kind}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => select(item.kind)}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-semibold transition sm:min-h-9 sm:text-sm",
              active
                ? "bg-navy text-white shadow-sm"
                : "text-navy hover:bg-white",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
