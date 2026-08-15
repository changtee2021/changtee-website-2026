import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  image,
  imageAlt,
  eyebrow,
  title,
  description,
  actions,
  extra,
  footer,
  aside,
  copyClassName,
  imageClassName,
  align = "center",
  priority = true,
}: {
  image: string;
  imageAlt: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
  copyClassName?: string;
  imageClassName?: string;
  align?: "center" | "bottom";
  priority?: boolean;
}) {
  return (
    <section className="relative bg-navy text-white">
      <div className="relative min-h-[100dvh] w-full overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority={priority}
          className={imageClassName ?? "object-cover object-center"}
          sizes="100vw"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/20 to-navy/85 sm:bg-gradient-to-r sm:from-navy/80 sm:via-navy/35 sm:to-navy/10" />

        <div
          className={cn(
            "relative z-[1] flex h-full min-h-[100dvh] flex-col px-6 pt-28 sm:px-10 lg:px-16",
            align === "bottom"
              ? "justify-end pb-6 sm:pb-8"
              : "justify-end pb-16 sm:justify-center sm:pb-16 sm:pt-40",
          )}
        >
          <div
            className={cn(
              "flex w-full flex-col gap-8 lg:flex-row lg:justify-between",
              align === "bottom" ? "lg:items-end" : "lg:items-center",
            )}
          >
            <div className={cn("max-w-xl", copyClassName)}>
              {eyebrow ? (
                <p className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.9rem]">
                {title}
              </h1>
              {description ? (
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
                  {description}
                </p>
              ) : null}
              {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
              {extra}
            </div>
            {aside ? (
              <div className="w-full max-w-[15.5rem] shrink-0 sm:max-w-[17rem] lg:mb-0">
                {aside}
              </div>
            ) : null}
          </div>
          {footer ? <div className="mt-8 w-full">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}
