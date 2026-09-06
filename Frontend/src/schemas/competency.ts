import { z } from "zod";
import { IdSchema, IsoDateTimeSchema } from "./common";
import {
  CompetencyDomainSchema,
  EvidenceSourceSchema,
  GapSeveritySchema,
  ProficiencyLevelSchema,
} from "./enums";

/** One competency in the Official Statistics framework. */
export const CompetencySchema = z.object({
  key: z.string().describe("Stable slug, e.g. sampling_methods"),
  name: z.string(),
  domain: CompetencyDomainSchema,
  description: z.string(),
  /** Relative importance within its domain, 0-1. Used to rank gaps. */
  weight: z.number().min(0).max(1),
  /** Behavioural descriptors per level, indexed 0-5. Shown in the level tooltip. */
  levelDescriptors: z.array(z.string()).length(6),
});
export type Competency = z.infer<typeof CompetencySchema>;

/** A versioned framework. Admins/engineers can publish new versions. */
export const CompetencyFrameworkSchema = z.object({
  id: IdSchema,
  version: z.string().describe("Semver-ish, e.g. 2026.1"),
  name: z.string(),
  owner: z.string().describe("e.g. NSSTA"),
  isActive: z.boolean(),
  competencies: z.array(CompetencySchema),
  publishedAt: IsoDateTimeSchema,
});
export type CompetencyFramework = z.infer<typeof CompetencyFrameworkSchema>;

/** The FRAC target: what a given role must reach for each competency. */
export const RoleCompetencyRequirementSchema = z.object({
  roleKey: z.string(),
  roleName: z.string(),
  competencyKey: z.string(),
  requiredLevel: ProficiencyLevelSchema,
  /** How essential this competency is to the role. Multiplies gap ranking. */
  criticality: z.number().min(0).max(1),
});
export type RoleCompetencyRequirement = z.infer<typeof RoleCompetencyRequirementSchema>;

export const EvidenceSchema = z.object({
  source: EvidenceSourceSchema,
  label: z.string().describe("Human-readable, e.g. 'Scored 82% on Sampling assessment'"),
  contributedAt: IsoDateTimeSchema,
  /** 0-1. How much this evidence moved the assessed level. */
  weight: z.number().min(0).max(1),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

/** The assessed current level for one competency, with its justification. */
export const CompetencyAssessmentRecordSchema = z.object({
  competencyKey: z.string(),
  competencyName: z.string(),
  domain: CompetencyDomainSchema,
  currentLevel: ProficiencyLevelSchema,
  requiredLevel: ProficiencyLevelSchema,
  /** 0-1. How sure the engine is. Low confidence should prompt an assessment. */
  confidence: z.number().min(0).max(1),
  evidence: z.array(EvidenceSchema),
  lastAssessedAt: IsoDateTimeSchema.nullable(),
  /** Level history for the sparkline: oldest first. */
  history: z.array(z.object({ at: IsoDateTimeSchema, level: ProficiencyLevelSchema })),
});
export type CompetencyAssessmentRecord = z.infer<typeof CompetencyAssessmentRecordSchema>;

/** Everything the employee dashboard and /competency need in one payload. */
export const CompetencyProfileSchema = z.object({
  userId: IdSchema,
  frameworkVersion: z.string(),
  /** 0-100 rollup used for the headline gauge. */
  overallScore: z.number().min(0).max(100),
  domainScores: z.array(
    z.object({
      domain: CompetencyDomainSchema,
      score: z.number().min(0).max(100),
      averageCurrentLevel: z.number().min(0).max(5),
      averageRequiredLevel: z.number().min(0).max(5),
    }),
  ),
  records: z.array(CompetencyAssessmentRecordSchema),
  computedAt: IsoDateTimeSchema,
});
export type CompetencyProfile = z.infer<typeof CompetencyProfileSchema>;

/** A derived, ranked gap. The backend computes this; the UI never derives it. */
export const SkillGapSchema = z.object({
  competencyKey: z.string(),
  competencyName: z.string(),
  domain: CompetencyDomainSchema,
  currentLevel: ProficiencyLevelSchema,
  requiredLevel: ProficiencyLevelSchema,
  gap: z.number().int().min(0).max(5),
  severity: GapSeveritySchema,
  /** gap * weight * criticality, normalised 0-100. Sort key for the gap list. */
  priorityScore: z.number().min(0).max(100),
  estimatedHoursToClose: z.number().nonnegative(),
  /** Course ids that close this gap, best first. */
  recommendedCourseIds: z.array(IdSchema),
});
export type SkillGap = z.infer<typeof SkillGapSchema>;
