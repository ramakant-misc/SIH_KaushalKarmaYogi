import {
  AssessmentSchema,
  ContentAssetSchema,
  QuestionSchema,
  type Assessment,
  type ContentAsset,
  type GenerationJob,
  type Question,
} from "@/schemas";
import { COMPETENCY_BY_KEY, COMPETENCIES } from "./competencies";
import { daysFromNow, hash, intBetween, pick, roundTo, rng, validated } from "./seed";
import { DEMO_USER_IDS } from "./users";

/** Uploaded learning material the question generator reads. */
export const CONTENT_ASSETS: ContentAsset[] = [
  {
    id: "asset_001", uploadedBy: DEMO_USER_IDS.administrator,
    fileName: "NSSTA_Sampling_Module_2026.pdf", mimeType: "application/pdf",
    sizeBytes: 4_182_334, kind: "pdf", sourceUrl: null, status: "ready", failureReason: null,
    pageCount: 86, durationSeconds: null, detectedLanguage: "en", extractedWordCount: 24_180,
    createdAt: daysFromNow(-12),
  },
  {
    id: "asset_002", uploadedBy: DEMO_USER_IDS.administrator,
    fileName: "Data_Quality_NQAF_Session.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    sizeBytes: 9_874_112, kind: "pptx", sourceUrl: null, status: "ready", failureReason: null,
    pageCount: 48, durationSeconds: null, detectedLanguage: "en", extractedWordCount: 6_420,
    createdAt: daysFromNow(-8),
  },
  {
    id: "asset_003", uploadedBy: DEMO_USER_IDS.administrator,
    fileName: "Python_for_Statistics_Lecture3.mp4", mimeType: "video/mp4",
    sizeBytes: 412_889_120, kind: "video", sourceUrl: null, status: "parsing", failureReason: null,
    pageCount: null, durationSeconds: 4_260, detectedLanguage: "en", extractedWordCount: null,
    createdAt: daysFromNow(-1),
  },
  {
    id: "asset_004", uploadedBy: DEMO_USER_IDS.engineer,
    fileName: "DPDP_Act_Guidance_Note.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sizeBytes: 1_204_880, kind: "docx", sourceUrl: null, status: "ready", failureReason: null,
    pageCount: 22, durationSeconds: null, detectedLanguage: "en", extractedWordCount: 8_940,
    createdAt: daysFromNow(-20),
  },
  {
    id: "asset_005", uploadedBy: DEMO_USER_IDS.administrator,
    fileName: "SDG_Indicator_Framework.pdf", mimeType: "application/pdf",
    sizeBytes: 2_004_112, kind: "pdf", sourceUrl: null, status: "failed",
    failureReason: "The PDF is a scanned image with no text layer. Re-upload a searchable PDF, or enable OCR.",
    pageCount: null, durationSeconds: null, detectedLanguage: null, extractedWordCount: null,
    createdAt: daysFromNow(-3),
  },
].map((a) => validated(ContentAssetSchema, a, `ContentAsset(${a.id})`));

export const GENERATION_JOBS: GenerationJob[] = [
  {
    id: "job_001", assetIds: ["asset_001"], requestedBy: DEMO_USER_IDS.administrator,
    status: "succeeded", progressPercent: 100, requestedCount: 20, generatedCount: 20,
    failureReason: null, resultAssessmentId: "assess_sampling_methods",
    createdAt: daysFromNow(-11), completedAt: daysFromNow(-11),
  },
  {
    id: "job_002", assetIds: ["asset_002"], requestedBy: DEMO_USER_IDS.administrator,
    status: "running", progressPercent: 45, requestedCount: 15, generatedCount: 7,
    failureReason: null, resultAssessmentId: null,
    createdAt: daysFromNow(0), completedAt: null,
  },
];

// --- Generated questions -----------------------------------------------------

const STEM_TEMPLATES: Array<(name: string) => string> = [
  (n) => `Which of the following best describes the primary purpose of ${n} in official statistics?`,
  (n) => `A field officer encounters an inconsistency while applying ${n}. What is the correct first step?`,
  (n) => `In the context of ${n}, which statement is INCORRECT?`,
  (n) => `Which quality dimension is most directly affected by a failure in ${n}?`,
  (n) => `When documenting a statistical product, how should ${n} be recorded?`,
];

