import Link from "next/link";
import { ArrowRight, Award, Clock, Flame, Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { GaugeRing } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/States";
import { CompetencyRadar } from "@/components/charts/Charts";
import {
  EnrollmentCard, GapRow, RecommendationCard, StatTile, formatDate,
} from "@/components/domain";
import { PageHeader } from "@/components/layout/PageHeader";
import { competencyApi, learningApi } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { DOMAIN_LABELS } from "@/schemas";

export const metadata = { title: "Dashboard" };

export default async function EmployeeDashboard() {
  const session = await requireSession();

  const [profile, gaps, recommendations, stats, enrollments, paths] = await Promise.all([
    competencyApi.getCompetencyProfile("me"),
    competencyApi.getSkillGaps("me", { limit: 5 }),
    learningApi.listRecommendations({ limit: 3 }),
    learningApi.getLearningStats("me"),
    learningApi.listEnrollments({ status: ["in_progress"], limit: 3 }),
    learningApi.listLearningPaths(),
  ]);

  const radarData = profile.domainScores.map((d) => ({
    label: DOMAIN_LABELS[d.domain].split(" ")[0]!,
    current: d.averageCurrentLevel,
    required: d.averageRequiredLevel,
  }));

  const activePath = paths[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.user.fullName.split(" ")[0]}`}
        description={`${session.user.designation ?? ""}${session.user.designation && session.user.department ? " · " : ""}${session.user.department ?? ""}`}
        action={<ButtonLink href="/competency/gaps">View all gaps</ButtonLink>}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Learning hours this month" value={stats.hoursThisMonth} unit="hrs" icon={<Clock className="size-4" />} />
        <StatTile label="Current streak" value={stats.streakDays} unit="days" icon={<Flame className="size-4" />} />
        <StatTile label="Courses completed" value={stats.coursesCompleted} icon={<Award className="size-4" />} hint={`${stats.coursesInProgress} in progress`} />
        <StatTile label="Competency points gained" value={stats.competencyPointsGained} icon={<Target className="size-4" />} hint="Last 90 days" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Overall competency" description={`Framework v${profile.frameworkVersion}`} />
          <CardBody className="flex flex-col items-center">
            <GaugeRing value={profile.overallScore} size={140} label="Overall competency score" sublabel="of 100" />
            <dl className="mt-6 w-full space-y-2.5">
              {profile.domainScores.map((d) => (
                <div key={d.domain} className="flex items-center justify-between gap-3 text-sm">
                  <dt className="min-w-0 truncate text-foreground-muted">{DOMAIN_LABELS[d.domain]}</dt>
                  <dd className="shrink-0 font-medium tabular-nums text-foreground">
                    {d.averageCurrentLevel.toFixed(1)}
                    <span className="text-foreground-subtle"> / {d.averageRequiredLevel.toFixed(1)}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Current versus required level"
            description="Averaged across each competency domain"
            action={<Link href="/competency" className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-400">Details</Link>}
          />
          <CardBody>
            <CompetencyRadar data={radarData} height={300} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Your top skill gaps"
            description="Ranked by how critical each is to your role"
            action={<Link href="/competency/gaps" className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-400">All gaps</Link>}
          />
          <CardBody className="pt-0">
            {gaps.length === 0 ? (
              <EmptyState title="No gaps identified" description="Your assessed levels meet every requirement for your role." />
            ) : (
              <div>{gaps.map((gap) => <GapRow key={gap.competencyKey} gap={gap} />)}</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Continue learning"
            description="Pick up where you left off"
            action={<Link href="/my-courses" className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-400">My courses</Link>}
          />
          <CardBody>
            {enrollments.items.length === 0 ? (
              <EmptyState
                title="Nothing in progress"
                description="Enrol in a recommended course to get started."
                action={<ButtonLink href="/courses" size="sm">Browse catalogue</ButtonLink>}
              />
            ) : (
              <div className="space-y-4">
                {enrollments.items.map((enrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {activePath && (
        <Card className="mt-5">
          <CardHeader
            title="Your learning pathway"
            description={activePath.rationale}
            action={
              <ButtonLink href={`/learning-paths/${activePath.id}`} variant="secondary" size="sm">
                Open pathway <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            }
          />
          <CardBody>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="text-foreground-muted">
                <strong className="font-semibold text-foreground">{activePath.progressPercent}%</strong> complete
              </span>
              <span className="text-foreground-muted">
                {activePath.milestones.length} milestones
              </span>
              <span className="text-foreground-muted">
                {Math.round(activePath.totalEstimatedMinutes / 60)} hours estimated
              </span>
              {activePath.estimatedCompletionAt && (
                <Badge tone="info">Target: {formatDate(activePath.estimatedCompletionAt)}</Badge>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Recommended for you</h2>
            <p className="text-sm text-foreground-subtle">
              Chosen from your gaps, your role requirements and departmental priorities.
            </p>
          </div>
          <Link href="/courses?sort=match" className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-400">
            More recommendations →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      </section>
    </>
  );
}
