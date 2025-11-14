import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        "h-4 w-full", // Default dimensions to prevent layout jumps
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
