import { cn } from "@/lib/utils";
import type { UploadPrepStatus } from "@/lib/cms/admin-upload";

export function UploadPrepBar({
  status,
  className,
}: {
  status: UploadPrepStatus;
  className?: string;
}) {
  return (
    <div
      className={cn("space-y-1.5", className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="font-medium text-navy">{status.label}</p>
        <p className="shrink-0 tabular-nums text-muted">{status.percent}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line/70">
        <div
          className="h-full rounded-full bg-navy transition-[width] duration-200 ease-out"
          style={{ width: `${Math.max(4, Math.min(100, status.percent))}%` }}
        />
      </div>
    </div>
  );
}
