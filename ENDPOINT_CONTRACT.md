# ENDPOINT_CONTRACT.md

**Project:** KaushalKarmaYogi — AI-enabled Skill Intelligence & Learning Platform
**Audience:** the backend team
**Status:** v1.0 — every endpoint below is currently served by **mock data** in the frontend.

This document is the agreement between the frontend (this repo) and the backend. The frontend
is already built against these exact shapes, so an endpoint that matches this contract drops in
with **no frontend changes**.

---

## How to use this document

1. Pick a model below. Its **fields** are the JSON the frontend expects.
2. Implement the endpoints in its **Endpoints needed** table.
3. Tell us, and we flip one line in `Frontend/src/lib/api/registry.ts` from `MOCK` to `LIVE`
   and delete the mock branch in the matching `Frontend/src/lib/api/<resource>.ts` function.

**The authoritative shapes are the Zod schemas in `Frontend/src/schemas/`.** This document is
the human-readable view of them. Where the two disagree, the schema wins — it is executable and
CI-checked. Run `npm run contract:check` in `Frontend/` to verify this file and the registry agree.

### Conventions that apply to every endpoint

| Rule | Detail |
|---|---|
| Base URL | `/api/v1` — set by `NEXT_PUBLIC_API_BASE_URL` |
| Auth | `Authorization: Bearer <Clerk session token>`. Verify it server-side with `@clerk/express`. |
| Role | Read from the Clerk session claim `publicMetadata.role` ∈ `employee` \| `administrator` \| `engineer`. **Enforce on the server** — never trust the client. |
| Success | `{ "data": <payload>, "meta": { "requestId": "...", "generatedAt": "..." } }` |
| Error | `{ "error": { "code": "...", "message": "...", "fields": {...}, "requestId": "..." } }` |
| Error codes | `BAD_REQUEST`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION_FAILED`, `RATE_LIMITED`, `UPSTREAM_UNAVAILABLE`, `INTERNAL` |
| Lists | `{ "items": [...], "pageInfo": { "nextCursor": string\|null, "hasMore": bool, "totalCount": int? } }` |
| Pagination | Cursor-based. `?cursor=&limit=` (limit 1–100, default 20). Cursors are opaque. |
| Timestamps | ISO-8601 **UTC**, e.g. `2026-09-06T11:30:00Z`. Never local time. |
| IDs | Opaque strings. User ids are Clerk ids (`user_2abc…`). |
| Enums | Send the **key**, never the display label. The frontend localises labels. |
| Nulls | Use `null` for "known to be absent". Never omit a documented field. |
| `:userId` = `me` | Every `/:userId` route must accept the literal `me` for the caller. |

### Shared enums

| Enum | Values |
|---|---|
| `Role` | `employee`, `administrator`, `engineer` |
| `CompetencyDomain` | `statistical`, `technical`, `digital_governance`, `behavioural` |
| `ProficiencyLevel` | integer `0`–`5` (0 None, 1 Awareness, 2 Working, 3 Practitioner, 4 Advanced, 5 Expert) |
| `CourseSource` | `igot`, `nssta_tpac`, `internal` |
| `GapSeverity` | `critical`, `high`, `moderate`, `low` |
| `EnrollmentStatus` | `not_started`, `in_progress`, `completed`, `dropped` |
| `Language` | `en`, `hi` |
| `EvidenceSource` | `self_assessment`, `assessment_score`, `course_completion`, `prior_training`, `experience`, `supervisor_endorsement` |

---

## User

- id: string (Clerk user id)
- email: string
- fullName: string
- avatarUrl: string | null
- role: Role
- department: string | null
- designation: string | null
- preferredLanguage: Language
- isProfileComplete: boolean
- createdAt: datetime

## OfficialProfile

- userId: string (relation to User)
- employeeCode: string | null
- cadre: string | null
- department: string
- office: string
- designation: string
- roleKey: string (FRAC role key — drives required competency levels)
- currentAssignment: string
- yearsOfExperience: number
- dateOfJoining: datetime | null
- qualifications: Qualification[] — { degree, institution, yearOfCompletion, specialization }
- priorTrainings: PriorTraining[] — { id, title, provider, completedAt, durationHours, competencyKeys }
- updatedAt: datetime

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/auth/me | Returns the `User` for the bearer token. **Call this first on every page load** — the frontend uses `role` to route the user to their dashboard and `isProfileComplete` to decide whether to force `/onboarding`. If the Clerk user has no `publicMetadata.role`, default to `employee` and persist it. Must be fast (< 100 ms); it blocks first paint. |
| POST | /api/v1/auth/onboarding | Accepts the onboarding wizard body (`OfficialProfile` minus `userId`/`updatedAt`, plus an optional `selfAssessment` map of `competencyKey → level 0-5`). Creates the profile, sets `isProfileComplete = true`, and **seeds the competency baseline**: convert qualifications, years of experience, prior trainings and self-assessment into initial `CompetencyAssessmentRecord`s with `EvidenceSource` set accordingly and a `confidence` below 0.5 (self-declared data is weak evidence). Returns the created `OfficialProfile`. Idempotent — a second call updates rather than duplicates. |
| GET | /api/v1/users/:userId/profile | Reads a service record. `employee` may read only `me`; `administrator` may read anyone in scope. Return `403`, not `404`, when the caller is authenticated but not permitted, so we can show the right message. |
| PATCH | /api/v1/users/:userId/profile | Partial update of own profile from `/profile`. Changing `roleKey`, `designation` or `department` **must trigger a competency recompute**, because required levels come from the FRAC role. |
| PATCH | /api/v1/users/:userId/role | Administrator-only. Writes `publicMetadata.role` in Clerk (Clerk stays the source of truth for auth) and mirrors it locally. **Must write an AuditLogEntry** with `action = "role.updated"` and the old/new values in `metadata`. Reject an administrator demoting themselves — return `CONFLICT` — so an org can't lock itself out. |

---

## CompetencyFramework

- id: string
- version: string (e.g. `2026.1`)
- name: string
- owner: string (e.g. NSSTA)
- isActive: boolean
- competencies: Competency[]
- publishedAt: datetime

## Competency

- key: string (stable slug, e.g. `sampling_methods` — **never renumber these**, everything joins on them)
- name: string
- domain: CompetencyDomain
- description: string
- weight: number 0–1 (importance within its domain; used to rank gaps)
- levelDescriptors: string[6] (what levels 0–5 mean for this competency)

## RoleCompetencyRequirement

- roleKey: string
- roleName: string
- competencyKey: string (relation to Competency)
- requiredLevel: ProficiencyLevel
- criticality: number 0–1

## CompetencyAssessmentRecord

- competencyKey: string
- competencyName: string
- domain: CompetencyDomain
- currentLevel: ProficiencyLevel
- requiredLevel: ProficiencyLevel
- confidence: number 0–1
- evidence: Evidence[] — { source: EvidenceSource, label, contributedAt, weight }
- lastAssessedAt: datetime | null
- history: { at: datetime, level: ProficiencyLevel }[] (oldest first — drives the sparkline)

## CompetencyProfile

- userId: string
- frameworkVersion: string
- overallScore: number 0–100
- domainScores: { domain, score 0–100, averageCurrentLevel, averageRequiredLevel }[] (**all four domains, always** — send a zero row rather than omitting one, or the radar chart collapses)
- records: CompetencyAssessmentRecord[]
- computedAt: datetime

## SkillGap

- competencyKey: string
- competencyName: string
- domain: CompetencyDomain
- currentLevel: ProficiencyLevel
- requiredLevel: ProficiencyLevel
- gap: integer 0–5 (`requiredLevel - currentLevel`, floored at 0)
- severity: GapSeverity
- priorityScore: number 0–100 (`gap × weight × criticality`, normalised)
- estimatedHoursToClose: number
- recommendedCourseIds: string[] (relation to Course, best first)

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/competency/framework | Returns the **active** framework with every competency and its six level descriptors. Public — the landing page renders the four domains from it, so it must work unauthenticated. Cache aggressively (it changes only when a new version is published); send `ETag`/`Cache-Control`. |
| GET | /api/v1/competency/profile/:userId | The core read of the whole product. Returns assessed vs required levels for every competency in the active framework, **including competencies at level 0** — the gaps are the point, so never filter them out. `evidence` and `confidence` are not optional: the UI shows the user *why* they were scored, and a low `confidence` is what prompts "take an assessment to confirm". |
| GET | /api/v1/competency/gaps/:userId | Returns gaps **already ranked** by `priorityScore`, descending. Compute the ranking server-side — the frontend deliberately does no derivation, so the same ordering appears on the dashboard, the gap page and in admin reports. Supports `?domain=&severity=&limit=`. `estimatedHoursToClose` should come from the summed duration of `recommendedCourseIds`, not a guess. |
| POST | /api/v1/competency/self-assessment | Body: `{ levels: { [competencyKey]: 0-5 } }`. Records `self_assessment` evidence and **recomputes the profile synchronously**, returning the new `CompetencyProfile` so the UI can re-render immediately. Weight self-declared levels low (≤ 0.3) — they should never outrank a real assessment score. |
| GET | /api/v1/competency/requirements/:roleKey | The FRAC target matrix for a role. Used by the admin framework view and to explain "why is this required for me?". |

---

## Course

- id: string
- externalId: string | null (iGOT course id, e.g. `do_31234…`, when `source = igot`)
- source: CourseSource
- title, summary, description: string
- provider: string
- thumbnailUrl: string(url) | null
- durationMinutes: integer
- level: `beginner` | `intermediate` | `advanced`
- languages: Language[]
- competencies: { competencyKey, competencyName, domain, targetLevel }[]
- learningOutcomes: string[]
- prerequisites: string[]
- modules: CourseModule[] — { id, title, contentType: `video`|`document`|`quiz`|`lab`|`external`, durationMinutes, order }
- rating: number 0–5 | null
- ratingCount, enrolledCount: integer
- externalUrl: string(url) | null (deep link into iGOT)
- updatedAt: datetime
- matchScore: number 0–100 *(only when authenticated)*
- matchReasons: string[] *(only when authenticated)*

## TrainingProgramme

- id: string
- code: string (e.g. `TPAC/2026/NA-07`)
- title, description: string
- organisedBy: string
- mode: `classroom` | `online` | `blended`
- venue: string | null
- startsAt, endsAt, nominationDeadline: datetime
- capacity, seatsFilled: integer
- eligibility: string
- competencies: same shape as Course.competencies
- status: `upcoming` | `open` | `closed` | `running` | `completed`

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/courses | Catalogue search. Query: `q`, `domain[]`, `competencyKey[]`, `source[]`, `level[]`, `language[]`, `maxDurationMinutes`, `sort` (`relevance`\|`rating`\|`duration`\|`newest`\|`match`), `cursor`, `limit`. **Works unauthenticated** (public catalogue page); when a valid token is present, additionally populate `matchScore` and `matchReasons` per course from the caller's gaps. `sort=match` is only valid when authenticated — return `BAD_REQUEST` otherwise. This is the highest-traffic endpoint: index on the filter columns and keep p95 < 300 ms. |
| GET | /api/v1/courses/:courseId | Full detail including `modules` (ordered) and `prerequisites`. Accepts either our internal id or the iGOT `externalId`, so deep links from iGOT resolve. |
| GET | /api/v1/programmes | NSSTA TPAC programmes. Query: `status[]`, `mode[]`, `competencyKey[]`, `from`, `to`, `cursor`, `limit`. Default sort: `startsAt` ascending, upcoming first. |
| GET | /api/v1/programmes/:programmeId | Programme detail. Include `seatsFilled` live — the nominate button disables against it. |
| POST | /api/v1/programmes | Administrator-only. Creates a TPAC programme. Validate `endsAt > startsAt` and `nominationDeadline <= startsAt`. |
| PATCH | /api/v1/programmes/:programmeId | Administrator-only. Edit schedule, capacity or eligibility. Reject reducing `capacity` below `seatsFilled` with `CONFLICT`. |
| POST | /api/v1/programmes/:programmeId/nominations | Administrator-only. Body `{ userIds: string[] }` for single or bulk nomination. Must be **atomic against capacity** — if the batch would exceed `capacity`, reject the whole batch with `CONFLICT` rather than partially filling. Creates a `Notification` of kind `nomination` per nominee and an audit entry. |

### iGOT Karmayogi integration note

`source`, `externalId` and `externalUrl` exist so iGOT stays the system of record for its own
courses. Keep the iGOT field mapping in **one adapter module** — the frontend never sees an iGOT
field name, only the `Course` shape above. When iGOT is unreachable, serve the last synced
snapshot and set the integration status to `degraded`; do not fail the catalogue request.

---

## Recommendation

- id: string
- kind: `course` | `programme` | `assessment` | `path`
- refId: string (relation to the thing recommended)
- title, summary: string
- matchScore: number 0–100
- reasonCodes: enum[] — `closes_critical_gap`, `role_requirement`, `department_priority`, `career_progression`, `emerging_technology`, `peers_completed`, `continues_path`, `low_confidence_needs_assessment`
- reasons: string[] (display text, parallel to reasonCodes)
- competencyKeys: string[]
- severity: GapSeverity | null

## LearningPath

- id, userId: string
- title: string
- rationale: string (plain-language "why this path")
- targetCompetencyKeys: string[]
- milestones: PathwayMilestone[] — { id, order, kind: `course`|`programme`|`assessment`|`lab`|`certificate`, refId, title, estimatedMinutes, status: `locked`|`available`|`in_progress`|`completed`|`skipped`, competencyKeys }
- progressPercent: number 0–100
- totalEstimatedMinutes: integer
- estimatedCompletionAt: datetime | null
- createdAt, updatedAt: datetime

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/recommendations | The "next best actions" on the employee dashboard, ranked by `matchScore`. Query: `limit` (default 5), `kind[]`. **`reasonCodes` are mandatory and machine-stable** — the UI renders an explanation chip per code, and a recommendation with no reason is not shippable in a government product. Recommendations must consider, per the problem statement: current level, learning history, departmental priority, future role requirements and emerging technologies. |
| GET | /api/v1/learning-paths | The caller's pathways. Usually one active path; return an empty list (not 404) for a new user so the UI shows the "generate my path" empty state. |
| GET | /api/v1/learning-paths/:pathId | Pathway detail with milestones **in `order`**. `status` must respect prerequisites: a milestone is `locked` until the preceding one completes. |
| POST | /api/v1/learning-paths/generate | Body `{ targetCompetencyKeys?: string[], maxWeeklyHours?: number }`. Generates a sequenced path from the caller's current gaps, respecting course prerequisites and available weekly hours. May run async — if so, return `202` with a job id; if synchronous, return the `LearningPath`. Regenerating replaces the active path but **must preserve completed milestone state**. |

---

## Enrollment

- id, userId: string
- kind: `course` | `programme`
- refId: string
- title: string
- thumbnailUrl: string(url) | null
- status: EnrollmentStatus
- progressPercent: number 0–100
- resumeModuleId: string | null
- minutesSpent: integer
- isBookmarked: boolean
- enrolledAt: datetime
- completedAt: datetime | null
- dueAt: datetime | null

## Certificate

- id, userId: string
- title, issuedBy: string
- issuedAt: datetime
- verificationCode: string
- competencyKeys: string[]
- downloadUrl: string(url) | null

## LearningStats

- userId: string
- hoursThisWeek, hoursThisMonth, hoursTotal: number
- streakDays, coursesCompleted, coursesInProgress, certificatesEarned: integer
- competencyPointsGained: number (level increase summed over the last 90 days)

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/enrollments | Powers `/my-courses`. Query: `status[]`, `kind[]`, `bookmarked`, `cursor`, `limit`. `resumeModuleId` is what makes the "Resume" button work — set it to the first incomplete module, and `null` once complete. |
| POST | /api/v1/enrollments | Body `{ kind, refId }`. For `source = igot` courses this must **proxy the enrolment to the iGOT API** and store the returned upstream id, so progress stays in sync. Return `CONFLICT` if already enrolled rather than creating a duplicate. |
| PATCH | /api/v1/enrollments/:enrollmentId | Updates progress, bookmark, or marks a module complete: `{ progressPercent?, isBookmarked?, completedModuleId? }`. Completing the final module must set `status = completed`, stamp `completedAt`, **add `course_completion` evidence to the relevant competencies**, and trigger a competency recompute. This is the loop that makes the platform self-updating. |
| GET | /api/v1/learning-stats/:userId | Dashboard counters. `streakDays` counts consecutive days with any recorded learning activity. Cheap to call — cache for a few minutes. |
| GET | /api/v1/certificates | Issued certificates, newest first. `verificationCode` must be publicly verifiable without auth (a separate public verify route can come later). |

---

## ContentAsset

- id, uploadedBy: string
- fileName, mimeType: string
- sizeBytes: integer
- kind: `pdf` | `docx` | `pptx` | `video` | `url` | `text`
- sourceUrl: string(url) | null
- status: `queued` | `parsing` | `ready` | `failed`
- failureReason: string | null
- pageCount: integer | null
- durationSeconds: integer | null
- detectedLanguage: Language | null
- extractedWordCount: integer | null
- createdAt: datetime

## Question

- id: string
- assessmentId: string | null
- type: `mcq_single` | `mcq_multi` | `true_false`
- stem: string
- options: { id, text, isCorrect, rationale }[]
- explanation: string
- difficulty: `easy` | `medium` | `hard`
- bloomLevel: `remember` | `understand` | `apply` | `analyze` | `evaluate` | `create`
- competencyKeys: string[]
- language: Language
- sourceAssetId: string | null, sourceSnippet: string | null, sourcePage: integer | null
- generationConfidence: number 0–1 | null
- reviewStatus: `pending` | `approved` | `edited` | `rejected`
- createdAt: datetime

## Assessment

- id: string
- title, description: string
- kind: `diagnostic` | `course_quiz` | `adaptive` | `certification`
- competencyKeys: string[], domains: CompetencyDomain[]
- questionCount, durationMinutes: integer
- passPercent: number 0–100
- maxAttempts: integer | null
- isAdaptive: boolean
- status: `draft` | `published` | `archived`
- linkedCourseId: string | null
- createdBy: string, createdAt: datetime

## GenerationJob

- id: string, assetIds: string[], requestedBy: string
- status: `queued` | `running` | `succeeded` | `failed`
- progressPercent: number 0–100
- requestedCount, generatedCount: integer
- failureReason: string | null
- resultAssessmentId: string | null
- createdAt: datetime, completedAt: datetime | null

## Attempt

- id, assessmentId, userId: string
- status: `in_progress` | `submitted` | `expired`
- responses: { questionId, selectedOptionIds[], isCorrect: boolean|null, timeSpentSeconds }[]
- scorePercent: number 0–100 | null
- passed: boolean | null
- competencyBreakdown: { competencyKey, competencyName, correct, total, inferredLevel 0–5 }[]
- startedAt: datetime, submittedAt: datetime | null

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/studio/assets | Uploaded materials with parse status. The UI **polls this while any asset is `queued`/`parsing`**, so keep it cheap. |
| POST | /api/v1/studio/assets | `multipart/form-data` upload of PDF/DOCX/PPTX/video, or `{ sourceUrl }` for a link. Return `201` immediately with `status = queued` and parse asynchronously — never block the request on extraction. Enforce a size limit and a MIME allowlist; reject anything else with `VALIDATION_FAILED`. Populate `pageCount`/`durationSeconds`/`extractedWordCount` once parsed. |
| DELETE | /api/v1/studio/assets/:assetId | Removes an asset and its extracted text. Refuse (`CONFLICT`) if a published assessment still cites it as a source. |
| POST | /api/v1/studio/generate | **The AI question-generation entry point.** Body: `{ assetIds[], questionCount, difficultyMix{easy,medium,hard}, bloomLevels[], competencyKeys[], language, questionTypes[] }`. Returns a `GenerationJob` to poll. The LLM must produce, per question: stem, options, the correct answer, a plain-language `explanation`, a `rationale` per distractor, and `sourceSnippet` + `sourcePage` for provenance. Set `generationConfidence` so low-confidence items sort to the top of the review queue. Never publish generated questions directly — they land as `reviewStatus = pending`. |
| GET | /api/v1/studio/jobs/:jobId | Poll progress. Return real intermediate `progressPercent` and `generatedCount`; the UI shows a live progress bar and a stalled job is a support call. |
| GET | /api/v1/studio/questions | The review queue. Query: `jobId`, `assessmentId`, `reviewStatus[]`, `competencyKey[]`, `cursor`, `limit`. Default sort: `generationConfidence` ascending, so the riskiest items get human eyes first. |
| PATCH | /api/v1/studio/questions/:questionId | Approve, edit or reject one question. An edit sets `reviewStatus = "edited"` (not `approved`) so we can measure how often the AI needed correction — that metric matters for the evaluation. |
| POST | /api/v1/studio/assessments | Publishes approved questions as an `Assessment`: `{ title, description, kind, questionIds[], durationMinutes, passPercent, maxAttempts, isAdaptive, linkedCourseId?, assignToUserIds?[] }`. Reject if any referenced question is not `approved`/`edited`. |
| GET | /api/v1/assessments | Assessments available to the caller (assigned, or linked to an enrolled course). |
| GET | /api/v1/assessments/:assessmentId | Metadata and instructions. Must **not** include questions. |
| POST | /api/v1/assessments/:assessmentId/attempts | Starts an attempt and returns `{ attempt, questions }` where questions are the **learner-safe shape: `isCorrect`, `rationale`, `explanation` and `sourceSnippet` stripped out**. Leaking the answer key here defeats the assessment — strip server-side, never client-side. Enforce `maxAttempts` with `CONFLICT`. For `isAdaptive`, return the first question only and serve subsequent ones from the running ability estimate. |
| PATCH | /api/v1/attempts/:attemptId | Saves answers mid-attempt so a learner can close the tab and resume: `{ responses[] }`. Reject writes to an attempt that is `submitted` or `expired`. |
| POST | /api/v1/attempts/:attemptId/submit | Scores instantly and returns the full `AttemptResult` — attempt, **full questions with correct answers and explanations**, and `recommendedCourseIds` for what the learner got wrong. Must also write `assessment_score` evidence and trigger a competency recompute: an assessment that doesn't move the profile is just a quiz. |
| GET | /api/v1/attempts/:attemptId/result | Re-reads a submitted result. `404` while the attempt is still `in_progress`. |

---

## ChatThread / ChatMessage

- ChatThread: id, userId, title, lastMessagePreview, messageCount, createdAt, updatedAt
- ChatMessage: id, threadId, role (`user`|`assistant`|`system`), content (markdown), citations[], feedback (`up`|`down`|null), createdAt
- ChatCitation: { kind: `course`|`programme`|`competency`|`document`, refId, label, href }

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/assistant/threads | Conversation list for the sidebar, newest first. |
| POST | /api/v1/assistant/threads | Creates a thread. Body `{ title? }`; derive the title from the first user message if absent. |
| GET | /api/v1/assistant/threads/:threadId | Full message history, oldest first. `403` if the thread is not the caller's. |
| PATCH | /api/v1/assistant/threads/:threadId | Rename: `{ title }`. |
| DELETE | /api/v1/assistant/threads/:threadId | Deletes a thread and its messages. |
| POST | /api/v1/assistant/threads/:threadId/messages | Sends a message and **streams the reply as Server-Sent Events**, one `ChatStreamChunk` (`{ messageId, delta, done, citations? }`) per event, `done: true` last. The frontend already renders token-by-token, so a non-streaming JSON reply will work but will feel broken. Ground answers in the caller's own competency profile, gaps and the course catalogue, and return `citations` so answers link back into the app — an unsourced answer is not acceptable for official guidance. Respect the optional `context` (`courseId` / `competencyKey` / `assetId`) and the caller's role: an administrator asks about the workforce, an employee about their own path. |
| POST | /api/v1/assistant/messages/:messageId/feedback | `{ feedback: "up" \| "down" }`. Store it — it is the training signal for improving the assistant. |

---

## OrgAnalytics

- kpi: { totalOfficials, activeLearners30d, averageCompetencyScore, gapIndex, completionRate, learningHoursDelivered, certificatesIssued, deltas{} }
- heatmap: { department, domain, averageLevel, averageRequiredLevel, officialCount }[]
- gapDistribution: { competencyKey, competencyName, domain, severity, affectedOfficials, averageGap }[]
- effectiveness: { programmeId, programmeTitle, participants, completionRate, preAverageScore, postAverageScore, competencyPointsGained, satisfactionScore, costPerCompetencyPoint }[]
- funnel: { recommended, viewed, enrolled, started, completed, certified }
- forecasts: SkillForecast[] — { competencyKey, competencyName, domain, horizonMonths, currentSupply, projectedDemand, projectedShortfall, confidence, trend }
- emergingSkills: { competencyKey, competencyName, growthPercent, source }[]
- computedAt: datetime

## WorkforceMember

- userId, fullName, designation, department, office: string
- overallScore: number 0–100
- criticalGaps: integer
- learningHours90d: number
- lastTrainingAt, lastActiveAt: datetime | null

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/analytics/overview | One call returns the **entire** administrator dashboard. Query: `from`, `to`, `department[]`, `domain[]`. Deliberately a single endpoint so the dashboard makes one request instead of eight — precompute nightly and serve from a materialised table; do not aggregate across every official on request. Always return all four domains in `heatmap` even when a department has no data (send zeros), or the heatmap grid breaks. |
| GET | /api/v1/analytics/forecast | Predicted competency demand: `?horizonMonths=6\|12&department[]=`. `confidence` is mandatory — the UI renders it as a band, and a forecast presented as certainty is misleading in a workforce-planning decision. |
| GET | /api/v1/workforce | Directory. Query: `q`, `department[]`, `designation[]`, `minScore`, `maxScore`, `severity[]`, `sort`, `cursor`, `limit`. Must support **bulk selection over a filter**, so also accept `?idsOnly=true` returning just `userIds` for a "select all matching" nomination. |
| GET | /api/v1/workforce/:userId | One official's competency profile plus nomination and training history, read-only for the administrator. Scope by department if the deployment requires it. |
| GET | /api/v1/reports/export | Streams the current selection as `text/csv` or `application/pdf` (`?format=csv\|pdf` plus the same filters as the analytics endpoints). Use `Content-Disposition: attachment`. Large exports should stream, not buffer. |

---

## SystemHealth / IntegrationStatus / AuditLogEntry

- ServiceHealth: { key, name, status: `healthy`|`degraded`|`down`|`unknown`, latencyP95Ms, errorRatePercent, lastCheckedAt, message }
- QueueStatus: { key, name, pending, running, failed24h, oldestPendingAgeSeconds }
- IntegrationStatus: { key: `igot_catalogue`|`igot_enrolment`|`clerk_webhook`|`nssta_tpac`, name, isConnected, lastSyncAt, lastSyncStatus: `success`|`partial`|`failed`|`never_run`, recordsSynced, nextSyncAt, credentialExpiresAt, message }
- AuditLogEntry: { id, actorId, actorName, actorRole, action, resourceType, resourceId, ipAddress, metadata{}, createdAt }

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/system/health | Engineer dashboard. Aggregates service, queue and integration health. Must **never itself fail** when a dependency is down — report that dependency as `down` and still return `200`, or the health page goes blank exactly when it is needed. |
| GET | /api/v1/system/integrations | iGOT sync state, webhook status and credential expiry. Surface `credentialExpiresAt` — an expired iGOT credential is the most likely production outage and should be visible before it bites. |
| POST | /api/v1/system/integrations/:key/sync | Engineer-only manual catalogue sync. Return `202` with a job id; reject with `CONFLICT` if a sync is already running. |
| GET | /api/v1/system/audit-log | Filterable trail: `actorId`, `action`, `resourceType`, `from`, `to`, `cursor`, `limit`. **Append-only — no update or delete route exists, by design.** |

---

## Notification / VirtualLab / Contact

- Notification: { id, userId, kind: `recommendation`|`nomination`|`deadline`|`assessment_result`|`certificate`|`system`, title, body, href, isRead, createdAt }
- VirtualLab: { id, title, description, technology, competencyKeys[], estimatedMinutes, difficulty, status: `available`|`provisioning`|`running`|`unavailable`, launchUrl }

Endpoints needed:

| HTTP Method | URL | What it does (explanation) |
|--|--|--|
| GET | /api/v1/notifications | Feed for the bell menu. Query: `isRead`, `cursor`, `limit`. Include an unread count in `meta` so the badge needs no second call. `href` is an **in-app route** (e.g. `/learning-paths/abc`), not an absolute URL. |
| PATCH | /api/v1/notifications/:notificationId | `{ isRead: true }`. Also accept `PATCH /api/v1/notifications` with `{ markAllRead: true }`. |
| GET | /api/v1/labs | Virtual lab catalogue for AI/Data Science/Cloud/Cybersecurity practice. P2 — the UI ships as a designed stub, so a static list is acceptable for v1. |
| POST | /api/v1/labs/:labId/launch | Provisions a lab session and returns `{ launchUrl, expiresAt }`. Return `202` with `status = provisioning` if it takes time. |
| POST | /api/v1/contact | About-page contact form: `{ name, email, organisation?, subject, message }`. Public, so **rate-limit it and add spam protection** — it is the only unauthenticated write endpoint in the system. |

---

## Implementation checklist for a backend endpoint

An endpoint is done when:

- [ ] The response matches the model above **exactly** — same field names, same types, no extra top-level keys.
- [ ] It is wrapped in the standard success envelope, and errors use the standard error envelope with a correct `code`.
- [ ] The role check happens **server-side**, and an unauthorised call returns `403` (not `404`, not `200` with empty data).
- [ ] List endpoints paginate with cursors and accept `limit`.
- [ ] All timestamps are ISO-8601 UTC.
- [ ] Anything that changes competency evidence triggers a profile recompute.
- [ ] Anything that changes roles, nominations or programmes writes an `AuditLogEntry`.
- [ ] It is documented here if the shape changed, and the frontend registry row is flipped to `LIVE`.
