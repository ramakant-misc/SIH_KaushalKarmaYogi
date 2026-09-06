import { z } from "zod";
import { IdSchema, IsoDateTimeSchema } from "./common";
import { CompetencyDomainSchema, LanguageSchema } from "./enums";

/** An uploaded source document the question generator reads. */
export const ContentAssetSchema = z.object({
  id: IdSchema,
  uploadedBy: IdSchema,
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  kind: z.enum(["pdf", "docx", "pptx", "video", "url", "text"]),
  sourceUrl: z.string().url().nullable(),
  /** Parse pipeline state. The UI polls until ready or failed. */
  status: z.enum(["queued", "parsing", "ready", "failed"]),
  failureReason: z.string().nullable(),
  pageCount: z.number().int().nonnegative().nullable(),
  durationSeconds: z.number().int().nonnegative().nullable(),
  detectedLanguage: LanguageSchema.nullable(),
  extractedWordCount: z.number().int().nonnegative().nullable(),
  createdAt: IsoDateTimeSchema,
});
export type ContentAsset = z.infer<typeof ContentAssetSchema>;

export const BloomLevelSchema = z.enum([
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
]);
export type BloomLevel = z.infer<typeof BloomLevelSchema>;

export const QuestionOptionSchema = z.object({
  id: z.string().describe("Stable within the question, e.g. 'a'"),
  text: z.string(),
  isCorrect: z.boolean().describe("Never sent to learners before submission"),
  /** Why this distractor is wrong. Shown in the result explanation. */
  rationale: z.string().nullable(),
});

/** An AI-generated or human-authored objective question. */
export const QuestionSchema = z.object({
  id: IdSchema,
  assessmentId: IdSchema.nullable(),
  type: z.enum(["mcq_single", "mcq_multi", "true_false"]),
  stem: z.string(),
  options: z.array(QuestionOptionSchema),
  explanation: z.string().describe("Why the correct answer is correct"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  bloomLevel: BloomLevelSchema,
  competencyKeys: z.array(z.string()),
  language: LanguageSchema,
  /** Provenance: which asset and where in it this came from. */
  sourceAssetId: IdSchema.nullable(),
  sourceSnippet: z.string().nullable(),
  sourcePage: z.number().int().positive().nullable(),
  /** Generator confidence, 0-1. Low-confidence items are flagged for review. */
  generationConfidence: z.number().min(0).max(1).nullable(),
  reviewStatus: z.enum(["pending", "approved", "edited", "rejected"]),
  createdAt: IsoDateTimeSchema,
});
export type Question = z.infer<typeof QuestionSchema>;

/** The learner-facing shape: correctness and rationale stripped out. */
export const LearnerQuestionSchema = QuestionSchema.omit({
  options: true,
  explanation: true,
  sourceSnippet: true,
  generationConfidence: true,
  reviewStatus: true,
}).extend({
  options: z.array(QuestionOptionSchema.omit({ isCorrect: true, rationale: true })),
});
export type LearnerQuestion = z.infer<typeof LearnerQuestionSchema>;

export const AssessmentSchema = z.object({
  id: IdSchema,
  title: z.string(),
  description: z.string(),
  kind: z.enum(["diagnostic", "course_quiz", "adaptive", "certification"]),
  competencyKeys: z.array(z.string()),
  domains: z.array(CompetencyDomainSchema),
  questionCount: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  passPercent: z.number().min(0).max(100),
  maxAttempts: z.number().int().positive().nullable(),
  /** Adaptive assessments pick the next question from the running ability estimate. */
  isAdaptive: z.boolean(),
  status: z.enum(["draft", "published", "archived"]),
  linkedCourseId: IdSchema.nullable(),
  createdBy: IdSchema,
  createdAt: IsoDateTimeSchema,
});
export type Assessment = z.infer<typeof AssessmentSchema>;

/** An async AI generation job. The UI polls it. */
export const GenerationJobSchema = z.object({
  id: IdSchema,
  assetIds: z.array(IdSchema),
  requestedBy: IdSchema,
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  progressPercent: z.number().min(0).max(100),
  requestedCount: z.number().int().positive(),
  generatedCount: z.number().int().nonnegative(),
  failureReason: z.string().nullable(),
  resultAssessmentId: IdSchema.nullable(),
  createdAt: IsoDateTimeSchema,
  completedAt: IsoDateTimeSchema.nullable(),
});
export type GenerationJob = z.infer<typeof GenerationJobSchema>;

/** Body for POST /api/v1/studio/generate. */
export const GenerationRequestSchema = z.object({
  assetIds: z.array(IdSchema).min(1),
  questionCount: z.number().int().min(1).max(100),
  difficultyMix: z.object({
    easy: z.number().int().min(0).max(100),
    medium: z.number().int().min(0).max(100),
    hard: z.number().int().min(0).max(100),
  }),
  bloomLevels: z.array(BloomLevelSchema).min(1),
  competencyKeys: z.array(z.string()),
  language: LanguageSchema,
  questionTypes: z.array(z.enum(["mcq_single", "mcq_multi", "true_false"])).min(1),
});
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

export const AttemptResponseSchema = z.object({
  questionId: IdSchema,
  selectedOptionIds: z.array(z.string()),
  isCorrect: z.boolean().nullable().describe("Null until the attempt is submitted"),
  timeSpentSeconds: z.number().int().nonnegative(),
});

export const AttemptSchema = z.object({
  id: IdSchema,
  assessmentId: IdSchema,
  userId: IdSchema,
  status: z.enum(["in_progress", "submitted", "expired"]),
  responses: z.array(AttemptResponseSchema),
  scorePercent: z.number().min(0).max(100).nullable(),
  passed: z.boolean().nullable(),
  /** Per-competency result, drives the "what to study next" block. */
  competencyBreakdown: z.array(
    z.object({
      competencyKey: z.string(),
      competencyName: z.string(),
      correct: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
      inferredLevel: z.number().int().min(0).max(5),
    }),
  ),
  startedAt: IsoDateTimeSchema,
  submittedAt: IsoDateTimeSchema.nullable(),
});
export type Attempt = z.infer<typeof AttemptSchema>;

/** Result payload: attempt + the full questions with answers and explanations. */
export const AttemptResultSchema = z.object({
  attempt: AttemptSchema,
  questions: z.array(QuestionSchema),
  recommendedCourseIds: z.array(IdSchema),
});
export type AttemptResult = z.infer<typeof AttemptResultSchema>;
