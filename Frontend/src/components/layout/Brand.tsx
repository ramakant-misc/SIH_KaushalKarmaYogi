import Link from "next/link";
import { cn } from "@/lib/cn";

export function Brand({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-600 text-sm font-bold text-white"
        aria-hidden
      >
        KK
      </span>
      {!compact && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">KaushalKarmaYogi</span>
          <span className="truncate text-[11px] text-foreground-subtle">Skill Intelligence Platform</span>
        </span>
      )}
    </Link>
  );
}
