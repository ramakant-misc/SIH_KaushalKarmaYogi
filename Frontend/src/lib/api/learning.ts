import { USE_MOCKS } from "./config";
import { request } from "./http";
import { mock, paginate } from "./mock";
import {
  COURSE_BY_ID, DEMO_USER_IDS, buildCertificates, buildEnrollments, buildLearningPaths,
  buildLearningStats, buildRecommendations, resolveUserId,
} from "@/mocks";
import type {
  Certificate, Enrollment, LearningPath, LearningStats, Paginated, Recommendation,
} from "@/schemas";

const currentUserId = () => DEMO_USER_IDS.employee;

// @replace_with_real_API "GET /api/v1/recommendations"
export async function listRecommendations(
  params: { limit?: number; kind?: string[] } = {},
  token?: string | null,
): Promise<Recommendation[]> {
  if (USE_MOCKS) {
    let items = buildRecommendations(currentUserId());
    if (params.kind?.length) items = items.filter((r) => params.kind!.includes(r.kind));
    return mock(params.limit ? items.slice(0, params.limit) : items);
  }
  return request<Recommendation[]>("/api/v1/recommendations", { query: params, token });
}

// @replace_with_real_API "GET /api/v1/learning-paths"
export async function listLearningPaths(token?: string | null): Promise<LearningPath[]> {
  if (USE_MOCKS) return mock(buildLearningPaths(currentUserId()));
  return request<LearningPath[]>("/api/v1/learning-paths", { token });
}

// @replace_with_real_API "GET /api/v1/learning-paths/:pathId"
export async function getLearningPath(pathId: string, token?: string | null): Promise<LearningPath> {
  if (USE_MOCKS) {
    const path = buildLearningPaths(currentUserId()).find((p) => p.id === pathId);
    if (!path) throw new Error(`Learning path not found: ${pathId}`);
    return mock(path);
  }
  return request<LearningPath>(`/api/v1/learning-paths/${pathId}`, { token });
}

// @replace_with_real_API "POST /api/v1/learning-paths/generate"
export async function generateLearningPath(
  input: { targetCompetencyKeys?: string[]; maxWeeklyHours?: number } = {},
  token?: string | null,
): Promise<LearningPath> {
  if (USE_MOCKS) return mock(buildLearningPaths(currentUserId())[0]!, 900);
  return request<LearningPath>("/api/v1/learning-paths/generate", { method: "POST", body: input, token });
}

// @replace_with_real_API "GET /api/v1/enrollments"
export async function listEnrollments(
  query: { status?: string[]; kind?: string[]; bookmarked?: boolean; cursor?: string; limit?: number } = {},
  token?: string | null,
): Promise<Paginated<Enrollment>> {
  if (USE_MOCKS) {
    let items = buildEnrollments(currentUserId());
    if (query.status?.length) items = items.filter((e) => query.status!.includes(e.status));
    if (query.kind?.length) items = items.filter((e) => query.kind!.includes(e.kind));
    if (query.bookmarked) items = items.filter((e) => e.isBookmarked);
    return mock(paginate(items, query.cursor, query.limit ?? 20));
  }
  return request<Paginated<Enrollment>>("/api/v1/enrollments", { query, token });
}

// @replace_with_real_API "POST /api/v1/enrollments"
export async function createEnrollment(
  input: { kind: "course" | "programme"; refId: string },
  token?: string | null,
): Promise<Enrollment> {
  if (USE_MOCKS) {
    const course = COURSE_BY_ID[input.refId];
    return mock({
      id: `enrol_new_${Date.now()}`,
      userId: currentUserId(),
      kind: input.kind,
      refId: input.refId,
      title: course?.title ?? "Course",
      thumbnailUrl: null,
      status: "not_started" as const,
      progressPercent: 0,
      resumeModuleId: course?.modules[0]?.id ?? null,
      minutesSpent: 0,
      isBookmarked: false,
      enrolledAt: new Date().toISOString(),
      completedAt: null,
      dueAt: null,
    });
  }
  return request<Enrollment>("/api/v1/enrollments", { method: "POST", body: input, token });
}

// @replace_with_real_API "PATCH /api/v1/enrollments/:enrollmentId"
export async function updateEnrollment(
  enrollmentId: string,
  patch: { progressPercent?: number; isBookmarked?: boolean; completedModuleId?: string },
  token?: string | null,
): Promise<Enrollment> {
  if (USE_MOCKS) {
    const existing = buildEnrollments(currentUserId()).find((e) => e.id === enrollmentId);
    if (!existing) throw new Error(`Enrollment not found: ${enrollmentId}`);
    const progress = patch.progressPercent ?? existing.progressPercent;
    return mock({
      ...existing,
      ...patch,
      progressPercent: progress,
      status: progress >= 100 ? ("completed" as const) : progress > 0 ? ("in_progress" as const) : existing.status,
      completedAt: progress >= 100 ? new Date().toISOString() : existing.completedAt,
    });
  }
  return request<Enrollment>(`/api/v1/enrollments/${enrollmentId}`, { method: "PATCH", body: patch, token });
}

// @replace_with_real_API "GET /api/v1/learning-stats/:userId"
export async function getLearningStats(userId: string, token?: string | null): Promise<LearningStats> {
  if (USE_MOCKS) return mock(buildLearningStats(resolveUserId(userId, currentUserId())));
  return request<LearningStats>(`/api/v1/learning-stats/${userId}`, { token });
}

// @replace_with_real_API "GET /api/v1/certificates"
export async function listCertificates(token?: string | null): Promise<Certificate[]> {
  if (USE_MOCKS) return mock(buildCertificates(currentUserId()));
  return request<Certificate[]>("/api/v1/certificates", { token });
}
