import { USE_MOCKS } from "./config";
import { request } from "./http";
import { mock, paginate } from "./mock";
import { CONTENT_ASSETS, GENERATION_JOBS, REVIEW_QUEUE, DEMO_USER_IDS } from "@/mocks";
import type {
  Assessment, ContentAsset, GenerationJob, GenerationRequest, Paginated, Question,
} from "@/schemas";

/** Trainer-facing content upload and AI question generation. */

// @replace_with_real_API "GET /api/v1/studio/assets"
export async function listAssets(
  query: { cursor?: string; limit?: number } = {},
  token?: string | null,
): Promise<Paginated<ContentAsset>> {
  if (USE_MOCKS) return mock(paginate([...CONTENT_ASSETS].reverse(), query.cursor, query.limit ?? 20));
  return request<Paginated<ContentAsset>>("/api/v1/studio/assets", { query, token });
}

// @replace_with_real_API "POST /api/v1/studio/assets"
export async function uploadAsset(file: File, token?: string | null): Promise<ContentAsset> {
  if (USE_MOCKS) {
    const kind: ContentAsset["kind"] = file.type.includes("pdf")
      ? "pdf"
      : file.type.includes("presentation") ? "pptx"
      : file.type.includes("word") ? "docx"
      : file.type.startsWith("video/") ? "video"
      : "text";
    return mock(
      {
        id: `asset_new_${Date.now()}`,
        uploadedBy: DEMO_USER_IDS.administrator,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        kind,
        sourceUrl: null,
        // Real uploads return immediately as queued and parse asynchronously.
        status: "queued" as const,
        failureReason: null,
        pageCount: null,
        durationSeconds: null,
        detectedLanguage: null,
        extractedWordCount: null,
        createdAt: new Date().toISOString(),
      },
      700,
    );
  }
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/studio/assets`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error("Upload failed");
  return ((await response.json()) as { data: ContentAsset }).data;
}

// @replace_with_real_API "DELETE /api/v1/studio/assets/:assetId"
export async function deleteAsset(assetId: string, token?: string | null): Promise<void> {
  if (USE_MOCKS) return mock(undefined);
  return request<void>(`/api/v1/studio/assets/${assetId}`, { method: "DELETE", token });
}

// @replace_with_real_API "POST /api/v1/studio/generate"
export async function generateQuestions(
  input: GenerationRequest,
  token?: string | null,
): Promise<GenerationJob> {
  if (USE_MOCKS)
    return mock(
      {
        id: `job_new_${Date.now()}`,
        assetIds: input.assetIds,
        requestedBy: DEMO_USER_IDS.administrator,
        status: "running" as const,
        progressPercent: 5,
        requestedCount: input.questionCount,
        generatedCount: 0,
        failureReason: null,
        resultAssessmentId: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      800,
    );
  return request<GenerationJob>("/api/v1/studio/generate", { method: "POST", body: input, token });
}

/** Mock job progression, so the UI's polling loop is exercised realistically. */
const jobProgress = new Map<string, number>();

// @replace_with_real_API "GET /api/v1/studio/jobs/:jobId"
export async function getGenerationJob(jobId: string, token?: string | null): Promise<GenerationJob> {
  if (USE_MOCKS) {
    const existing = GENERATION_JOBS.find((j) => j.id === jobId);
    if (existing && !jobId.startsWith("job_new_")) return mock(existing);

    const previous = jobProgress.get(jobId) ?? 5;
    const next = Math.min(100, previous + 25);
    jobProgress.set(jobId, next);
    const done = next >= 100;
    return mock({
      id: jobId,
      assetIds: ["asset_001"],
      requestedBy: DEMO_USER_IDS.administrator,
      status: done ? ("succeeded" as const) : ("running" as const),
      progressPercent: next,
      requestedCount: 20,
      generatedCount: Math.round((next / 100) * 20),
      failureReason: null,
      resultAssessmentId: done ? "assess_sampling_methods" : null,
      createdAt: new Date().toISOString(),
      completedAt: done ? new Date().toISOString() : null,
    });
  }
  return request<GenerationJob>(`/api/v1/studio/jobs/${jobId}`, { token });
}

// @replace_with_real_API "GET /api/v1/studio/questions"
export async function listGeneratedQuestions(
  query: { jobId?: string; assessmentId?: string; reviewStatus?: string[]; cursor?: string; limit?: number } = {},
  token?: string | null,
): Promise<Paginated<Question>> {
  if (USE_MOCKS) {
    let items = [...REVIEW_QUEUE];
    if (query.reviewStatus?.length)
      items = items.filter((q) => query.reviewStatus!.includes(q.reviewStatus));
    // Riskiest first: lowest generator confidence at the top of the queue.
    items.sort((a, b) => (a.generationConfidence ?? 1) - (b.generationConfidence ?? 1));
    return mock(paginate(items, query.cursor, query.limit ?? 20));
  }
  return request<Paginated<Question>>("/api/v1/studio/questions", { query, token });
}

// @replace_with_real_API "PATCH /api/v1/studio/questions/:questionId"
export async function reviewQuestion(
  questionId: string,
  patch: Partial<Pick<Question, "stem" | "options" | "explanation" | "difficulty" | "reviewStatus">>,
  token?: string | null,
): Promise<Question> {
  if (USE_MOCKS) {
    const question = REVIEW_QUEUE.find((q) => q.id === questionId);
    if (!question) throw new Error(`Question not found: ${questionId}`);
    return mock({ ...question, ...patch });
  }
  return request<Question>(`/api/v1/studio/questions/${questionId}`, { method: "PATCH", body: patch, token });
}

// @replace_with_real_API "POST /api/v1/studio/assessments"
export async function publishAssessment(
  input: {
    title: string; description: string; kind: Assessment["kind"]; questionIds: string[];
    durationMinutes: number; passPercent: number; maxAttempts: number | null;
    isAdaptive: boolean; linkedCourseId?: string | null;
  },
  token?: string | null,
): Promise<Assessment> {
  if (USE_MOCKS)
    return mock({
      id: `assess_new_${Date.now()}`,
      title: input.title,
      description: input.description,
      kind: input.kind,
      competencyKeys: [],
      domains: [],
      questionCount: input.questionIds.length,
      durationMinutes: input.durationMinutes,
      passPercent: input.passPercent,
      maxAttempts: input.maxAttempts,
      isAdaptive: input.isAdaptive,
      status: "published" as const,
      linkedCourseId: input.linkedCourseId ?? null,
      createdBy: DEMO_USER_IDS.administrator,
      createdAt: new Date().toISOString(),
    });
  return request<Assessment>("/api/v1/studio/assessments", { method: "POST", body: input, token });
}
