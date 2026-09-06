import { z } from "zod";
import { IdSchema, IsoDateTimeSchema } from "./common";
import { CompetencyDomainSchema, GapSeveritySchema } from "./enums";

/** Headline tiles on the administrator dashboard. */
export const OrgKpiSchema = z.object({
  totalOfficials: z.number().int().nonnegative(),
  activeLearners30d: z.number().int().nonnegative(),
  averageCompetencyScore: z.number().min(0).max(100),
  /** 0-100; higher means a larger unmet requirement across the workforce. */
  gapIndex: z.number().min(0).max(100),
  completionRate: z.number().min(0).max(100),
  learningHoursDelivered: z.number().nonnegative(),
  certificatesIssued: z.number().int().nonnegative(),
  /** Change vs the previous comparable period, in percentage points. */
  deltas: z.record(z.string(), z.number()),
});
export type OrgKpi = z.infer<typeof OrgKpiSchema>;

/** One cell of the department x domain heatmap. */
export const CompetencyHeatmapCellSchema = z.object({
  department: z.string(),
  domain: CompetencyDomainSchema,
  averageLevel: z.number().min(0).max(5),
  averageRequiredLevel: z.number().min(0).max(5),
  officialCount: z.number().int().nonnegative(),
});

export const GapDistributionBucketSchema = z.object({
  competencyKey: z.string(),
  competencyName: z.string(),
  domain: CompetencyDomainSchema,
  severity: GapSeveritySchema,
  affectedOfficials: z.number().int().nonnegative(),
  averageGap: z.number().min(0).max(5),
});

/** Did training actually move competency? Pre/post delta per programme. */
export const TrainingEffectivenessSchema = z.object({
  programmeId: IdSchema,
  programmeTitle: z.string(),
  participants: z.number().int().nonnegative(),
  completionRate: z.number().min(0).max(100),
  preAverageScore: z.number().min(0).max(100),
  postAverageScore: z.number().min(0).max(100),
  competencyPointsGained: z.number(),
  satisfactionScore: z.number().min(0).max(5).nullable(),
  costPerCompetencyPoint: z.number().nonnegative().nullable(),
});

/** Forecast of demand for a competency, used for capacity planning. */
export const SkillForecastSchema = z.object({
  competencyKey: z.string(),
  competencyName: z.string(),
  domain: CompetencyDomainSchema,
  horizonMonths: z.number().int().positive(),
  currentSupply: z.number().int().nonnegative().describe("Officials at or above required level"),
  projectedDemand: z.number().int().nonnegative(),
  projectedShortfall: z.number().int(),
  /** 0-1 model confidence; render as a band, never as a hard number alone. */
  confidence: z.number().min(0).max(1),
  trend: z.enum(["rising", "stable", "declining"]),
});
export type SkillForecast = z.infer<typeof SkillForecastSchema>;

export const EnrolmentFunnelSchema = z.object({
  recommended: z.number().int().nonnegative(),
  viewed: z.number().int().nonnegative(),
  enrolled: z.number().int().nonnegative(),
  started: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  certified: z.number().int().nonnegative(),
});

/** Everything GET /api/v1/analytics/overview returns in one payload. */
export const OrgAnalyticsSchema = z.object({
  kpi: OrgKpiSchema,
  heatmap: z.array(CompetencyHeatmapCellSchema),
  gapDistribution: z.array(GapDistributionBucketSchema),
  effectiveness: z.array(TrainingEffectivenessSchema),
  funnel: EnrolmentFunnelSchema,
  forecasts: z.array(SkillForecastSchema),
  emergingSkills: z.array(
    z.object({
      competencyKey: z.string(),
      competencyName: z.string(),
      /** Growth in demand signal over the window, percent. */
      growthPercent: z.number(),
      source: z.string().describe("What surfaced it, e.g. 'iGOT enrolment trend'"),
    }),
  ),
  computedAt: IsoDateTimeSchema,
});
export type OrgAnalytics = z.infer<typeof OrgAnalyticsSchema>;

/** Filters for every analytics endpoint. */
export const AnalyticsQuerySchema = z.object({
  from: z.string().optional().describe("ISO date, inclusive"),
  to: z.string().optional().describe("ISO date, inclusive"),
  department: z.array(z.string()).optional(),
  domain: z.array(CompetencyDomainSchema).optional(),
  horizonMonths: z.number().int().positive().optional(),
});
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

/** A row in the administrator's workforce directory. */
export const WorkforceMemberSchema = z.object({
  userId: IdSchema,
  fullName: z.string(),
  designation: z.string(),
  department: z.string(),
  office: z.string(),
  overallScore: z.number().min(0).max(100),
  criticalGaps: z.number().int().nonnegative(),
  learningHours90d: z.number().nonnegative(),
  lastTrainingAt: IsoDateTimeSchema.nullable(),
  lastActiveAt: IsoDateTimeSchema.nullable(),
});
export type WorkforceMember = z.infer<typeof WorkforceMemberSchema>;
