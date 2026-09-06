import Link from "next/link";
import { Clock, TrendingDown, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Table, TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { BarChart, ColoredBarChart } from "@/components/charts/Charts";
import { Heatmap } from "@/components/charts/Heatmap";
import { SEVERITY_COLORS } from "@/components/charts/palette";
import { SeverityBadge, StatTile } from "@/components/domain";
import { PageHeader } from "@/components/layout/PageHeader";
import { analyticsApi } from "@/lib/api";
import { DOMAIN_LABELS, type CompetencyDomain } from "@/schemas";

export const metadata = { title: "Administrator dashboard" };

const DOMAIN_COLUMNS = (["statistical", "technical", "digital_governance", "behavioural"] as CompetencyDomain[]).map(
  (domain) => ({ key: domain, label: DOMAIN_LABELS[domain].split(" ")[0]! }),
);

export default async function AdminDashboard() {
  const analytics = await analyticsApi.getOrgAnalytics();
  const { kpi, funnel } = analytics;

  const departments = [...new Set(analytics.heatmap.map((c) => c.department))];
  const topGaps = analytics.gapDistribution.slice(0, 8);

  return (
    <>
      <PageHeader
        title="Workforce competency overview"
        description="Competency distribution, training effectiveness and forecast skill demand across the statistical system."
        action={<ButtonLink href="/admin/reports" variant="secondary">Export report</ButtonLink>}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Officials" value={kpi.totalOfficials} icon={<Users className="size-4" />}
          delta={kpi.deltas.activeLearners30d} deltaLabel="% active learners"
          hint={`${kpi.activeLearners30d} active in 30 days`}
        />
        <StatTile
          label="Average competency" value={kpi.averageCompetencyScore} unit="/100"
          delta={kpi.deltas.averageCompetencyScore} deltaLabel="pts"
        />
        <StatTile
          label="Gap index" value={kpi.gapIndex} unit="/100"
          delta={kpi.deltas.gapIndex} deltaLabel="pts" icon={<TrendingDown className="size-4" />}
          hint="Lower is better"
        />
        <StatTile
          label="Learning hours delivered" value={kpi.learningHoursDelivered.toLocaleString("en-IN")}
          icon={<Clock className="size-4" />} hint={`${kpi.certificatesIssued} certificates issued`}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Competency heatmap"
            description="Average assessed level by department and domain, on the 0–5 scale"
          />
          <CardBody>
            <Heatmap
              rows={departments}
              columns={DOMAIN_COLUMNS}
              cells={analytics.heatmap.map((c) => ({
                row: c.department,
                column: c.domain,
                value: c.averageLevel,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Enrolment funnel" description="Recommendation through to certification" />
          <CardBody>
            <BarChart
              data={[
                { stage: "Recommended", count: funnel.recommended },
                { stage: "Viewed", count: funnel.viewed },
                { stage: "Enrolled", count: funnel.enrolled },
                { stage: "Started", count: funnel.started },
                { stage: "Completed", count: funnel.completed },
                { stage: "Certified", count: funnel.certified },
              ]}
              xKey="stage"
              bars={[{ key: "count", name: "Officials" }]}
              layout="vertical"
              height={280}
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Largest workforce gaps"
            description="Competencies where the most officials fall below their role requirement"
            action={<Link href="/admin/analytics" className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-400">Analytics</Link>}
          />
          <CardBody>
            <ColoredBarChart
              height={300}
              data={topGaps.map((gap) => ({
                label: gap.competencyName,
                value: gap.affectedOfficials,
                color: SEVERITY_COLORS[gap.severity],
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Forecast skill demand"
            description="Projected shortfall over the next 12 months"
            action={<Badge tone="info">Predictive</Badge>}
          />
          <CardBody>
            <TableWrap className="border-0">
              <Table caption="Projected competency shortfall" className="min-w-[28rem]">
                <thead>
                  <tr>
                    <Th>Competency</Th>
                    <Th className="text-right">Supply</Th>
                    <Th className="text-right">Demand</Th>
                    <Th className="text-right">Shortfall</Th>
                    <Th>Confidence</Th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.forecasts.slice(0, 6).map((forecast) => (
                    <Tr key={forecast.competencyKey}>
                      <Td className="font-medium">{forecast.competencyName}</Td>
                      <Td className="text-right tabular-nums">{forecast.currentSupply}</Td>
                      <Td className="text-right tabular-nums">{forecast.projectedDemand}</Td>
                      <Td className="text-right font-semibold tabular-nums text-danger-600">
                        +{forecast.projectedShortfall}
                      </Td>
                      <Td>
                        {/* Confidence shown as a band, never as a bare certainty. */}
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-muted">
                            <span
                              className="block h-full rounded-full bg-primary-500"
                              style={{ width: `${forecast.confidence * 100}%` }}
                            />
                          </span>
                          <span className="text-xs tabular-nums text-foreground-subtle">
                            {Math.round(forecast.confidence * 100)}%
                          </span>
                        </span>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Training effectiveness"
            description="Pre- and post-assessment averages by programme"
          />
          <CardBody>
            {/* Grouped bars, not lines: these are unrelated programmes, not a series
                over time, and a line implies a trend between them that does not exist. */}
            <BarChart
              height={300}
              xKey="programme"
              layout="vertical"
              data={analytics.effectiveness.map((e) => ({
                programme: e.programmeTitle.length > 34
                  ? `${e.programmeTitle.slice(0, 32)}…`
                  : e.programmeTitle,
                Before: e.preAverageScore,
                After: e.postAverageScore,
              }))}
              bars={[
                { key: "Before", name: "Before training", color: "#94a3b8" },
                { key: "After", name: "After training", color: "#10b981" },
              ]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Emerging skills" description="Fastest-growing demand signals" />
          <CardBody className="space-y-3">
            {analytics.emergingSkills.map((skill) => (
              <div key={skill.competencyKey} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{skill.competencyName}</p>
                  <p className="mt-0.5 text-xs text-foreground-subtle">{skill.source}</p>
                </div>
                <Badge tone="success">+{skill.growthPercent}%</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader
          title="Competencies needing intervention"
          description="Where a training programme would have the greatest workforce effect"
          action={
            <ButtonLink href="/admin/programmes" size="sm" variant="secondary">
              Plan a programme
            </ButtonLink>
          }
        />
        <CardBody className="p-0">
          <TableWrap className="rounded-none border-0">
            <Table caption="Competencies ranked by workforce gap">
              <thead>
                <tr>
                  <Th>Competency</Th>
                  <Th>Domain</Th>
                  <Th>Severity</Th>
                  <Th className="text-right">Officials affected</Th>
                  <Th className="text-right">Average gap</Th>
                </tr>
              </thead>
              <tbody>
                {topGaps.map((gap) => (
                  <Tr key={gap.competencyKey}>
                    <Td className="font-medium">{gap.competencyName}</Td>
                    <Td className="text-foreground-subtle">{DOMAIN_LABELS[gap.domain]}</Td>
                    <Td><SeverityBadge severity={gap.severity} /></Td>
                    <Td className="text-right tabular-nums">{gap.affectedOfficials}</Td>
                    <Td className="text-right tabular-nums">{gap.averageGap.toFixed(2)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardBody>
      </Card>
    </>
  );
}
