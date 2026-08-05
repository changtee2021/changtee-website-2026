"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shows real-page content that cannot be edited in this CMS screen */
export function LockedSpot({
  children,
  reason = "แก้ไม่ได้ในหน้านี้",
  className,
}: {
  children: ReactNode;
  reason?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("group/locked relative", className)}
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="pointer-events-none select-none">{children}</div>
      <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-full bg-navy/75 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-sm transition group-hover/locked:opacity-100">
        ล็อก · {reason}
      </span>
    </div>
  );
}
