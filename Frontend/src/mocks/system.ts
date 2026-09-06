import {
  SystemHealthSchema,
  type AuditLogEntry,
  type ChatMessage,
  type ChatThread,
  type Notification,
  type SystemHealth,
  type VirtualLab,
} from "@/schemas";
import { ENDPOINT_REGISTRY } from "@/lib/api/registry";
import { daysFromNow, hash, hoursFromNow, intBetween, pick, rng, validated } from "./seed";
import { DEMO_USER_IDS, USER_BY_ID } from "./users";

export const SYSTEM_HEALTH: SystemHealth = validated(
  SystemHealthSchema,
  {
    services: [
      { key: "api", name: "KaushalKarmaYogi API", status: "healthy", latencyP95Ms: 148, errorRatePercent: 0.2, lastCheckedAt: hoursFromNow(-0.05), message: null },
      { key: "postgres", name: "Primary database", status: "healthy", latencyP95Ms: 12, errorRatePercent: 0, lastCheckedAt: hoursFromNow(-0.05), message: null },
      { key: "igot_api", name: "iGOT Karmayogi API", status: "degraded", latencyP95Ms: 2340, errorRatePercent: 6.4, lastCheckedAt: hoursFromNow(-0.1), message: "Elevated latency on the course catalogue endpoint. Serving the last synced snapshot." },
      { key: "question_generator", name: "LLM question generator", status: "healthy", latencyP95Ms: 8600, errorRatePercent: 1.1, lastCheckedAt: hoursFromNow(-0.2), message: null },
      { key: "assistant", name: "AI assistant service", status: "healthy", latencyP95Ms: 1120, errorRatePercent: 0.6, lastCheckedAt: hoursFromNow(-0.1), message: null },
      { key: "object_storage", name: "Content asset storage", status: "healthy", latencyP95Ms: 68, errorRatePercent: 0, lastCheckedAt: hoursFromNow(-0.05), message: null },
    ],
    queues: [
      { key: "content_parse", name: "Content parsing", pending: 3, running: 1, failed24h: 1, oldestPendingAgeSeconds: 420 },
      { key: "question_generation", name: "Question generation", pending: 1, running: 1, failed24h: 0, oldestPendingAgeSeconds: 95 },
      { key: "competency_recompute", name: "Competency recompute", pending: 12, running: 2, failed24h: 0, oldestPendingAgeSeconds: 60 },
      { key: "igot_sync", name: "iGOT catalogue sync", pending: 0, running: 0, failed24h: 2, oldestPendingAgeSeconds: null },
    ],
    integrations: [
      { key: "igot_catalogue", name: "iGOT Karmayogi — course catalogue", isConnected: true, lastSyncAt: hoursFromNow(-7), lastSyncStatus: "partial", recordsSynced: 1284, nextSyncAt: hoursFromNow(17), credentialExpiresAt: daysFromNow(38), message: "184 records skipped: missing competency mapping." },
      { key: "igot_enrolment", name: "iGOT Karmayogi — enrolment sync", isConnected: true, lastSyncAt: hoursFromNow(-2), lastSyncStatus: "success", recordsSynced: 96, nextSyncAt: hoursFromNow(4), credentialExpiresAt: daysFromNow(38), message: null },
      { key: "clerk_webhook", name: "Clerk user webhook", isConnected: true, lastSyncAt: hoursFromNow(-0.4), lastSyncStatus: "success", recordsSynced: 3, nextSyncAt: null, credentialExpiresAt: null, message: null },
      { key: "nssta_tpac", name: "NSSTA TPAC programme feed", isConnected: false, lastSyncAt: null, lastSyncStatus: "never_run", recordsSynced: null, nextSyncAt: null, credentialExpiresAt: null, message: "Not yet configured. Programmes are maintained manually until the feed is available." },
    ],
    uptimePercent30d: 99.82,
    computedAt: hoursFromNow(-0.05),
  },
  "SystemHealth",
);

