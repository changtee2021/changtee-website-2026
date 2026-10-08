import type { ReactNode } from "react";

export function HomePanel({
  children,
  className = "",
  sectionClassName = "",
  tone = "panel",
}: {
  children: ReactNode;
  className?: string;
  sectionClassName?: string;
  tone?: "panel" | "navy" | "clear";
}) {
  const toneClass =
    tone === "navy"
      ? "rounded-[var(--radius-panel)] bg-navy text-white"
      : tone === "clear"
        ? "bg-transparent text-ink"
        : "rounded-[var(--radius-panel)] bg-panel text-ink";

  return (
    <section className={`relative px-6 pb-5 sm:px-10 sm:pb-8 lg:px-16 lg:pb-10 ${sectionClassName}`}>
      <div className={`mx-auto w-full max-w-5xl ${toneClass} ${className}`}>
        {children}
      </div>
    </section>
  );
}

export function SectionEyebrow({
  children,
  align = "center",
  className = "",
}: {
  children: ReactNode;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <p
      className={`mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red sm:text-xs ${
        align === "center" ? "justify-center" : ""
      } ${className}`}
    >
      <span aria-hidden className="h-px w-6 bg-brand-red/70" />
      {children}
    </p>
  );
}

export function PanelHeading({
  title,
  subtitle,
  eyebrow,
  align = "center",
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: "center" | "start";
  action?: ReactNode;
}) {
  if (align === "start") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? <SectionEyebrow align="start">{eyebrow}</SectionEyebrow> : null}
          <h2 className="font-display text-2xl font-semibold tracking-tight text-navy md:text-4xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className="relative text-center">
      {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
      <h2 className="font-display text-2xl font-semibold tracking-tight text-navy md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">{subtitle}</p>
      ) : null}
      {action ? (
        <div className="mt-4 flex justify-center sm:absolute sm:right-0 sm:top-0 sm:mt-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}
