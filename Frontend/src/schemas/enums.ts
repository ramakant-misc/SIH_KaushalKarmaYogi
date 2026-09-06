import { z } from "zod";

/** The three platform roles. Stored in Clerk publicMetadata.role. */
export const RoleSchema = z.enum(["employee", "administrator", "engineer"]);
export type Role = z.infer<typeof RoleSchema>;

export const ROLE_LABELS: Record<Role, string> = {
  employee: "Employee / Official",
  administrator: "Administrator",
  engineer: "Engineer / Developer",
};

/** The four competency domains defined by the problem statement. */
export const CompetencyDomainSchema = z.enum([
  "statistical",
  "technical",
  "digital_governance",
  "behavioural",
]);
export type CompetencyDomain = z.infer<typeof CompetencyDomainSchema>;

export const DOMAIN_LABELS: Record<CompetencyDomain, string> = {
  statistical: "Statistical",
  technical: "Technical",
  digital_governance: "Digital Governance",
  behavioural: "Behavioural & Managerial",
};

/**
 * Proficiency scale 0-5, used for both current and required levels.
 * gap = requiredLevel - currentLevel; a gap >= 1 is actionable.
 */
export const ProficiencyLevelSchema = z.number().int().min(0).max(5);
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelSchema>;

export const LEVEL_LABELS: Record<number, string> = {
  0: "None",
  1: "Awareness",
  2: "Working",
  3: "Practitioner",
  4: "Advanced",
  5: "Expert",
};

/** Where a learning item comes from. */
export const CourseSourceSchema = z.enum(["igot", "nssta_tpac", "internal"]);
export type CourseSource = z.infer<typeof CourseSourceSchema>;

export const GapSeveritySchema = z.enum(["critical", "high", "moderate", "low"]);
export type GapSeverity = z.infer<typeof GapSeveritySchema>;

export const EnrollmentStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "dropped",
]);
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>;

export const LanguageSchema = z.enum(["en", "hi"]);
export type Language = z.infer<typeof LanguageSchema>;

/** How a competency level was evidenced. Drives the "why this level?" UI. */
export const EvidenceSourceSchema = z.enum([
  "self_assessment",
  "assessment_score",
  "course_completion",
  "prior_training",
  "experience",
  "supervisor_endorsement",
]);
export type EvidenceSource = z.infer<typeof EvidenceSourceSchema>;
