"use client";

import { useState, type ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";
import { CatalogFlipbookModal } from "@/components/catalog/CatalogFlipbookModal";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children?: ReactNode;
};

export function BrochureLink({ className, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("cursor-pointer text-inherit", className)}
      >
        {children ?? siteConfig.brochureLabel}
      </button>
      {open ? (
        <CatalogFlipbookModal
          fileUrl={siteConfig.brochureUrl}
          fileName="changtee-brochure-2026.pdf"
          title={siteConfig.brochureLabel}
          manifestUrl={siteConfig.brochureManifestUrl}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
