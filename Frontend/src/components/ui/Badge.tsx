import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "accent" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-muted text-foreground-muted border-border-default",
  primary: "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950 dark:text-primary-300 dark:border-primary-800",
  success: "bg-success-50 text-success-700 border-success-100 dark:bg-success-700/15 dark:text-success-500 dark:border-success-700/40",
  warning: "bg-warning-50 text-warning-700 border-warning-100 dark:bg-warning-700/15 dark:text-warning-500 dark:border-warning-700/40",
  danger: "bg-danger-50 text-danger-700 border-danger-100 dark:bg-danger-700/15 dark:text-danger-500 dark:border-danger-700/40",
  accent: "bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-700/15 dark:text-accent-400 dark:border-accent-700/40",
  info: "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-700/15 dark:text-cyan-400 dark:border-cyan-700/40",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
