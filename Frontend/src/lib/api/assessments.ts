import { USE_MOCKS } from "./config";
import { request } from "./http";
import { mock, paginate } from "./mock";
import {
  ASSESSMENTS, ASSESSMENT_BY_ID, COMPETENCY_BY_KEY, DEMO_USER_IDS,
  courseIdsForCompetency, questionsForCompetency,
} from "@/mocks";
import type {
  Assessment, Attempt, AttemptResult, LearnerQuestion, Paginated, Question,
} from "@/schemas";

const currentUserId = () => DEMO_USER_IDS.employee;

/** Strips the answer key. In production this MUST happen server-side. */
const toLearnerQuestion = (q: Question): LearnerQuestion => ({
  id: q.id,
  assessmentId: q.assessmentId,
  type: q.type,
  stem: q.stem,
  options: q.options.map((o) => ({ id: o.id, text: o.text })),
  difficulty: q.difficulty,
  bloomLevel: q.bloomLevel,
  competencyKeys: q.competencyKeys,
  language: q.language,
  sourceAssetId: q.sourceAssetId,
  sourcePage: q.sourcePage,
  createdAt: q.createdAt,
});

const questionsFor = (assessmentId: string): Question[] => {
  const assessment = ASSESSMENT_BY_ID[assessmentId];
  const key = assessment?.competencyKeys[0] ?? assessmentId.replace(/^assess_/, "");
  return questionsForCompetency(key);
};

// @replace_with_real_API "GET /api/v1/assessments"
export async function listAssessments(
  query: { cursor?: string; limit?: number } = {},
  token?: string | null,
): Promise<Paginated<Assessment>> {
  if (USE_MOCKS) return mock(paginate(ASSESSMENTS, query.cursor, query.limit ?? 20));
  return request<Paginated<Assessment>>("/api/v1/assessments", { query, token });
}

// @replace_with_real_API "GET /api/v1/assessments/:assessmentId"
export async function getAssessment(assessmentId: string, token?: string | null): Promise<Assessment> {
  if (USE_MOCKS) {
    const assessment = ASSESSMENT_BY_ID[assessmentId];
    if (!assessment) throw new Error(`Assessment not found: ${assessmentId}`);
    return mock(assessment);
  }
  return request<Assessment>(`/api/v1/assessments/${assessmentId}`, { token });
}

// @replace_with_real_API "POST /api/v1/assessments/:assessmentId/attempts"
export async function startAttempt(
  assessmentId: string,
  token?: string | null,
): Promise<{ attempt: Attempt; questions: LearnerQuestion[] }> {
  if (USE_MOCKS) {
    const questions = questionsFor(assessmentId);
    return mock({
      attempt: {
        id: `attempt_${assessmentId}_${Date.now()}`,
        assessmentId,
        userId: currentUserId(),
        status: "in_progress" as const,
        responses: [],
        scorePercent: null,
        passed: null,
        competencyBreakdown: [],
        startedAt: new Date().toISOString(),
        submittedAt: null,
      },
      questions: questions.map(toLearnerQuestion),
    });
  }
  return request(`/api/v1/assessments/${assessmentId}/attempts`, { method: "POST", token });
}

// @replace_with_real_API "PATCH /api/v1/attempts/:attemptId"
export async function saveAttempt(
  attemptId: string,
  responses: Attempt["responses"],
  token?: string | null,
): Promise<Attempt> {
  if (USE_MOCKS) {
    const assessmentId = attemptId.split("_").slice(1, -1).join("_");
    return mock({
      id: attemptId,
      assessmentId,
      userId: currentUserId(),
      status: "in_progress" as const,
      responses,
      scorePercent: null,
      passed: null,
      competencyBreakdown: [],
      startedAt: new Date().toISOString(),
      submittedAt: null,
    });
  }
  return request<Attempt>(`/api/v1/attempts/${attemptId}`, { method: "PATCH", body: { responses }, token });
}

// @replace_with_real_API "POST /api/v1/attempts/:attemptId/submit"
export async function submitAttempt(
  attemptId: string,
  responses: Attempt["responses"],
  token?: string | null,
): Promise<AttemptResult> {
  if (USE_MOCKS) {
    const assessmentId = attemptId.split("_").slice(1, -1).join("_");
    const questions = questionsFor(assessmentId);
    const assessment = ASSESSMENT_BY_ID[assessmentId];

    const scored = responses.map((r) => {
      const question = questions.find((q) => q.id === r.questionId);
      const correctIds = question?.options.filter((o) => o.isCorrect).map((o) => o.id) ?? [];
      const isCorrect =
        correctIds.length === r.selectedOptionIds.length &&
        correctIds.every((id) => r.selectedOptionIds.includes(id));
      return { ...r, isCorrect };
    });

    const correct = scored.filter((r) => r.isCorrect).length;
    const scorePercent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const competencyKey = assessment?.competencyKeys[0] ?? "";

    return mock(
      {
        attempt: {
          id: attemptId,
          assessmentId,
          userId: currentUserId(),
          status: "submitted" as const,
          responses: scored,
          scorePercent,
          passed: scorePercent >= (assessment?.passPercent ?? 60),
          competencyBreakdown: [
            {
              competencyKey,
              competencyName: COMPETENCY_BY_KEY[competencyKey]?.name ?? competencyKey,
              correct,
              total: questions.length,
              inferredLevel: Math.min(5, Math.round((scorePercent / 100) * 5)),
            },
          ],
          startedAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
        },
        questions,
        recommendedCourseIds: courseIdsForCompetency(competencyKey).slice(0, 3),
      },
      600,
    );
  }
  return request<AttemptResult>(`/api/v1/attempts/${attemptId}/submit`, {
    method: "POST", body: { responses }, token,
  });
}

// @replace_with_real_API "GET /api/v1/attempts/:attemptId/result"
export async function getAttemptResult(attemptId: string, token?: string | null): Promise<AttemptResult> {
  if (USE_MOCKS) return submitAttempt(attemptId, [], token);
  return request<AttemptResult>(`/api/v1/attempts/${attemptId}/result`, { token });
}
