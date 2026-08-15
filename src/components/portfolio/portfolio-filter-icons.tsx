import type { ReactElement, ReactNode } from "react";
import type { SpaceType } from "@/lib/cms/portfolio-demo";
import { cn } from "@/lib/utils";
import {
  IconAll,
  IconCurtain,
  IconMotorized,
  IconOutdoor,
  IconPartition,
  IconPrint,
  IconRoller,
  IconService,
  IconSurface,
  IconVenetian,
  IconVertical,
  PRODUCT_LINE_ICONS,
} from "@/components/icons/product-line-icons";

export {
  IconAll,
  IconCurtain,
  IconMotorized,
  IconOutdoor,
  IconPartition,
  IconPrint,
  IconRoller,
  IconService,
  IconSurface,
  IconVenetian,
  IconVertical,
};

type IconProps = {
  className?: string;
  active?: boolean;
};

/** Shared flat-graphic palette — navy body + red accent when active */
function tones(active?: boolean) {
  return {
    ink: active ? "#0b1f3a" : "#1a2b45",
    soft: active ? "#e8eef6" : "#d5dde8",
    mid: active ? "#8fa3bc" : "#9aabbf",
    accent: active ? "#c8102e" : "#5b677a",
  };
}

function SvgShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconHome({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <path d="M8 22 24 8l16 14v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V22Z" fill={t.soft} />
      <path d="M8 22 24 8l16 14" stroke={t.ink} strokeWidth="3" strokeLinejoin="round" />
      <rect x="19" y="28" width="10" height="12" rx="1.5" fill={t.ink} />
      <rect x="13" y="24" width="7" height="7" rx="1" fill={t.accent} />
    </SvgShell>
  );
}

export function IconCondo({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <rect x="12" y="8" width="24" height="32" rx="2" fill={t.ink} />
      <rect x="16" y="12" width="5" height="5" rx="1" fill={t.soft} />
      <rect x="27" y="12" width="5" height="5" rx="1" fill={t.soft} />
      <rect x="16" y="21" width="5" height="5" rx="1" fill={t.soft} />
      <rect x="27" y="21" width="5" height="5" rx="1" fill={t.accent} />
      <rect x="16" y="30" width="5" height="5" rx="1" fill={t.soft} />
      <rect x="27" y="30" width="5" height="5" rx="1" fill={t.soft} />
    </SvgShell>
  );
}

export function IconOffice({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <rect x="8" y="14" width="32" height="26" rx="2" fill={t.ink} />
      <rect x="14" y="8" width="20" height="8" rx="1.5" fill={t.soft} />
      <rect x="12" y="20" width="8" height="6" rx="1" fill={t.soft} />
      <rect x="28" y="20" width="8" height="6" rx="1" fill={t.soft} />
      <rect x="20" y="30" width="8" height="10" rx="1" fill={t.accent} />
    </SvgShell>
  );
}

export function IconCafe({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <path
        d="M14 16h16a2 2 0 0 1 2 2v10c0 5-4 9-10 9s-10-4-10-9V18a2 2 0 0 1 2-2Z"
        fill={t.ink}
      />
      <path d="M32 20h4a4 4 0 0 1 0 8h-4" stroke={t.soft} strokeWidth="3" />
      <path d="M18 10c1 2 1 3 0 5M24 9c1 2 1 4 0 6" stroke={t.accent} strokeWidth="2" strokeLinecap="round" />
    </SvgShell>
  );
}

export function IconCorp({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <rect x="6" y="18" width="14" height="22" rx="2" fill={t.soft} />
      <rect x="18" y="8" width="16" height="32" rx="2" fill={t.ink} />
      <rect x="32" y="22" width="10" height="18" rx="2" fill={t.mid} />
      <rect x="22" y="14" width="4" height="4" rx="0.8" fill={t.accent} />
      <rect x="28" y="14" width="4" height="4" rx="0.8" fill={t.soft} />
      <rect x="22" y="22" width="4" height="4" rx="0.8" fill={t.soft} />
      <rect x="28" y="22" width="4" height="4" rx="0.8" fill={t.accent} />
    </SvgShell>
  );
}

export type FilterGraphicIcon = (props: IconProps) => ReactElement;

export const PRODUCT_FILTER_ICONS: Record<string, FilterGraphicIcon> =
  PRODUCT_LINE_ICONS;

export function IconHotel({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <rect x="10" y="14" width="28" height="26" rx="2" fill={t.ink} />
      <path d="M10 18h28" stroke={t.soft} strokeWidth="3" />
      <rect x="14" y="22" width="6" height="5" rx="1" fill={t.soft} />
      <rect x="22" y="22" width="6" height="5" rx="1" fill={t.accent} />
      <rect x="30" y="22" width="4" height="5" rx="1" fill={t.soft} />
      <rect x="14" y="30" width="6" height="5" rx="1" fill={t.soft} />
      <rect x="22" y="30" width="6" height="5" rx="1" fill={t.soft} />
      <path d="M18 8h12l4 6H14l4-6Z" fill={t.mid} />
    </SvgShell>
  );
}

export function IconGovernment({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <rect x="8" y="20" width="32" height="18" rx="2" fill={t.ink} />
      <path d="M12 20V14l12-6 12 6v6" fill={t.soft} />
      <rect x="16" y="24" width="5" height="8" rx="1" fill={t.soft} />
      <rect x="22" y="24" width="4" height="14" rx="1" fill={t.accent} />
      <rect x="27" y="24" width="5" height="8" rx="1" fill={t.soft} />
    </SvgShell>
  );
}

export function IconEducation({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <path d="M8 20 24 12l16 8-16 8-16-8Z" fill={t.ink} />
      <path d="M14 23v8c4 3 12 3 16 0v-8" fill={t.soft} />
      <rect x="36" y="20" width="3" height="14" rx="1" fill={t.accent} />
    </SvgShell>
  );
}

export function IconHospital({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <rect x="10" y="10" width="28" height="28" rx="4" fill={t.soft} />
      <rect x="21" y="14" width="6" height="20" rx="1.5" fill={t.ink} />
      <rect x="14" y="21" width="20" height="6" rx="1.5" fill={t.accent} />
    </SvgShell>
  );
}

export function IconPharmacy({ className, active }: IconProps) {
  const t = tones(active);
  return (
    <SvgShell className={className}>
      <rect x="12" y="16" width="24" height="22" rx="3" fill={t.soft} />
      <path d="M16 16V12a8 8 0 0 1 16 0v4" fill={t.ink} />
      <rect x="21" y="22" width="6" height="12" rx="1.5" fill={t.ink} />
      <rect x="16" y="25" width="16" height="6" rx="1.5" fill={t.accent} />
    </SvgShell>
  );
}

export const SPACE_FILTER_ICONS: Record<SpaceType, FilterGraphicIcon> = {
  "restaurant-cafe": IconCafe,
  "home-condo": IconHome,
  "hotel-resort": IconHotel,
  "office-corp": IconOffice,
  government: IconGovernment,
  education: IconEducation,
  hospital: IconHospital,
  pharmacy: IconPharmacy,
};

export function productFilterIcon(slug: string): FilterGraphicIcon {
  return PRODUCT_FILTER_ICONS[slug] ?? IconAll;
}

export function spaceFilterIcon(space: SpaceType): FilterGraphicIcon {
  return SPACE_FILTER_ICONS[space] ?? IconHome;
}
