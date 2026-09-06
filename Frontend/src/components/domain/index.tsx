import Link from "next/link";
import { Clock, Star, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LevelMeter, ProgressBar } from "@/components/ui/Progress";
import { DOMAIN_COLORS } from "@/components/charts/palette";
import { cn } from "@/lib/cn";
import {
  DOMAIN_LABELS, LEVEL_LABELS,
  type Course, type CompetencyDomain, type Enrollment, type GapSeverity,
  type LearningPath, type Recommendation, type SkillGap,
} from "@/schemas";

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const SEVERITY_TONE: Record<GapSeverity, "danger" | "warning" | "accent" | "success"> = {
  critical: "danger",
  high: "accent",
  moderate: "warning",
  low: "success",
};

export function DomainBadge({ domain }: { domain: CompetencyDomain }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
      <span className="size-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[domain] }} aria-hidden />
      {DOMAIN_LABELS[domain]}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: GapSeverity }) {
  return <Badge tone={SEVERITY_TONE[severity]}>{severity[0]!.toUpperCase() + severity.slice(1)}</Badge>;
}

/** A KPI tile. `delta` is rendered with direction and colour, never colour alone. */
export function StatTile({
  label, value, unit, delta, deltaLabel, icon, hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  hint?: string;
}) {
  const Trend = delta === undefined ? null : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground-subtle">{label}</p>
        {icon && <span className="text-foreground-subtle">{icon}</span>}
      </div>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums text-foreground">{value}</span>
        {unit && <span className="text-sm text-foreground-subtle">{unit}</span>}
      </p>
      {Trend && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs font-medium",
            delta! > 0 ? "text-success-600" : delta! < 0 ? "text-danger-600" : "text-foreground-subtle",
          )}
        >
          <Trend className="size-3.5" aria-hidden />
          {delta! > 0 ? "+" : ""}
          {delta}
          {deltaLabel ? ` ${deltaLabel}` : ""}
        </p>
      )}
      {hint && <p className="mt-1.5 text-xs text-foreground-subtle">{hint}</p>}
    </Card>
  );
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="group flex h-full flex-col transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Badge tone={course.source === "igot" ? "primary" : course.source === "nssta_tpac" ? "accent" : "neutral"}>
            {course.source === "igot" ? "iGOT Karmayogi" : course.source === "nssta_tpac" ? "NSSTA TPAC" : "Internal"}
          </Badge>
          {course.matchScore !== undefined && (
            <Badge tone="success">{course.matchScore}% match</Badge>
          )}
        </div>

        <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">
          <Link href={`/courses/${course.id}`} className="after:absolute after:inset-0 hover:text-primary-700 dark:hover:text-primary-400">
            {course.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-foreground-subtle">{course.summary}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {course.competencies.slice(0, 3).map((c) => (
            <span key={c.competencyKey} className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-foreground-muted">
              {c.competencyName}
            </span>
          ))}
          {course.competencies.length > 3 && (
            <span className="px-1 py-0.5 text-xs text-foreground-subtle">+{course.competencies.length - 3}</span>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-foreground-subtle">
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{formatDuration(course.durationMinutes)}</span>
          {course.rating !== null && (
            <span className="inline-flex items-center gap-1"><Star className="size-3.5" aria-hidden />{course.rating.toFixed(1)}</span>
          )}
          <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden />{course.enrolledCount.toLocaleString("en-IN")}</span>
          <span className="capitalize">{course.level}</span>
        </div>
      </div>
    </Card>
  );
}

export function GapRow({ gap }: { gap: SkillGap }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border-default py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{gap.competencyName}</span>
          <SeverityBadge severity={gap.severity} />
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <LevelMeter current={gap.currentLevel} required={gap.requiredLevel} />
          <span className="text-xs text-foreground-subtle">
            {LEVEL_LABELS[gap.currentLevel]} → {LEVEL_LABELS[gap.requiredLevel]}
          </span>
        </div>
      </div>
      <div className="text-right text-xs text-foreground-subtle">
        <p className="font-medium text-foreground">{gap.estimatedHoursToClose} hrs</p>
        <p>to close</p>
      </div>
    </div>
  );
}

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const href =
    recommendation.kind === "course" ? `/courses/${recommendation.refId}`
      : recommendation.kind === "programme" ? `/programmes`
      : recommendation.kind === "assessment" ? `/assessments/${recommendation.refId}`
      : `/learning-paths`;

  return (
    <Card className="relative flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <Badge tone="success">{recommendation.matchScore}% match</Badge>
        {recommendation.severity && <SeverityBadge severity={recommendation.severity} />}
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground">
        <Link href={href} className="after:absolute after:inset-0 hover:text-primary-700 dark:hover:text-primary-400">
          {recommendation.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-foreground-subtle">{recommendation.summary}</p>
      {/* The reasons are the product: never show a recommendation without them. */}
      <ul className="mt-3 space-y-1">
        {recommendation.reasons.slice(0, 2).map((reason) => (
          <li key={reason} className="flex gap-2 text-xs text-foreground-muted">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary-500" aria-hidden />
            {reason}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  return (
    <Card className="relative flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <Badge tone={enrollment.status === "completed" ? "success" : enrollment.status === "in_progress" ? "primary" : "neutral"}>
          {enrollment.status.replace("_", " ")}
        </Badge>
        {enrollment.dueAt && <span className="text-xs text-warning-600">Due {formatDate(enrollment.dueAt)}</span>}
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground">
        <Link href={`/my-courses/${enrollment.id}/learn`} className="after:absolute after:inset-0 hover:text-primary-700 dark:hover:text-primary-400">
          {enrollment.title}
        </Link>
      </h3>
      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-foreground-subtle">
          <span>{enrollment.progressPercent}% complete</span>
          <span>{formatDuration(enrollment.minutesSpent)} spent</span>
        </div>
        <ProgressBar
          value={enrollment.progressPercent}
          tone={enrollment.status === "completed" ? "success" : "primary"}
          label={`${enrollment.title} progress`}
        />
      </div>
    </Card>
  );
}

export function PathwayTimeline({ path }: { path: LearningPath }) {
  return (
    <ol className="relative space-y-0">
      {path.milestones.map((milestone, i) => {
        const isLast = i === path.milestones.length - 1;
        const tone =
          milestone.status === "completed" ? "bg-success-500 border-success-500"
            : milestone.status === "in_progress" ? "bg-primary-600 border-primary-600"
            : milestone.status === "available" ? "bg-surface border-primary-500"
            : "bg-surface border-border-strong";

        return (
          <li key={milestone.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && <span className="absolute left-[11px] top-6 h-full w-px bg-border-default" aria-hidden />}
            <span className={cn("relative z-10 mt-1 size-6 shrink-0 rounded-full border-2", tone)} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{milestone.kind}</Badge>
                <Badge
                  tone={
                    milestone.status === "completed" ? "success"
                      : milestone.status === "in_progress" ? "primary"
                      : milestone.status === "locked" ? "neutral"
                      : "info"
                  }
                >
                  {milestone.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="mt-1.5 font-medium text-foreground">{milestone.title}</p>
              <p className="mt-0.5 text-xs text-foreground-subtle">
                {formatDuration(milestone.estimatedMinutes)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
