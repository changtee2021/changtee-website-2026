"use client";

import Image from "next/image";
import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryImage = {
  src: string;
  alt: string;
};

type LightboxProps = {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function ProductImageLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const open = index !== null && images.length > 0;
  const current = open ? images[index]! : null;

  const go = useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      const next = (index + delta + images.length) % images.length;
      onIndexChange(next);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, go]);

  if (!open || !current) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/90 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="ดูภาพใหญ่"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-5 sm:top-5"
        aria-label="ปิด"
      >
        <X className="size-5" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4"
            aria-label="ภาพก่อนหน้า"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4"
            aria-label="ภาพถัดไป"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      ) : null}

      <div
        className="relative h-[min(78vh,720px)] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={current.src}
          alt={current.alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>
      <p className="absolute bottom-4 left-1/2 max-w-[90vw] -translate-x-1/2 truncate text-center text-xs text-white/80 sm:text-sm">
        {current.alt}
        {images.length > 1 ? (
          <span className="ml-2 text-white/50">
            {index! + 1}/{images.length}
          </span>
        ) : null}
      </p>
    </div>
  );
}

type ClickableProps = {
  src: string;
  alt: string;
  onOpen: () => void;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
  showZoomHint?: boolean;
};

export function ClickableProductImage({
  src,
  alt,
  onOpen,
  className,
  imageClassName,
  sizes,
  priority,
  rounded = "rounded-2xl",
  showZoomHint = true,
}: ClickableProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative block w-full overflow-hidden bg-paper text-left",
        rounded,
        className,
      )}
      aria-label={`ดูภาพใหญ่: ${alt}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition duration-500 group-hover:scale-[1.02]",
          imageClassName,
        )}
        sizes={sizes}
        priority={priority}
      />
      {showZoomHint ? (
        <span className="pointer-events-none absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-navy/55 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <ZoomIn className="size-4" aria-hidden />
        </span>
      ) : null}
    </button>
  );
}
