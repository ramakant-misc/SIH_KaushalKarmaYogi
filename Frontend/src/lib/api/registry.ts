import type { EndpointRegistryEntry } from "@/schemas";

/**
 * The single machine-readable list of every endpoint this frontend consumes.
 *
 * This file is the twin of ENDPOINT_CONTRACT.md at the repository root:
 *  - `npm run contract:check` fails if the two drift apart.
 *  - /engineer/api-registry renders this table so the team can see, live,
 *    which endpoints are still MOCK and which have gone LIVE.
 *
 * When a backend endpoint ships: flip `status` to "LIVE" here and delete the
 * mock branch in the matching src/lib/api/<resource>.ts function. Nothing else changes.
 */
export const ENDPOINT_REGISTRY: EndpointRegistryEntry[] = [
  // --- Auth & profile -------------------------------------------------------
  { method: "GET", path: "/api/v1/auth/me", purpose: "Current user, role and profile completeness", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/auth/onboarding", purpose: "Submit the onboarding wizard and seed the competency baseline", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/users/:userId/profile", purpose: "Read an official's service record", requiredRoles: ["employee", "administrator"], status: "MOCK", owner: "backend" },
  { method: "PATCH", path: "/api/v1/users/:userId/profile", purpose: "Update own service record", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "PATCH", path: "/api/v1/users/:userId/role", purpose: "Change a user's role (writes Clerk publicMetadata, audit-logged)", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },

  // --- Competency & gaps ----------------------------------------------------
  { method: "GET", path: "/api/v1/competency/framework", purpose: "Active competency framework with all competencies and level descriptors", requiredRoles: [], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/competency/profile/:userId", purpose: "Assessed levels vs required levels, with evidence and confidence", requiredRoles: ["employee", "administrator"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/competency/gaps/:userId", purpose: "Ranked skill gaps with severity, hours to close and closing courses", requiredRoles: ["employee", "administrator"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/competency/self-assessment", purpose: "Submit self-declared levels; recomputes the profile", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/competency/requirements/:roleKey", purpose: "FRAC required levels for a role", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },

  // --- Catalogue ------------------------------------------------------------
  { method: "GET", path: "/api/v1/courses", purpose: "Search and filter the iGOT + TPAC catalogue; adds matchScore when authenticated", requiredRoles: [], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/courses/:courseId", purpose: "Full course detail with modules, outcomes and competency tags", requiredRoles: [], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/programmes", purpose: "NSSTA TPAC programmes with schedule, capacity and eligibility", requiredRoles: [], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/programmes/:programmeId", purpose: "Programme detail", requiredRoles: [], status: "MOCK", owner: "backend" },

  // --- Recommendations & pathways ------------------------------------------
  { method: "GET", path: "/api/v1/recommendations", purpose: "Ranked next-best-actions with match score and reason codes", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/learning-paths", purpose: "The signed-in user's pathways", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/learning-paths/:pathId", purpose: "Pathway detail with ordered milestones and progress", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/learning-paths/generate", purpose: "Generate a pathway from the user's current gaps", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },

  // --- Enrolment & progress -------------------------------------------------
  { method: "GET", path: "/api/v1/enrollments", purpose: "My courses, filterable by status; powers /my-courses", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/enrollments", purpose: "Enrol in a course or programme (proxies to iGOT for source=igot)", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "PATCH", path: "/api/v1/enrollments/:enrollmentId", purpose: "Update progress, bookmark, or mark a module complete", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/learning-stats/:userId", purpose: "Learning hours, streak and completion counters", requiredRoles: ["employee", "administrator"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/certificates", purpose: "Issued certificates with verification codes", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },

  // --- Assessments (learner) ------------------------------------------------
  { method: "GET", path: "/api/v1/assessments", purpose: "Assessments available to the signed-in user", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/assessments/:assessmentId", purpose: "Assessment metadata and instructions", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/assessments/:assessmentId/attempts", purpose: "Start an attempt; returns learner-safe questions (no answer keys)", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "PATCH", path: "/api/v1/attempts/:attemptId", purpose: "Save answers mid-attempt so the learner can resume", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/attempts/:attemptId/submit", purpose: "Submit, score instantly, and return explanations plus competency breakdown", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/attempts/:attemptId/result", purpose: "Re-read a submitted attempt's result", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },

  // --- Studio: content upload and AI question generation --------------------
  { method: "GET", path: "/api/v1/studio/assets", purpose: "Uploaded learning materials and their parse status", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/studio/assets", purpose: "Upload a PDF/DOCX/PPTX/video/URL for question generation (multipart)", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "DELETE", path: "/api/v1/studio/assets/:assetId", purpose: "Remove an uploaded asset", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/studio/generate", purpose: "Start an LLM job generating MCQs from assets; returns a job to poll", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/studio/jobs/:jobId", purpose: "Poll generation job progress", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/studio/questions", purpose: "Generated questions awaiting review, with provenance and confidence", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "PATCH", path: "/api/v1/studio/questions/:questionId", purpose: "Approve, edit or reject a generated question", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/studio/assessments", purpose: "Publish approved questions as an assessment bound to a course or cohort", requiredRoles: ["administrator", "engineer"], status: "MOCK", owner: "backend" },

  // --- AI assistant ---------------------------------------------------------
  { method: "GET", path: "/api/v1/assistant/threads", purpose: "Conversation list for the sidebar", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/assistant/threads", purpose: "Start a new conversation", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/assistant/threads/:threadId", purpose: "Full message history for a thread", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "PATCH", path: "/api/v1/assistant/threads/:threadId", purpose: "Rename a conversation", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "DELETE", path: "/api/v1/assistant/threads/:threadId", purpose: "Delete a conversation", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/assistant/threads/:threadId/messages", purpose: "Send a message; streams the grounded reply back over SSE", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/assistant/messages/:messageId/feedback", purpose: "Thumbs up/down on an assistant reply", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },

  // --- Administrator --------------------------------------------------------
  { method: "GET", path: "/api/v1/analytics/overview", purpose: "All administrator dashboard data: KPIs, heatmap, gaps, funnel, forecasts", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/analytics/forecast", purpose: "Predicted competency demand for a horizon", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/workforce", purpose: "Searchable directory of officials with scores and gap counts", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/workforce/:userId", purpose: "One official's competency profile and nomination history", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/programmes", purpose: "Create a TPAC programme", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },
  { method: "PATCH", path: "/api/v1/programmes/:programmeId", purpose: "Edit a programme's schedule, capacity or eligibility", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/programmes/:programmeId/nominations", purpose: "Nominate or bulk-assign officials to a programme", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/reports/export", purpose: "Export the current report selection as CSV or PDF", requiredRoles: ["administrator"], status: "MOCK", owner: "backend" },

  // --- Engineer -------------------------------------------------------------
  { method: "GET", path: "/api/v1/system/health", purpose: "Service, queue and integration health for the engineer dashboard", requiredRoles: ["engineer"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/system/integrations", purpose: "iGOT sync state, webhook status and credential expiry", requiredRoles: ["engineer"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/system/integrations/:key/sync", purpose: "Trigger an iGOT catalogue sync manually", requiredRoles: ["engineer"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/system/audit-log", purpose: "Filterable audit trail of who did what", requiredRoles: ["engineer", "administrator"], status: "MOCK", owner: "backend" },

  // --- Shared ---------------------------------------------------------------
  { method: "GET", path: "/api/v1/notifications", purpose: "Notification feed for the bell menu", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "PATCH", path: "/api/v1/notifications/:notificationId", purpose: "Mark a notification read", requiredRoles: ["employee", "administrator", "engineer"], status: "MOCK", owner: "backend" },
  { method: "GET", path: "/api/v1/labs", purpose: "Virtual lab catalogue and provisioning state", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/labs/:labId/launch", purpose: "Provision and launch a lab session", requiredRoles: ["employee"], status: "MOCK", owner: "backend" },
  { method: "POST", path: "/api/v1/contact", purpose: "About-page contact form submission", requiredRoles: [], status: "MOCK", owner: "backend" },
];

export const MOCK_ENDPOINT_COUNT = ENDPOINT_REGISTRY.filter((e) => e.status === "MOCK").length;
export const LIVE_ENDPOINT_COUNT = ENDPOINT_REGISTRY.filter((e) => e.status === "LIVE").length;