const DISTRACTOR_TEMPLATES: Array<(n: string) => string> = [
  (n) => `It replaces the need for validation when ${n} is applied correctly.`,
  (n) => `${n[0]!.toUpperCase()}${n.slice(1)} is only required for surveys with a sample size above one lakh.`,
  (n) => `${n[0]!.toUpperCase()}${n.slice(1)} applies exclusively to administrative data, not survey data.`,
  (n) => `${n[0]!.toUpperCase()}${n.slice(1)} is determined by the state directorate rather than the national framework.`,
];

const buildQuestion = (competencyKey: string, index: number, assessmentId: string | null): Question => {
  const comp = COMPETENCY_BY_KEY[competencyKey];
  const name = comp?.name ?? competencyKey;
  const id = `q_${competencyKey}_${index}`;
  const r = rng(hash(id));
  const template = STEM_TEMPLATES[index % STEM_TEMPLATES.length]!;
  const correctIndex = intBetween(0, 3, r());

  const options = Array.from({ length: 4 }, (_, i) => {
    const isCorrect = i === correctIndex;
    return {
      id: ["a", "b", "c", "d"][i]!,
      text: isCorrect
        ? `It provides a documented, reproducible basis for ${name.toLowerCase()} so that estimates remain comparable across rounds.`
        : DISTRACTOR_TEMPLATES[(i + index) % DISTRACTOR_TEMPLATES.length]!(name.toLowerCase()),
      isCorrect,
      rationale: isCorrect
        ? null
        : `Incorrect — this conflicts with the framework's treatment of ${name.toLowerCase()}; see the source material.`,
    };
  });

  return validated(
    QuestionSchema,
    {
      id,
      assessmentId,
      type: "mcq_single",
      stem: template(name),
      options,
      explanation: `${name} exists to make statistical output reproducible and comparable. The correct option is the only one consistent with the Competency Framework for Official Statistics (v2026.1); the others describe scope limits or substitutions that the framework does not permit.`,
      difficulty: pick(["easy", "medium", "hard"] as const, r()),
      bloomLevel: pick(["remember", "understand", "apply", "analyze"] as const, r()),
      competencyKeys: [competencyKey],
      language: "en",
      sourceAssetId: "asset_001",
      sourceSnippet: `…the ${name.toLowerCase()} procedure must be documented in the quality declaration accompanying every release, so that downstream users can assess comparability across rounds…`,
      sourcePage: intBetween(4, 82, r()),
      generationConfidence: roundTo(0.55 + r() * 0.44, 2),
      reviewStatus: index % 5 === 0 ? "pending" : index % 7 === 0 ? "edited" : "approved",
      createdAt: daysFromNow(-intBetween(1, 12, r())),
    },
    `Question(${id})`,
  );
};

/** 10 questions per competency, generated on demand and cached. */
const questionCache = new Map<string, Question[]>();

export function questionsForCompetency(competencyKey: string): Question[] {
  const cached = questionCache.get(competencyKey);
  if (cached) return cached;
  const built = Array.from({ length: 10 }, (_, i) =>
    buildQuestion(competencyKey, i, `assess_${competencyKey}`),
  );
  questionCache.set(competencyKey, built);
  return built;
}

/** The review queue: everything generated by the most recent jobs. */
export const REVIEW_QUEUE: Question[] = [
  ...questionsForCompetency("sampling_methods"),
  ...questionsForCompetency("data_quality"),
  ...questionsForCompetency("data_privacy"),
];

// --- Assessments -------------------------------------------------------------

export const ASSESSMENTS: Assessment[] = COMPETENCIES.slice(0, 16).map((comp, i) => {
  const r = rng(hash(`assess-${comp.key}`));
  return validated(
    AssessmentSchema,
    {
      id: `assess_${comp.key}`,
      title: `${comp.name} — Competency Assessment`,
      description: `Confirms your current level in ${comp.name}. Your result updates your competency profile and re-ranks your skill gaps and recommendations.`,
      kind: i % 4 === 0 ? "adaptive" : i % 3 === 0 ? "diagnostic" : "course_quiz",
      competencyKeys: [comp.key],
      domains: [comp.domain],
      questionCount: 10,
      durationMinutes: intBetween(15, 40, r()),
      passPercent: 60,
      maxAttempts: 3,
      isAdaptive: i % 4 === 0,
      status: "published",
      linkedCourseId: null,
      createdBy: DEMO_USER_IDS.administrator,
      createdAt: daysFromNow(-intBetween(30, 300, r())),
    },
    `Assessment(${comp.key})`,
  );
});

export const ASSESSMENT_BY_ID: Record<string, Assessment> = Object.fromEntries(
  ASSESSMENTS.map((a) => [a.id, a]),
);