const ACTIONS = [
  { action: "role.updated", resourceType: "User" },
  { action: "programme.nominated", resourceType: "TrainingProgramme" },
  { action: "assessment.published", resourceType: "Assessment" },
  { action: "question.approved", resourceType: "Question" },
  { action: "asset.uploaded", resourceType: "ContentAsset" },
  { action: "integration.sync_triggered", resourceType: "Integration" },
  { action: "report.exported", resourceType: "Report" },
  { action: "profile.updated", resourceType: "OfficialProfile" },
] as const;

export const AUDIT_LOG: AuditLogEntry[] = Array.from({ length: 60 }, (_, i) => {
  const r = rng(hash(`audit-${i}`));
  const actorId = pick(Object.values(DEMO_USER_IDS), r());
  const actor = USER_BY_ID[actorId]!;
  const entry = pick(ACTIONS, r());
  return {
    id: `audit_${String(i + 1).padStart(4, "0")}`,
    actorId,
    actorName: actor.fullName,
    actorRole: actor.role,
    action: entry.action,
    resourceType: entry.resourceType,
    resourceId: `res_${intBetween(1000, 9999, r())}`,
    ipAddress: `10.${intBetween(0, 40, r())}.${intBetween(0, 255, r())}.${intBetween(1, 254, r())}`,
    metadata: { source: "web", requestId: `req_${hash(`audit-${i}`) % 1000000}` },
    createdAt: hoursFromNow(-i * 3.5),
  };
});

export const VIRTUAL_LABS: VirtualLab[] = [
  { id: "lab_001", title: "Python Data Processing Sandbox", description: "A pre-loaded Jupyter environment with an anonymised PLFS extract for hands-on practice.", technology: "Python + Jupyter", competencyKeys: ["python", "data_quality"], estimatedMinutes: 90, difficulty: "beginner", status: "available", launchUrl: null },
  { id: "lab_002", title: "QGIS District Mapping Lab", description: "Map a district-level indicator from raw shapefiles and a statistical extract.", technology: "QGIS", competencyKeys: ["gis", "data_visualization"], estimatedMinutes: 120, difficulty: "intermediate", status: "available", launchUrl: null },
  { id: "lab_003", title: "Machine Learning Model Evaluation", description: "Train and honestly evaluate a classifier, then decide whether it belongs in an official estimate.", technology: "Python + scikit-learn", competencyKeys: ["ai_ml", "ethics"], estimatedMinutes: 150, difficulty: "advanced", status: "available", launchUrl: null },
  { id: "lab_004", title: "Government Cloud Deployment", description: "Deploy a containerised statistical service to an empanelled cloud sandbox.", technology: "Docker + Cloud Sandbox", competencyKeys: ["cloud_computing", "government_cloud"], estimatedMinutes: 120, difficulty: "intermediate", status: "unavailable", launchUrl: null },
  { id: "lab_005", title: "Statistical Disclosure Control Workshop", description: "Apply anonymisation and disclosure control to a unit-level dataset before release.", technology: "R + sdcMicro", competencyKeys: ["data_privacy", "data_quality"], estimatedMinutes: 100, difficulty: "advanced", status: "available", launchUrl: null },
];

