import { USE_MOCKS } from "./config";
import { request } from "./http";
import { mock, paginate } from "./mock";
import {
  WORKFORCE_MEMBERS, buildCompetencyProfile, buildOrgAnalytics, buildSkillGaps,
  courseIdsForCompetency,
} from "@/mocks";
import type {
  AnalyticsQuery, CompetencyProfile, OrgAnalytics, Paginated, SkillForecast, SkillGap,
  WorkforceMember,
} from "@/schemas";

// @replace_with_real_API "GET /api/v1/analytics/overview"
export async function getOrgAnalytics(
  query: AnalyticsQuery = {},
  token?: string | null,
): Promise<OrgAnalytics> {
  if (USE_MOCKS) {
    const analytics = buildOrgAnalytics();
    if (!query.department?.length && !query.domain?.length) return mock(analytics, 420);
    return mock(
      {
        ...analytics,
        heatmap: analytics.heatmap.filter(
          (c) =>
            (!query.department?.length || query.department.includes(c.department)) &&
            (!query.domain?.length || query.domain.includes(c.domain)),
        ),
        gapDistribution: analytics.gapDistribution.filter(
          (g) => !query.domain?.length || query.domain.includes(g.domain),
        ),
      },
      420,
    );
  }
  return request<OrgAnalytics>("/api/v1/analytics/overview", { query: query as Record<string, unknown>, token });
}

// @replace_with_real_API "GET /api/v1/analytics/forecast"
export async function getForecast(
  query: { horizonMonths?: number; department?: string[] } = {},
  token?: string | null,
): Promise<SkillForecast[]> {
  if (USE_MOCKS) {
    const horizon = query.horizonMonths ?? 12;
    return mock(
      buildOrgAnalytics().forecasts.map((f) => ({
        ...f,
        horizonMonths: horizon,
        // A shorter horizon means less projected growth and more confidence.
        projectedDemand: Math.round(f.currentSupply + (f.projectedDemand - f.currentSupply) * (horizon / 12)),
        projectedShortfall: Math.round(f.projectedShortfall * (horizon / 12)),
        confidence: Math.min(0.95, f.confidence + (12 - horizon) * 0.02),
      })),
    );
  }
  return request<SkillForecast[]>("/api/v1/analytics/forecast", { query, token });
}

// @replace_with_real_API "GET /api/v1/workforce"
export async function listWorkforce(
  query: {
    q?: string; department?: string[]; designation?: string[];
    minScore?: number; maxScore?: number; sort?: string; cursor?: string; limit?: number;
  } = {},
  token?: string | null,
): Promise<Paginated<WorkforceMember>> {
  if (USE_MOCKS) {
    let items = [...WORKFORCE_MEMBERS];
    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.designation.toLowerCase().includes(q) ||
          m.department.toLowerCase().includes(q) ||
          m.office.toLowerCase().includes(q),
      );
    }
    if (query.department?.length) items = items.filter((m) => query.department!.includes(m.department));
    if (query.designation?.length) items = items.filter((m) => query.designation!.includes(m.designation));
    if (query.minScore !== undefined) items = items.filter((m) => m.overallScore >= query.minScore!);
    if (query.maxScore !== undefined) items = items.filter((m) => m.overallScore <= query.maxScore!);

    switch (query.sort) {
      case "score_asc": items.sort((a, b) => a.overallScore - b.overallScore); break;
      case "score_desc": items.sort((a, b) => b.overallScore - a.overallScore); break;
      case "gaps": items.sort((a, b) => b.criticalGaps - a.criticalGaps); break;
      default: items.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
    return mock(paginate(items, query.cursor, query.limit ?? 25));
  }
  return request<Paginated<WorkforceMember>>("/api/v1/workforce", { query, token });
}

// @replace_with_real_API "GET /api/v1/workforce/:userId"
export async function getWorkforceMember(
  userId: string,
  token?: string | null,
): Promise<{ member: WorkforceMember; profile: CompetencyProfile; gaps: SkillGap[] }> {
  if (USE_MOCKS) {
    const member = WORKFORCE_MEMBERS.find((m) => m.userId === userId);
    if (!member) throw new Error(`Official not found: ${userId}`);
    return mock({
      member,
      profile: buildCompetencyProfile(userId),
      gaps: buildSkillGaps(userId, courseIdsForCompetency).slice(0, 10),
    });
  }
  return request(`/api/v1/workforce/${userId}`, { token });
}

// @replace_with_real_API "GET /api/v1/reports/export"
export async function exportReport(
  query: { format: "csv" | "pdf" } & AnalyticsQuery,
  token?: string | null,
): Promise<Blob> {
  if (USE_MOCKS) {
    const analytics = buildOrgAnalytics();
    const rows = [
      "competency,domain,severity,affected_officials,average_gap",
      ...analytics.gapDistribution.map(
        (g) => `"${g.competencyName}",${g.domain},${g.severity},${g.affectedOfficials},${g.averageGap}`,
      ),
    ].join("\n");
    return mock(new Blob([rows], { type: "text/csv" }), 500);
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/reports/export?${new URLSearchParams(
      Object.entries(query).flatMap(([k, v]) =>
        Array.isArray(v) ? v.map((x) => [k, String(x)]) : v === undefined ? [] : [[k, String(v)]],
      ) as [string, string][],
    )}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
  );
  if (!response.ok) throw new Error("Export failed");
  return response.blob();
}
