import { Skeleton } from "@/components/ui/skeleton";
import { WanderingEyes } from "@/components/wandering-eyes";
import { cn } from "@/lib/utils";

export function PageSkeleton({
  variant = "default",
  label = "กำลังโหลด…",
  className,
}: {
  variant?: "default" | "portfolio" | "blog";
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("bg-shell pb-16", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>

      {/* Header band */}
      <section className="border-b border-line/70 bg-panel">
        <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-4 h-9 w-64 sm:w-80" />
          <Skeleton className="mt-3 h-4 w-full max-w-md" />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 pt-8">
        <div className="mb-6 flex items-center gap-3">
          <WanderingEyes
            className="size-10 text-navy"
            style={{ ["--duration" as string]: "8s" }}
          />
          <p className="text-sm text-muted">{label}</p>
        </div>

        {variant === "portfolio" ? <PortfolioSkeletonGrid /> : null}
        {variant === "blog" ? <BlogSkeletonGrid /> : null}
        {variant === "default" ? <DefaultSkeletonGrid /> : null}
      </div>
    </div>
  );
}

function PortfolioSkeletonGrid() {
  return (
    <>
      <div className="rounded-2xl bg-panel p-4 shadow-sm ring-1 ring-line sm:p-5">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-36 rounded-full" />
          <Skeleton className="h-10 min-w-[12rem] flex-1 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
        <div className="no-scrollbar mt-5 flex gap-3 overflow-hidden border-t border-line pt-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="flex w-[4.85rem] shrink-0 flex-col items-center gap-2"
            >
              <Skeleton className="size-[3.6rem] rounded-2xl" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-2 w-6" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="mt-6 h-4 w-40" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <WorkCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

function BlogSkeletonGrid() {
  return (
    <>
      <Skeleton className="h-3 w-28" />
      <div className="mt-3 grid gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="overflow-hidden rounded-2xl bg-panel ring-1 ring-line lg:col-span-5">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-4">
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl bg-panel p-3 ring-1 ring-line"
            >
              <Skeleton className="h-24 w-28 shrink-0 rounded-lg sm:h-28 sm:w-32" />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-panel p-5 ring-1 ring-line lg:col-span-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-40" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-7 w-7 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

function DefaultSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function WorkCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-panel shadow-sm ring-1 ring-line">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/5" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-panel shadow-sm ring-1 ring-line">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-2 p-4 sm:p-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
