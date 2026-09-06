import { USE_MOCKS } from "./config";
import { request } from "./http";
import { mock, paginate } from "./mock";
import {
  COURSES, COURSE_BY_ID, DEMO_USER_IDS, PROGRAMMES, PROGRAMME_BY_ID,
  buildSkillGaps, courseIdsForCompetency, hash, roundTo, rng,
} from "@/mocks";
import type { Course, CourseQuery, Paginated, TrainingProgramme } from "@/schemas";

/** Personalisation applied server-side in production; mirrored here for the mock. */
function withMatch(course: Course, userId: string): Course {
  const gaps = buildSkillGaps(userId, courseIdsForCompetency);
  const hit = gaps.find((g) => course.competencies.some((c) => c.competencyKey === g.competencyKey));
  if (!hit) return course;
  const r = rng(hash(`match-${userId}-${course.id}`));
  return {
    ...course,
    matchScore: roundTo(Math.min(99, 52 + hit.priorityScore * 0.45 + r() * 5), 0),
    matchReasons: [
      `Closes your ${hit.severity} gap in ${hit.competencyName}`,
      `Takes you from level ${hit.currentLevel} towards the level ${hit.requiredLevel} your role requires`,
    ],
  };
}

// @replace_with_real_API "GET /api/v1/courses"
export async function listCourses(
  query: CourseQuery = {},
  opts: { userId?: string | null; token?: string | null } = {},
): Promise<Paginated<Course>> {
  if (USE_MOCKS) {
    let items = [...COURSES];

    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.competencies.some((x) => x.competencyName.toLowerCase().includes(q)),
      );
    }
    if (query.domain?.length)
      items = items.filter((c) => c.competencies.some((x) => query.domain!.includes(x.domain)));
    if (query.competencyKey?.length)
      items = items.filter((c) => c.competencies.some((x) => query.competencyKey!.includes(x.competencyKey)));
    if (query.source?.length) items = items.filter((c) => query.source!.includes(c.source));
    if (query.level?.length) items = items.filter((c) => query.level!.includes(c.level));
    if (query.language?.length)
      items = items.filter((c) => c.languages.some((l) => query.language!.includes(l)));
    if (query.maxDurationMinutes)
      items = items.filter((c) => c.durationMinutes <= query.maxDurationMinutes!);

    if (opts.userId) items = items.map((c) => withMatch(c, opts.userId!));

    switch (query.sort) {
      case "rating": items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "duration": items.sort((a, b) => a.durationMinutes - b.durationMinutes); break;
      case "newest": items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); break;
      case "match": items.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)); break;
      default: items.sort((a, b) => b.enrolledCount - a.enrolledCount);
    }

    return mock(paginate(items, query.cursor, query.limit ?? 12));
  }
  return request<Paginated<Course>>("/api/v1/courses", { query: query as Record<string, unknown>, token: opts.token });
}

// @replace_with_real_API "GET /api/v1/courses/:courseId"
export async function getCourse(
  courseId: string,
  opts: { userId?: string | null; token?: string | null } = {},
): Promise<Course> {
  if (USE_MOCKS) {
    const course =
      COURSE_BY_ID[courseId] ?? COURSES.find((c) => c.externalId === courseId);
    if (!course) throw new Error(`Course not found: ${courseId}`);
    return mock(opts.userId ? withMatch(course, opts.userId) : course);
  }
  return request<Course>(`/api/v1/courses/${courseId}`, { token: opts.token });
}

// @replace_with_real_API "GET /api/v1/programmes"
export async function listProgrammes(
  query: { status?: string[]; mode?: string[]; competencyKey?: string[]; cursor?: string; limit?: number } = {},
  token?: string | null,
): Promise<Paginated<TrainingProgramme>> {
  if (USE_MOCKS) {
    let items = [...PROGRAMMES];
    if (query.status?.length) items = items.filter((p) => query.status!.includes(p.status));
    if (query.mode?.length) items = items.filter((p) => query.mode!.includes(p.mode));
    if (query.competencyKey?.length)
      items = items.filter((p) => p.competencies.some((c) => query.competencyKey!.includes(c.competencyKey)));
    items.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return mock(paginate(items, query.cursor, query.limit ?? 12));
  }
  return request<Paginated<TrainingProgramme>>("/api/v1/programmes", { query, token });
}

// @replace_with_real_API "GET /api/v1/programmes/:programmeId"
export async function getProgramme(programmeId: string, token?: string | null): Promise<TrainingProgramme> {
  if (USE_MOCKS) {
    const programme = PROGRAMME_BY_ID[programmeId];
    if (!programme) throw new Error(`Programme not found: ${programmeId}`);
    return mock(programme);
  }
  return request<TrainingProgramme>(`/api/v1/programmes/${programmeId}`, { token });
}

// @replace_with_real_API "POST /api/v1/programmes"
export async function createProgramme(
  input: Omit<TrainingProgramme, "id" | "seatsFilled" | "status">,
  token?: string | null,
): Promise<TrainingProgramme> {
  if (USE_MOCKS)
    return mock({ ...input, id: `prog_new_${Date.now()}`, seatsFilled: 0, status: "upcoming" as const });
  return request<TrainingProgramme>("/api/v1/programmes", { method: "POST", body: input, token });
}

// @replace_with_real_API "PATCH /api/v1/programmes/:programmeId"
export async function updateProgramme(
  programmeId: string,
  patch: Partial<TrainingProgramme>,
  token?: string | null,
): Promise<TrainingProgramme> {
  if (USE_MOCKS) return mock({ ...PROGRAMME_BY_ID[programmeId]!, ...patch });
  return request<TrainingProgramme>(`/api/v1/programmes/${programmeId}`, { method: "PATCH", body: patch, token });
}

// @replace_with_real_API "POST /api/v1/programmes/:programmeId/nominations"
export async function nominateToProgramme(
  programmeId: string,
  userIds: string[],
  token?: string | null,
): Promise<{ nominated: number; programme: TrainingProgramme }> {
  if (USE_MOCKS) {
    const programme = PROGRAMME_BY_ID[programmeId]!;
    // The real endpoint must reject the whole batch if it would exceed capacity.
    if (programme.seatsFilled + userIds.length > programme.capacity)
      throw new Error(`Only ${programme.capacity - programme.seatsFilled} seats remain.`);
    return mock({
      nominated: userIds.length,
      programme: { ...programme, seatsFilled: programme.seatsFilled + userIds.length },
    });
  }
  return request(`/api/v1/programmes/${programmeId}/nominations`, {
    method: "POST", body: { userIds }, token,
  });
}

export const DEMO_LEARNER_ID = DEMO_USER_IDS.employee;
