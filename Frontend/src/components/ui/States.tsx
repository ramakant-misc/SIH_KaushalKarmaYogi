import { cn } from "@/lib/cn";
import { Button } from "./Button";

/** Loading placeholder. Match the shape of what is loading, not a generic spinner. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-muted", className)} aria-hidden />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border-default bg-surface p-5", className)}>
      <Skeleton className="h-4 w-1/3" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

/** Every list view needs one of these — a blank screen is never acceptable. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center", className)}>
      {icon && <div className="mb-3 text-foreground-subtle">{icon}</div>}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-foreground-subtle">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this content. This is usually temporary.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center justify-center rounded-xl border border-danger-100 bg-danger-50 px-6 py-10 text-center dark:border-danger-700/40 dark:bg-danger-700/10", className)}
    >
      <h3 className="text-sm font-semibold text-danger-700 dark:text-danger-500">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-danger-600 dark:text-danger-500/80">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cn("inline-block", className)}>
      <span className="block size-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </span>
  );
}