export function buildNotifications(userId: string): Notification[] {
  const seeds: Array<Omit<Notification, "id" | "userId">> = [
    { kind: "recommendation", title: "3 new courses match your top skill gap", body: "Your Data Privacy gap is now critical. Three iGOT courses close it.", href: "/competency/gaps", isRead: false, createdAt: hoursFromNow(-3) },
    { kind: "nomination", title: "You have been nominated for TPAC/2026/DS-12", body: "Data Science for Official Statistics — starts in 21 days at NSSTA, Greater Noida.", href: "/programmes", isRead: false, createdAt: hoursFromNow(-27) },
    { kind: "deadline", title: "Course due in 5 days", body: "Machine Learning Foundations for Statisticians is due soon.", href: "/my-courses", isRead: false, createdAt: hoursFromNow(-50) },
    { kind: "assessment_result", title: "Assessment scored: Sampling", body: "You scored 78%. Your Sampling level moved from Working to Practitioner.", href: "/competency", isRead: true, createdAt: daysFromNow(-6) },
    { kind: "certificate", title: "Certificate issued", body: "Your certificate for SQL for Data Analysts in Government is ready.", href: "/certificates", isRead: true, createdAt: daysFromNow(-12) },
    { kind: "system", title: "Competency framework updated to v2026.1", body: "Required levels for your role were refreshed. Your gaps have been recalculated.", href: "/competency", isRead: true, createdAt: daysFromNow(-20) },
  ];
  return seeds.map((s, i) => ({ ...s, id: `notif_${hash(`${userId}-${i}`) % 1000000}`, userId }));
}

// --- AI assistant ------------------------------------------------------------

export function buildChatThreads(userId: string): ChatThread[] {
  const seeds = [
    { title: "How do I close my Data Privacy gap?", preview: "Start with Data Privacy and the DPDP Act for Statisticians — it takes you from Working to Practitioner…", ago: 2 },
    { title: "Explain design effects in PLFS", preview: "A design effect compares the variance of your complex design against simple random sampling…", ago: 26 },
    { title: "Which Python course should I take first?", preview: "Given your current level of 2 in Python, Intermediate Python: Automating Statistical Workflows is…", ago: 74 },
  ];
  return seeds.map((s, i) => ({
    id: `thread_${hash(`${userId}-${i}`) % 1000000}`,
    userId,
    title: s.title,
    lastMessagePreview: s.preview,
    messageCount: intBetween(2, 8, rng(hash(`tc-${userId}-${i}`))()),
    createdAt: hoursFromNow(-s.ago - 1),
    updatedAt: hoursFromNow(-s.ago),
  }));
}

export function buildChatMessages(threadId: string, userId: string): ChatMessage[] {
  const thread = buildChatThreads(userId).find((t) => t.id === threadId);
  if (!thread) return [];
  return [
    {
      id: `msg_${hash(`${threadId}-1`) % 1000000}`,
      threadId,
      role: "user",
      content: thread.title,
      citations: [],
      feedback: null,
      createdAt: thread.createdAt,
    },
    {
      id: `msg_${hash(`${threadId}-2`) % 1000000}`,
      threadId,
      role: "assistant",
      content: `${thread.lastMessagePreview}\n\nBased on your competency profile, here is what I would do:\n\n1. **Take the foundational course first** — it is the shortest path from your current level to the level your role requires.\n2. **Sit the competency assessment straight after.** Your profile currently records this competency from self-declared evidence only, so the assessment both confirms the level and raises the confidence score.\n3. **Apply it on your current assignment.** Practical application is what moves you from Working to Practitioner.\n\nWould you like me to add these to your learning pathway?`,
      citations: [
        { kind: "course", refId: "course_030", label: "Data Privacy and the DPDP Act for Statisticians", href: "/courses/course_030" },
        { kind: "competency", refId: "data_privacy", label: "Data Privacy", href: "/competency" },
      ],
      feedback: null,
      createdAt: thread.updatedAt,
    },
  ];
}

/** Suggested prompts, seeded from the signed-in user's own gaps. */
export const SUGGESTED_PROMPTS = [
  "What should I learn next to close my biggest skill gap?",
  "Explain design effects in complex survey sampling.",
  "Which iGOT courses count towards my National Accounts requirement?",
  "Summarise the DPDP Act obligations for releasing unit-level data.",
  "How do I move from Working to Practitioner in Python?",
];

/** The API registry, exposed to the engineer dashboard. */
export const API_REGISTRY = ENDPOINT_REGISTRY;
