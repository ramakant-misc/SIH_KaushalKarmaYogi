import { z } from "zod";
import { IdSchema, IsoDateTimeSchema } from "./common";
import {
  CompetencyDomainSchema,
  CourseSourceSchema,
  LanguageSchema,
  ProficiencyLevelSchema,
} from "./enums";

export const CourseModuleSchema = z.object({
  id: IdSchema,
  title: z.string(),
  contentType: z.enum(["video", "document", "quiz", "lab", "external"]),
  durationMinutes: z.number().int().nonnegative(),
  order: z.number().int().nonnegative(),
});
export type CourseModule = z.infer<typeof CourseModuleSchema>;

/** Which competency a course advances, and to what level. */
export const CourseCompetencyTagSchema = z.object({
  competencyKey: z.string(),
  competencyName: z.string(),
  domain: CompetencyDomainSchema,
  targetLevel: ProficiencyLevelSchema.describe("Level a learner reaches on completion"),
});

/**
 * A learning item from iGOT Karmayogi, NSSTA TPAC, or internal content.
 * `externalId` + `source` together identify the upstream record for sync.
 */
export const CourseSchema = z.object({
  id: IdSchema,
  externalId: z.string().nullable().describe("iGOT course id (do_xxx) when source = igot"),
  source: CourseSourceSchema,
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  provider: z.string().describe("e.g. iGOT Karmayogi, NSSTA, ISI"),
  thumbnailUrl: z.string().url().nullable(),
  durationMinutes: z.number().int().nonnegative(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  languages: z.array(LanguageSchema),
  competencies: z.array(CourseCompetencyTagSchema),
  learningOutcomes: z.array(z.string()),
  prerequisites: z.array(z.string()),
  modules: z.array(CourseModuleSchema),
  rating: z.number().min(0).max(5).nullable(),
  ratingCount: z.number().int().nonnegative(),
  enrolledCount: z.number().int().nonnegative(),
  /** Deep link into iGOT so the learner can complete it there. */
  externalUrl: z.string().url().nullable(),
  updatedAt: IsoDateTimeSchema,
  /**
   * Personalisation, present only for authenticated requests.
   * 0-100. Why this course fits THIS user, with human-readable reasons.
   */
  matchScore: z.number().min(0).max(100).optional(),
  matchReasons: z.array(z.string()).optional(),
});
export type Course = z.infer<typeof CourseSchema>;

/** Filters accepted by GET /api/v1/courses. All optional, all combinable. */
export const CourseQuerySchema = z.object({
  q: z.string().optional(),
  domain: z.array(CompetencyDomainSchema).optional(),
  competencyKey: z.array(z.string()).optional(),
  source: z.array(CourseSourceSchema).optional(),
  level: z.array(z.enum(["beginner", "intermediate", "advanced"])).optional(),
  language: z.array(LanguageSchema).optional(),
  maxDurationMinutes: z.number().int().positive().optional(),
  sort: z.enum(["relevance", "rating", "duration", "newest", "match"]).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type CourseQuery = z.infer<typeof CourseQuerySchema>;

/** An NSSTA TPAC recommended training programme (instructor-led, scheduled, capped). */
export const TrainingProgrammeSchema = z.object({
  id: IdSchema,
  code: z.string().describe("e.g. TPAC/2026/NA-07"),
  title: z.string(),
  description: z.string(),
  organisedBy: z.string().describe("e.g. NSSTA, Greater Noida"),
  mode: z.enum(["classroom", "online", "blended"]),
  venue: z.string().nullable(),
  startsAt: IsoDateTimeSchema,
  endsAt: IsoDateTimeSchema,
  capacity: z.number().int().positive(),
  seatsFilled: z.number().int().nonnegative(),
  eligibility: z.string().describe("Free text, e.g. 'SSO and above with 3+ years experience'"),
  competencies: z.array(CourseCompetencyTagSchema),
  nominationDeadline: IsoDateTimeSchema,
  status: z.enum(["upcoming", "open", "closed", "running", "completed"]),
});
export type TrainingProgramme = z.infer<typeof TrainingProgrammeSchema>;
