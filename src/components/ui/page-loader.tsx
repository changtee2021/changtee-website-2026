import { PageSkeleton } from "@/components/ui/page-skeleton";
import { cn } from "@/lib/utils";

/** @deprecated Prefer PageSkeleton — kept as a thin alias */
export function PageLoader({
  label = "กำลังโหลด…",
  className,
}: {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <PageSkeleton
      label={label}
      className={cn("min-h-[40vh]", className)}
    />
  );
}
