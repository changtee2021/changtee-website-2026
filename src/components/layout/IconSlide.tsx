import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const slide =
  "duration-[400ms] ease-[cubic-bezier(0.44,0,0.56,1)] motion-reduce:transition-none";

type Common = {
  label: string;
  className?: string;
  fillClassName?: string;
  /** Label color while the fill is showing (default white, for dark fills). */
  hoverLabelClassName?: string;
  /** Icon color while the fill is showing (default white). */
  iconClassName?: string;
  icon: ReactNode;
};

type Props = Common & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

/** Label at rest. On hover a circle grows from the right and the icon slides in. */
export function IconSlide({
  label,
  className,
  fillClassName = "bg-brand-red",
  hoverLabelClassName = "group-hover:text-white group-focus-visible:text-white",
  iconClassName = "text-white",
  icon,
  href,
  onClick,
}: Props) {
  const classNames = cn(
    "group relative inline-flex h-11 items-center overflow-hidden rounded-full bg-white text-sm font-semibold text-ink",
    className,
  );
  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-[calc(50%-15px)] right-2.5 z-0 size-[30px] rounded-full opacity-0 transition-all",
          fillClassName,
          slide,
          "group-hover:top-[-20%] group-hover:right-[-20%] group-hover:h-[140%] group-hover:w-[140%] group-hover:opacity-100",
          "group-focus-visible:top-[-20%] group-focus-visible:right-[-20%] group-focus-visible:h-[140%] group-focus-visible:w-[140%] group-focus-visible:opacity-100",
        )}
      />
      <span
        className={cn(
          "relative z-[1] px-5 whitespace-nowrap transition-[padding,color]",
          slide,
          "group-hover:pr-11 group-hover:pl-4",
          "group-focus-visible:pr-11 group-focus-visible:pl-4",
          hoverLabelClassName,
        )}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 right-3.5 z-[1] grid size-5 -translate-y-1/2 translate-x-9 place-items-center opacity-0 transition-all",
          iconClassName,
          slide,
          "group-hover:translate-x-0 group-hover:opacity-100",
          "group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
        )}
      >
        {icon}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classNames}>
      {body}
    </button>
  );
}
