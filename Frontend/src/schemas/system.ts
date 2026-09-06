import { z } from "zod";
import { IdSchema, IsoDateTimeSchema } from "./common";
import { RoleSchema } from "./enums";

export const NotificationSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  kind: z.enum([
    "recommendation",
    "nomination",
    "deadline",
    "assessment_result",
    "certificate",
    "system",
  ]),
  title: z.string(),
  body: z.string(),
  href: z.string().nullable().describe("In-app route to open on click"),
  isRead: z.boolean(),
  createdAt: IsoDateTimeSchema,
});
export type Notification = z.infer<typeof NotificationSchema>;

/** Engineer dashboard: one dependency's health. */
export const ServiceHealthSchema = z.object({
  key: z.string().describe("e.g. igot_api, question_generator, postgres"),
  name: z.string(),
  status: z.enum(["healthy", "degraded", "down", "unknown"]),
  latencyP95Ms: z.number().nonnegative().nullable(),
  errorRatePercent: z.number().min(0).max(100).nullable(),
  lastCheckedAt: IsoDateTimeSchema,
  message: z.string().nullable(),
});
export type ServiceHealth = z.infer<typeof ServiceHealthSchema>;

/** State of a background worker queue. */
export const QueueStatusSchema = z.object({
  key: z.string(),
  name: z.string(),
  pending: z.number().int().nonnegative(),
  running: z.number().int().nonnegative(),
  failed24h: z.number().int().nonnegative(),
  oldestPendingAgeSeconds: z.number().int().nonnegative().nullable(),
});

/** iGOT Karmayogi catalogue sync state. */
export const IntegrationStatusSchema = z.object({
  key: z.enum(["igot_catalogue", "igot_enrolment", "clerk_webhook", "nssta_tpac"]),
  name: z.string(),
  isConnected: z.boolean(),
  lastSyncAt: IsoDateTimeSchema.nullable(),
  lastSyncStatus: z.enum(["success", "partial", "failed", "never_run"]),
  recordsSynced: z.number().int().nonnegative().nullable(),
  nextSyncAt: IsoDateTimeSchema.nullable(),
  credentialExpiresAt: IsoDateTimeSchema.nullable(),
  message: z.string().nullable(),
});
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

export const SystemHealthSchema = z.object({
  services: z.array(ServiceHealthSchema),
  queues: z.array(QueueStatusSchema),
  integrations: z.array(IntegrationStatusSchema),
  uptimePercent30d: z.number().min(0).max(100),
  computedAt: IsoDateTimeSchema,
});
export type SystemHealth = z.infer<typeof SystemHealthSchema>;

export const AuditLogEntrySchema = z.object({
  id: IdSchema,
  actorId: IdSchema,
  actorName: z.string(),
  actorRole: RoleSchema,
  action: z.string().describe("Verb-noun, e.g. 'role.updated', 'programme.nominated'"),
  resourceType: z.string(),
  resourceId: z.string().nullable(),
  ipAddress: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: IsoDateTimeSchema,
});
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

/**
 * One row of the API registry rendered at /engineer/api-registry.
 * Mirrors ENDPOINT_CONTRACT.md; `status` flips to LIVE as the backend lands.
 */
export const EndpointRegistryEntrySchema = z.object({
  method: z.enum(["GET", "POST", "PATCH", "PUT", "DELETE"]),
  path: z.string(),
  purpose: z.string(),
  requiredRoles: z.array(RoleSchema).describe("Empty array means public"),
  status: z.enum(["MOCK", "LIVE"]),
  owner: z.string().describe("Which team member is implementing it"),
});
export type EndpointRegistryEntry = z.infer<typeof EndpointRegistryEntrySchema>;

/** A hands-on virtual lab environment. */
export const VirtualLabSchema = z.object({
  id: IdSchema,
  title: z.string(),
  description: z.string(),
  technology: z.string().describe("e.g. Python + Jupyter, QGIS, AWS Sandbox"),
  competencyKeys: z.array(z.string()),
  estimatedMinutes: z.number().int().positive(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  status: z.enum(["available", "provisioning", "running", "unavailable"]),
  launchUrl: z.string().url().nullable(),
});
export type VirtualLab = z.infer<typeof VirtualLabSchema>;
