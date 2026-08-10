import { Skeleton } from "@/components/ui/skeleton";
import { WanderingEyes } from "@/components/wandering-eyes";
import { cn } from "@/lib/utils";

/** Compact loader for below-fold / Suspense chunks */
export function SectionLoader({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[12rem] flex-col items-center justify-center gap-4 px-4 py-8",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-lg flex-col gap-3">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="flex items-center gap-3">
          <WanderingEyes
            className="size-10 shrink-0 text-navy"
            style={{ ["--duration" as string]: "8s" }}
          />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            {label ? <p className="text-xs text-muted">{label}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
