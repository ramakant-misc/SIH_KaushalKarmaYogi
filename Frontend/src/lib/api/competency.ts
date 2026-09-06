import { USE_MOCKS } from "./config";
import { request } from "./http";
import { mock } from "./mock";
import {
  COMPETENCIES, DEMO_USER_IDS, FRAMEWORK, ROLE_REQUIREMENTS, REQUIRED_DEFAULT,
  buildCompetencyProfile, buildSkillGaps, courseIdsForCompetency, resolveUserId,
} from "@/mocks";
import type {
  CompetencyFramework, CompetencyProfile, RoleCompetencyRequirement, SkillGap,
} from "@/schemas";

const currentUserId = () => DEMO_USER_IDS.employee;

// @replace_with_real_API "GET /api/v1/competency/framework"
export async function getFramework(token?: string | null): Promise<CompetencyFramework> {
  if (USE_MOCKS) return mock(FRAMEWORK);
  return request<CompetencyFramework>("/api/v1/competency/framework", { token });
}

// @replace_with_real_API "GET /api/v1/competency/profile/:userId"
export async function getCompetencyProfile(
  userId: string,
  token?: string | null,
): Promise<CompetencyProfile> {
  if (USE_MOCKS) return mock(buildCompetencyProfile(resolveUserId(userId, currentUserId())));
  return request<CompetencyProfile>(`/api/v1/competency/profile/${userId}`, { token });
}

// @replace_with_real_API "GET /api/v1/competency/gaps/:userId"
export async function getSkillGaps(
  userId: string,
  params?: { domain?: string[]; severity?: string[]; limit?: number },
  token?: string | null,
): Promise<SkillGap[]> {
  if (USE_MOCKS) {
    let gaps = buildSkillGaps(resolveUserId(userId, currentUserId()), courseIdsForCompetency);
    if (params?.domain?.length) gaps = gaps.filter((g) => params.domain!.includes(g.domain));
    if (params?.severity?.length) gaps = gaps.filter((g) => params.severity!.includes(g.severity));
    return mock(params?.limit ? gaps.slice(0, params.limit) : gaps);
  }
  return request<SkillGap[]>(`/api/v1/competency/gaps/${userId}`, { query: params, token });
}

// @replace_with_real_API "POST /api/v1/competency/self-assessment"
export async function submitSelfAssessment(
  levels: Record<string, number>,
  token?: string | null,
): Promise<CompetencyProfile> {
  if (USE_MOCKS) {
    const profile = buildCompetencyProfile(currentUserId());
    return mock({
      ...profile,
      records: profile.records.map((r) =>
        levels[r.competencyKey] === undefined
          ? r
          : { ...r, currentLevel: levels[r.competencyKey]!, confidence: 0.3 },
      ),
      computedAt: new Date().toISOString(),
    });
  }
  return request<CompetencyProfile>("/api/v1/competency/self-assessment", {
    method: "POST", body: { levels }, token,
  });
}

// @replace_with_real_API "GET /api/v1/competency/requirements/:roleKey"
export async function getRoleRequirements(
  roleKey: string,
  token?: string | null,
): Promise<RoleCompetencyRequirement[]> {
  if (USE_MOCKS) {
    const role = ROLE_REQUIREMENTS[roleKey];
    return mock(
      COMPETENCIES.map((c) => ({
        roleKey,
        roleName: role?.name ?? roleKey,
        competencyKey: c.key,
        requiredLevel: role?.levels[c.key] ?? REQUIRED_DEFAULT,
        criticality: c.weight,
      })),
    );
  }
  return request<RoleCompetencyRequirement[]>(`/api/v1/competency/requirements/${roleKey}`, { token });
}
