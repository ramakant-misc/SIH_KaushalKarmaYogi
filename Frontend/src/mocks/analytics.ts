import {
  OrgAnalyticsSchema,
  type CompetencyDomain,
  type OrgAnalytics,
  type WorkforceMember,
} from "@/schemas";
import { COMPETENCIES } from "./competencies";
import { PROGRAMMES } from "./courses";
import { buildCompetencyProfile, buildSkillGaps } from "./profiles";
import { courseIdsForCompetency } from "./courses";
import { daysFromNow, hash, intBetween, roundTo, rng, validated } from "./seed";
import { ALL_OFFICIALS, DEPARTMENTS } from "./users";

const DOMAINS: CompetencyDomain[] = ["statistical", "technical", "digital_governance", "behavioural"];

/**
 * Workforce rows. Derived from the SAME profile generator the employee views use,
 * so an administrator drilling into an official sees numbers that agree with what
 * that official sees on their own dashboard.
 */
export const WORKFORCE_MEMBERS: WorkforceMember[] = ALL_OFFICIALS.map((o) => {
  const profile = buildCompetencyProfile(o.userId);
  const gaps = buildSkillGaps(o.userId, courseIdsForCompetency);
  const r = rng(hash(`wf-${o.userId}`));

  return {
    userId: o.userId,
    fullName: o.fullName,
    designation: o.designation,
    department: o.department,
    office: o.office,
    overallScore: profile.overallScore,
    criticalGaps: gaps.filter((g) => g.severity === "critical").length,
    learningHours90d: roundTo(r() * 48, 1),
    lastTrainingAt: r() > 0.25 ? daysFromNow(-intBetween(10, 500, r())) : null,
    lastActiveAt: r() > 0.15 ? daysFromNow(-intBetween(0, 40, r())) : null,
  };
});

