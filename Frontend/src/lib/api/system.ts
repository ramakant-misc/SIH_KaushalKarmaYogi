import { USE_MOCKS } from "./config";
import { request } from "./http";
import { mock, paginate } from "./mock";
import {
  AUDIT_LOG, DEMO_USER_IDS, SYSTEM_HEALTH, VIRTUAL_LABS, buildNotifications,
} from "@/mocks";
import type {
  AuditLogEntry, IntegrationStatus, Notification, Paginated, SystemHealth, VirtualLab,
} from "@/schemas";

// @replace_with_real_API "GET /api/v1/system/health"
export async function getSystemHealth(token?: string | null): Promise<SystemHealth> {
  if (USE_MOCKS) return mock(SYSTEM_HEALTH);
  return request<SystemHealth>("/api/v1/system/health", { token });
}

// @replace_with_real_API "GET /api/v1/system/integrations"
export async function listIntegrations(token?: string | null): Promise<IntegrationStatus[]> {
  if (USE_MOCKS) return mock(SYSTEM_HEALTH.integrations);
  return request<IntegrationStatus[]>("/api/v1/system/integrations", { token });
}

// @replace_with_real_API "POST /api/v1/system/integrations/:key/sync"
export async function triggerSync(
  key: string,
  token?: string | null,
): Promise<{ jobId: string; status: string }> {
  if (USE_MOCKS) return mock({ jobId: `sync_${Date.now()}`, status: "queued" }, 700);
  return request(`/api/v1/system/integrations/${key}/sync`, { method: "POST", token });
}

// @replace_with_real_API "GET /api/v1/system/audit-log"
export async function listAuditLog(
  query: { actorId?: string; action?: string; resourceType?: string; cursor?: string; limit?: number } = {},
  token?: string | null,
): Promise<Paginated<AuditLogEntry>> {
  if (USE_MOCKS) {
    let items = [...AUDIT_LOG];
    if (query.actorId) items = items.filter((e) => e.actorId === query.actorId);
    if (query.action) items = items.filter((e) => e.action === query.action);
    if (query.resourceType) items = items.filter((e) => e.resourceType === query.resourceType);
    return mock(paginate(items, query.cursor, query.limit ?? 25));
  }
  return request<Paginated<AuditLogEntry>>("/api/v1/system/audit-log", { query, token });
}

// @replace_with_real_API "GET /api/v1/notifications"
export async function listNotifications(
  query: { isRead?: boolean; cursor?: string; limit?: number } = {},
  token?: string | null,
): Promise<Paginated<Notification>> {
  if (USE_MOCKS) {
    let items = buildNotifications(DEMO_USER_IDS.employee);
    if (query.isRead !== undefined) items = items.filter((n) => n.isRead === query.isRead);
    return mock(paginate(items, query.cursor, query.limit ?? 20));
  }
  return request<Paginated<Notification>>("/api/v1/notifications", { query, token });
}

// @replace_with_real_API "PATCH /api/v1/notifications/:notificationId"
export async function markNotificationRead(
  notificationId: string,
  token?: string | null,
): Promise<Notification> {
  if (USE_MOCKS) {
    const notification = buildNotifications(DEMO_USER_IDS.employee).find((n) => n.id === notificationId);
    return mock({ ...notification!, isRead: true });
  }
  return request<Notification>(`/api/v1/notifications/${notificationId}`, {
    method: "PATCH", body: { isRead: true }, token,
  });
}

// @replace_with_real_API "GET /api/v1/labs"
export async function listLabs(token?: string | null): Promise<VirtualLab[]> {
  if (USE_MOCKS) return mock(VIRTUAL_LABS);
  return request<VirtualLab[]>("/api/v1/labs", { token });
}

// @replace_with_real_API "POST /api/v1/labs/:labId/launch"
export async function launchLab(
  labId: string,
  token?: string | null,
): Promise<{ launchUrl: string | null; status: VirtualLab["status"] }> {
  if (USE_MOCKS) return mock({ launchUrl: null, status: "provisioning" as const }, 900);
  return request(`/api/v1/labs/${labId}/launch`, { method: "POST", token });
}

// @replace_with_real_API "POST /api/v1/contact"
export async function submitContact(
  input: { name: string; email: string; organisation?: string; subject: string; message: string },
): Promise<{ received: true }> {
  if (USE_MOCKS) return mock({ received: true as const }, 600);
  return request<{ received: true }>("/api/v1/contact", { method: "POST", body: input });
}
