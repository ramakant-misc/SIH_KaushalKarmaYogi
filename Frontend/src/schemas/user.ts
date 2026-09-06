import { z } from "zod";
import { IdSchema, IsoDateTimeSchema } from "./common";
import { LanguageSchema, RoleSchema } from "./enums";

/** Identity record. Mirrors the Clerk user; Clerk remains the source of truth for auth. */
export const UserSchema = z.object({
  id: IdSchema.describe("Clerk user id, e.g. user_2abc..."),
  email: z.string().email(),
  fullName: z.string(),
  avatarUrl: z.string().url().nullable(),
  role: RoleSchema,
  department: z.string().nullable().describe("e.g. MoSPI - National Statistical Office"),
  designation: z.string().nullable().describe("e.g. Junior Statistical Officer"),
  preferredLanguage: LanguageSchema.default("en"),
  isProfileComplete: z.boolean().describe("False until the onboarding wizard is submitted"),
  createdAt: IsoDateTimeSchema,
});
export type User = z.infer<typeof UserSchema>;

export const QualificationSchema = z.object({
  degree: z.string().describe("e.g. M.Sc. Statistics"),
  institution: z.string(),
  yearOfCompletion: z.number().int().min(1950).max(2100),
  specialization: z.string().nullable(),
});
export type Qualification = z.infer<typeof QualificationSchema>;

export const PriorTrainingSchema = z.object({
  id: IdSchema,
  title: z.string(),
  provider: z.string().describe("e.g. NSSTA, ISI, iGOT Karmayogi"),
  completedAt: IsoDateTimeSchema,
  durationHours: z.number().nonnegative(),
  /** Competency keys this training contributes evidence for. */
  competencyKeys: z.array(z.string()),
});
export type PriorTraining = z.infer<typeof PriorTrainingSchema>;

/**
 * The service record the competency engine reasons over.
 * Captured by the onboarding wizard, then editable from /profile.
 */
export const OfficialProfileSchema = z.object({
  userId: IdSchema,
  employeeCode: z.string().nullable(),
  cadre: z.string().nullable().describe("e.g. Indian Statistical Service (ISS)"),
  department: z.string(),
  office: z.string().describe("Posting location, e.g. NSO Field Operations Division, Nagpur"),
  designation: z.string(),
  /** FRAC role key this designation maps to; drives required competency levels. */
  roleKey: z.string().describe("e.g. jso_field_survey"),
  currentAssignment: z.string(),
  yearsOfExperience: z.number().nonnegative(),
  dateOfJoining: IsoDateTimeSchema.nullable(),
  qualifications: z.array(QualificationSchema),
  priorTrainings: z.array(PriorTrainingSchema),
  updatedAt: IsoDateTimeSchema,
});
export type OfficialProfile = z.infer<typeof OfficialProfileSchema>;

/** Request body for POST /api/v1/auth/onboarding. */
export const OnboardingInputSchema = OfficialProfileSchema.omit({
  userId: true,
  updatedAt: true,
  priorTrainings: true,
}).extend({
  priorTrainings: z.array(PriorTrainingSchema.omit({ id: true })),
  /** Optional self-declared starting levels, keyed by competency key. */
  selfAssessment: z.record(z.string(), z.number().int().min(0).max(5)).optional(),
});
export type OnboardingInput = z.infer<typeof OnboardingInputSchema>;
