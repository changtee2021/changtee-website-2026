"use client";

import { useState, type ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";
import { CatalogFlipbookModal } from "@/components/catalog/CatalogFlipbookModal";
import { IconSlide } from "@/components/layout/IconSlide";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children?: ReactNode;
  /** Same hover as the quote pill: a circle grows in and an icon slides from the right. */
  slide?: boolean;
  /** Hover fill + matching label/icon colors (slide mode only). */
  fillClassName?: string;
  hoverLabelClassName?: string;
  iconClassName?: string;
};

export function BrochureLink({
  className,
  children,
  slide = false,
  fillClassName = "bg-navy-solid",
  hoverLabelClassName,
  iconClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const label = typeof children === "string" ? children : siteConfig.brochureLabel;

  return (
    <>
      {slide ? (
        <IconSlide
          onClick={() => setOpen(true)}
          label={label}
          className={className}
          fillClassName={fillClassName}
          hoverLabelClassName={hoverLabelClassName}
          iconClassName={iconClassName}
          icon={<EyeMark />}
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn("cursor-pointer text-inherit", className)}
        >
          {children ?? siteConfig.brochureLabel}
        </button>
      )}
      {open ? (
        <CatalogFlipbookModal
          fileUrl={siteConfig.brochureUrl}
          fileName="changtee-brochure-2026.pdf"
          title={siteConfig.brochureLabel}
          manifestUrl={siteConfig.brochureManifestUrl}
          onlineUrl={siteConfig.brochureOnlineUrl}
          onlineLabel="เปิดพรีเซ้นท์"
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function EyeMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        d="M2.8 12s3.4-5.5 9.2-5.5S21.2 12 21.2 12s-3.4 5.5-9.2 5.5S2.8 12 2.8 12z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