export function buildOrgAnalytics(): OrgAnalytics {
  const r = rng(hash("org-analytics"));
  const total = WORKFORCE_MEMBERS.length;

  const averageCompetencyScore = roundTo(
    WORKFORCE_MEMBERS.reduce((s, m) => s + m.overallScore, 0) / total,
    1,
  );

  // Heatmap: every department x every domain, always present (zeros beat gaps).
  const heatmap = DEPARTMENTS.flatMap((department) => {
    const members = WORKFORCE_MEMBERS.filter((m) => m.department === department);
    return DOMAINS.map((domain) => {
      const profiles = members.slice(0, 12).map((m) => buildCompetencyProfile(m.userId));
      const scores = profiles.map(
        (p) => p.domainScores.find((d) => d.domain === domain) ?? { averageCurrentLevel: 0, averageRequiredLevel: 0 },
      );
      const n = Math.max(scores.length, 1);
      return {
        department,
        domain,
        averageLevel: roundTo(scores.reduce((s, x) => s + x.averageCurrentLevel, 0) / n, 2),
        averageRequiredLevel: roundTo(scores.reduce((s, x) => s + x.averageRequiredLevel, 0) / n, 2),
        officialCount: members.length,
      };
    });
  });

  // Gap distribution across the workforce, per competency.
  const sample = WORKFORCE_MEMBERS.slice(0, 60);
  const sampleGaps = sample.flatMap((m) => buildSkillGaps(m.userId, courseIdsForCompetency));
  const gapDistribution = COMPETENCIES.map((comp) => {
    const forComp = sampleGaps.filter((g) => g.competencyKey === comp.key);
    const affectedRatio = forComp.length / Math.max(sample.length, 1);
    const avgGap = forComp.length
      ? forComp.reduce((s, g) => s + g.gap, 0) / forComp.length
      : 0;
    return {
      competencyKey: comp.key,
      competencyName: comp.name,
      domain: comp.domain,
      severity:
        avgGap >= 2.4 ? ("critical" as const)
          : avgGap >= 1.7 ? ("high" as const)
          : avgGap >= 1 ? ("moderate" as const)
          : ("low" as const),
      affectedOfficials: Math.round(affectedRatio * total),
      averageGap: roundTo(avgGap, 2),
    };
  }).sort((a, b) => b.averageGap - a.averageGap);

  const effectiveness = PROGRAMMES.filter((p) => p.status === "completed" || p.status === "running" || p.status === "closed").map((p) => {
    const pr = rng(hash(`eff-${p.id}`));
    const pre = roundTo(38 + pr() * 18, 1);
    const post = roundTo(pre + 14 + pr() * 20, 1);
    return {
      programmeId: p.id,
      programmeTitle: p.title,
      participants: p.seatsFilled,
      completionRate: roundTo(70 + pr() * 28, 1),
      preAverageScore: pre,
      postAverageScore: post,
      competencyPointsGained: roundTo((post - pre) / 12, 2),
      satisfactionScore: roundTo(3.5 + pr() * 1.4, 1),
      costPerCompetencyPoint: Math.round(2000 + pr() * 6000),
    };
  });

  const recommended = 4200;
  const viewed = Math.round(recommended * 0.62);
  const enrolled = Math.round(viewed * 0.54);
  const started = Math.round(enrolled * 0.82);
  const completed = Math.round(started * 0.61);
  const certified = Math.round(completed * 0.88);

  const forecasts = COMPETENCIES.filter((c) =>
    ["ai_ml", "cloud_computing", "big_data", "data_privacy", "gis", "python", "cybersecurity", "data_visualization"].includes(c.key),
  ).map((comp) => {
    const fr = rng(hash(`fc-${comp.key}`));
    const supply = intBetween(20, 110, fr());
    const demand = supply + intBetween(15, 140, fr());
    return {
      competencyKey: comp.key,
      competencyName: comp.name,
      domain: comp.domain,
      horizonMonths: 12,
      currentSupply: supply,
      projectedDemand: demand,
      projectedShortfall: demand - supply,
      confidence: roundTo(0.55 + fr() * 0.35, 2),
      trend: (fr() > 0.25 ? "rising" : "stable") as "rising" | "stable" | "declining",
    };
  }).sort((a, b) => b.projectedShortfall - a.projectedShortfall);

  return validated(
    OrgAnalyticsSchema,
    {
      kpi: {
        totalOfficials: total,
        activeLearners30d: Math.round(total * (0.42 + r() * 0.2)),
        averageCompetencyScore,
        gapIndex: roundTo(100 - averageCompetencyScore, 1),
        completionRate: roundTo(58 + r() * 22, 1),
        learningHoursDelivered: Math.round(WORKFORCE_MEMBERS.reduce((s, m) => s + m.learningHours90d, 0)),
        certificatesIssued: Math.round(total * 1.6),
        deltas: {
          averageCompetencyScore: roundTo(1.2 + r() * 3, 1),
          completionRate: roundTo(-1 + r() * 6, 1),
          activeLearners30d: roundTo(2 + r() * 9, 1),
          gapIndex: roundTo(-(1 + r() * 3), 1),
        },
      },
      heatmap,
      gapDistribution,
      effectiveness,
      funnel: { recommended, viewed, enrolled, started, completed, certified },
      forecasts,
      emergingSkills: [
        { competencyKey: "ai_ml", competencyName: "AI / Machine Learning", growthPercent: 78, source: "iGOT enrolment trend, last 2 quarters" },
        { competencyKey: "big_data", competencyName: "Big Data Analytics", growthPercent: 54, source: "Departmental capacity-building requests" },
        { competencyKey: "data_privacy", competencyName: "Data Privacy", growthPercent: 47, source: "DPDP Act compliance timeline" },
        { competencyKey: "gis", competencyName: "GIS", growthPercent: 33, source: "Survey modernisation roadmap" },
        { competencyKey: "cloud_computing", competencyName: "Cloud Computing", growthPercent: 29, source: "Platform migration plan" },
      ],
      computedAt: daysFromNow(0),
    },
    "OrgAnalytics",
  );
}
