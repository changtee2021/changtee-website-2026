import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
  active?: boolean;
};

/** Material Symbols (Google) — Apache 2.0 */
function MsIcon({
  className,
  active,
  d,
}: IconProps & { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={active ? "#c8102e" : "#0b1f3a"}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

/** ทั้งหมด — grid-view-outline */
export function IconAll({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M3 11V3h8v8H3Zm10 0V3h8v8h-8ZM3 21v-8h8v8H3Zm10 0v-8h8v8h-8ZM5 9h4V5H5v4Zm10 0h4V5h-4v4ZM5 19h4v-4H5v4Zm10 0h4v-4h-4v4Z"
    />
  );
}

/** ผ้าม่าน — curtains-outline */
export function IconCurtain({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M2 21v-2h2V3h16v16h2v2H2Zm4-2h3.95q-.2-1.75-1.15-3.538T6 13.15V19ZM6 5v5.85q1.85-.525 2.8-2.312T9.95 5H6Zm2.225 7q1.7 1.125 2.625 3.075T11.95 19h.1q.175-1.975 1.1-3.925T15.775 12q-1.7-1.125-2.625-3.075T12.05 5h-.1q-.175 1.975-1.1 3.925T8.225 12ZM18 5h-3.95q.2 1.75 1.15 3.538T18 10.85V5Zm0 14v-5.85q-1.85.525-2.788 2.313T14.075 19H18Z"
    />
  );
}

/** ม่านม้วน — roller-shades-outline */
export function IconRoller({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M2 21v-2h2V3h16v16h2v2H2Zm4-10h12V5H6v6Zm0 8h12v-6h-5v1.8q.35.25.55.625t.2.825q0 .725-.513 1.238T12 18q-.725 0-1.238-.513t-.512-1.237q0-.45.2-.813t.55-.612V13H6v6Z"
    />
  );
}

/** มู่ลี่ — blinds-closed */
export function IconVenetian({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M15 22.75q-.725 0-1.238-.513T13.25 21H2v-2h2V3h16v16h2v2h-5.25q0 .725-.513 1.238T15 22.75ZM6 7h8V5H6v2Zm10 0h2V5h-2v2ZM6 11h8V9H6v2Zm10 0h2V9h-2v2ZM6 15h8v-2H6v2Zm10 0h2v-2h-2v2ZM6 19h8v-2H6v2Zm10 0h2v-2h-2v2Z"
    />
  );
}

/** ม่านปรับแสง — vertical-shades-outline */
export function IconVertical({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M2 21v-2h2V3h16v16h2v2H2Zm4-2h2V5H6v14Zm4 0h4V5h-4v14Zm6 0h2V5h-2v14Z"
    />
  );
}

/** ฉากกั้นห้อง — door-sliding-outline */
export function IconPartition({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M9 13q-.425 0-.713-.288T8 12q0-.425.288-.713T9 11q.425 0 .713.288T10 12q0 .425-.288.713T9 13Zm6 0q-.425 0-.713-.288T14 12q0-.425.288-.713T15 11q.425 0 .713.288T16 12q0 .425-.288.713T15 13ZM3 21v-2h1V5q0-.825.588-1.413T6 3h12q.825 0 1.413.588T20 5v14h1v2H3Zm3-2h5V5H6v14Zm7 0h5V5h-5v14Z"
    />
  );
}

/** ม่านภายนอก — deck-outline */
export function IconOutdoor({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M11 22V9H2l10-7l10 7h-9v13h-2Zm1-15h3.65h-7.3H12ZM3 22v-5.25l-.8-4.4L4.15 12l.75 4H9v6H7v-4H5v4H3Zm12 0v-6h4.1l.75-4l1.95.35l-.8 4.4V22h-2v-4h-2v4h-2ZM8.35 7h7.3L12 4.45L8.35 7Z"
    />
  );
}

/** ม่านไฟฟ้า — roller-shades-closed-outline */
export function IconMotorized({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M2 21v-2h2V3h16v16h2v2h-8.25q0 .725-.513 1.238T12 22.75q-.725 0-1.238-.513T10.25 21H2Zm4-6h12V5H6v10Zm0 4h5v-2H6v2Zm7 0h5v-2h-5v2Z"
    />
  );
}

/** พิมพ์ผ้า — print-outline */
export function IconPrint({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M16 8V5H8v3H6V3h12v5h-2ZM4 10h16H4Zm14 2.5q.425 0 .713-.288T19 11.5q0-.425-.288-.713T18 10.5q-.425 0-.713.288T17 11.5q0 .425.288.713T18 12.5ZM16 19v-4H8v4h8Zm2 2H6v-4H2v-6q0-1.275.875-2.138T5 8h14q1.275 0 2.138.863T22 11v6h-4v4Zm2-6v-4q0-.425-.288-.713T19 10H5q-.425 0-.713.288T4 11v4h2v-2h12v2h2Z"
    />
  );
}

/** วอลเปเปอร์ / ฟิล์ม — wallpaper */
export function IconSurface({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M5 21q-.825 0-1.413-.588T3 19v-6h2v6h6v2H5Zm8 0v-2h6v-6h2v6q0 .825-.588 1.413T19 21h-6Zm-7-4l3-4l2.25 3l3-4L18 17H6Zm-3-6V5q0-.825.588-1.413T5 3h6v2H5v6H3Zm16 0V5h-6V3h6q.825 0 1.413.588T21 5v6h-2Zm-3.5-1q-.65 0-1.075-.425T14 8.5q0-.65.425-1.075T15.5 7q.65 0 1.075.425T17 8.5q0 .65-.425 1.075T15.5 10Z"
    />
  );
}

/** บริการ — build */
export function IconService({ className, active }: IconProps) {
  return (
    <MsIcon
      className={className}
      active={active}
      d="M22.61 18.99l-9.08-9.08c.93-2.34.45-5.1-1.44-7C9.79.61 6.21.4 3.66 2.26L7.5 6.11 6.08 7.52 2.25 3.69C.39 6.23.6 9.82 2.9 12.11c1.86 1.86 4.57 2.35 6.89 1.48l9.11 9.11c.39.39 1.02.39 1.41 0l2.3-2.3c.4-.38.4-1.01 0-1.41z"
    />
  );
}

export type ProductLineIcon = (props: IconProps) => ReactElement;

export const PRODUCT_LINE_ICONS: Record<string, ProductLineIcon> = {
  curtain: IconCurtain,
  "roller-blinds": IconRoller,
  "venetian-blinds": IconVenetian,
  "vertical-blinds": IconVertical,
  "pvc-partition": IconPartition,
  "outdoor-factory": IconOutdoor,
  motorized: IconMotorized,
  "print-fabric": IconPrint,
  surface: IconSurface,
  service: IconService,
};

export function productLineIcon(slug: string): ProductLineIcon {
  return PRODUCT_LINE_ICONS[slug] ?? IconCurtain;
}
