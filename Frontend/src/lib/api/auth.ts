import { USE_MOCKS } from "./config";
import { request } from "./http";
import { mock } from "./mock";
import {
  DEMO_USER_IDS, PROFILES, USER_BY_ID, resolveUserId,
} from "@/mocks";
import type { OfficialProfile, OnboardingInput, Role, User } from "@/schemas";

/**
 * Auth and profile. Clerk owns the session; this layer owns the domain record.
 * In mock mode the "current user" is chosen by the role we are simulating.
 */

let mockRole: Role = "employee";
/** Test hook: lets the mock layer answer as a different role. Removed once live. */
export function setMockRole(role: Role) {
  mockRole = role;
}
const mockCurrentUserId = () => DEMO_USER_IDS[mockRole];

// @replace_with_real_API "GET /api/v1/auth/me"
export async function getMe(token?: string | null): Promise<User> {
  if (USE_MOCKS) return mock(USER_BY_ID[mockCurrentUserId()]!);
  return request<User>("/api/v1/auth/me", { token });
}

// @replace_with_real_API "POST /api/v1/auth/onboarding"
export async function submitOnboarding(
  input: OnboardingInput,
  token?: string | null,
): Promise<OfficialProfile> {
  if (USE_MOCKS) {
    const userId = mockCurrentUserId();
    return mock({
      ...PROFILES[userId]!,
      ...input,
      userId,
      priorTrainings: input.priorTrainings.map((t, i) => ({ ...t, id: `pt_new_${i}` })),
      updatedAt: new Date().toISOString(),
    });
  }
  return request<OfficialProfile>("/api/v1/auth/onboarding", { method: "POST", body: input, token });
}

// @replace_with_real_API "GET /api/v1/users/:userId/profile"
export async function getProfile(userId: string, token?: string | null): Promise<OfficialProfile> {
  if (USE_MOCKS) {
    const id = resolveUserId(userId, mockCurrentUserId());
    const profile = PROFILES[id];
    if (!profile) throw new Error(`No profile fixture for ${id}`);
    return mock(profile);
  }
  return request<OfficialProfile>(`/api/v1/users/${userId}/profile`, { token });
}

// @replace_with_real_API "PATCH /api/v1/users/:userId/profile"
export async function updateProfile(
  userId: string,
  patch: Partial<OfficialProfile>,
  token?: string | null,
): Promise<OfficialProfile> {
  if (USE_MOCKS) {
    const id = resolveUserId(userId, mockCurrentUserId());
    return mock({ ...PROFILES[id]!, ...patch, updatedAt: new Date().toISOString() });
  }
  return request<OfficialProfile>(`/api/v1/users/${userId}/profile`, { method: "PATCH", body: patch, token });
}

// @replace_with_real_API "PATCH /api/v1/users/:userId/role"
export async function updateUserRole(
  userId: string,
  role: Role,
  token?: string | null,
): Promise<User> {
  if (USE_MOCKS) return mock({ ...USER_BY_ID[resolveUserId(userId, mockCurrentUserId())]!, role });
  return request<User>(`/api/v1/users/${userId}/role`, { method: "PATCH", body: { role }, token });
}
