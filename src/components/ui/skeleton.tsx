import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-line/80 dark:bg-line/50",
        className,
      )}
      {...props}
    />
  );
}
