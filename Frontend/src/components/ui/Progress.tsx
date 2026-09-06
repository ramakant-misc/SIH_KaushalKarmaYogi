import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  className,
  tone = "primary",
  label,
}: {
  value: number;
  className?: string;
  tone?: "primary" | "success" | "warning" | "danger";
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const tones = {
    primary: "bg-primary-600",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  };
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-muted", className)}
    >
      <div className={cn("h-full rounded-full transition-all", tones[tone])} style={{ width: `${clamped}%` }} />
    </div>
  );
}

/** Circular score gauge. Text inside is the accessible value, not decoration. */
export function GaugeRing({
  value,
  size = 120,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  label?: string;
  sublabel?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = size >= 100 ? 10 : 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const tone =
    clamped >= 75 ? "var(--color-success-500)" : clamped >= 50 ? "var(--color-warning-500)" : "var(--color-danger-500)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label ?? "Score"}: ${Math.round(clamped)} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tone} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums text-foreground">{Math.round(clamped)}</span>
        {sublabel && <span className="text-[11px] text-foreground-subtle">{sublabel}</span>}
      </div>
    </div>
  );
}

/** The 0-5 proficiency scale, rendered as five discrete steps. */
export function LevelMeter({
  current,
  required,
  className,
}: {
  current: number;
  required?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={
        required === undefined
          ? `Level ${current} of 5`
          : `Level ${current} of 5, required level ${required}`
      }
    >
      {[1, 2, 3, 4, 5].map((step) => {
        const filled = step <= current;
        const isGap = required !== undefined && step > current && step <= required;
        return (
          <span
            key={step}
            className={cn(
              "h-2 w-5 rounded-sm",
              filled ? "bg-primary-600" : isGap ? "bg-danger-200 dark:bg-danger-700/50" : "bg-surface-muted",
            )}
          />
        );
      })}
    </div>
  );
}
