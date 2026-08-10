import type { ReactNode } from "react";

export function HomePanel({
  children,
  className = "",
  tone = "panel",
}: {
  children: ReactNode;
  className?: string;
  tone?: "panel" | "navy" | "clear";
}) {
  const toneClass =
    tone === "navy"
      ? "rounded-[var(--radius-panel)] bg-navy text-white"
      : tone === "clear"
        ? "bg-transparent text-ink"
        : "rounded-[var(--radius-panel)] bg-panel text-ink";

  return (
    <section className="px-6 pb-3 sm:px-10 sm:pb-4 lg:px-16">
      <div className={`mx-auto w-full max-w-5xl ${toneClass} ${className}`}>
        {children}
      </div>
    </section>
  );
}

export function PanelHeading({
  title,
  subtitle,
  align = "center",
  action,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  action?: ReactNode;
}) {
  if (align === "start") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-navy md:text-3xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className="relative text-center">
      <h2 className="font-display text-2xl font-semibold text-navy md:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{subtitle}</p>
      ) : null}
      {action ? (
        <div className="mt-4 flex justify-center sm:absolute sm:right-0 sm:top-0 sm:mt-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}
