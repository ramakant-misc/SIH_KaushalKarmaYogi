# Implementation Plan — KaushalKarmaYogi

**Companion to:** `PRD.md` (what & why) and `ENDPOINT_CONTRACT.md` (the API contract)
**Scope of this plan:** the frontend (Next.js + Tailwind), authentication & role management
(Clerk), the mock data layer, and the written API contract. Backend business logic, AI services
and iGOT integration are teammate scope and are consumed only through the contract.

Each phase below has a **goal**, the **files it creates**, and a **done-when** check. Phases are
ordered so the app is runnable and demoable from Phase 4 onwards and never regresses.

---

## Phase 0 — Repository scaffolding

**Goal:** two working projects, one command each to run.

1. Create `Frontend/` — `npx create-next-app@latest Frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`.
2. Create `Backend/` — Node + Express + TypeScript, `tsx` for dev, `@clerk/express` for auth.
3. Root `README.md`: what each folder is, how to run both, where the three docs live.
4. `.env.example` in both folders (never commit real keys):
   - Frontend: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_MOCKS`
   - Backend: `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `PORT`, `CORS_ORIGIN`
5. Shared tooling: Prettier + Tailwind class-sorting plugin, ESLint, `npm run typecheck`.

**Done when:** `npm run dev` works in both folders; `npm run build`, `lint`, `typecheck` pass.

---

## Phase 1 — Domain types, Zod schemas and the API contract

**Goal:** the contract exists *before* any UI, and it is executable, not just prose.

1. `Frontend/src/types/` — one file per domain area: `user.ts`, `competency.ts`, `course.ts`,
   `learning.ts`, `assessment.ts`, `analytics.ts`, `chat.ts`, `system.ts`.
2. `Frontend/src/schemas/` — a Zod schema for every entity. **Types are inferred from schemas**
   (`z.infer`), so there is exactly one definition of every shape.
3. Shared API envelope + error shape + pagination + enums (roles, domains, levels, statuses).
4. Write **`ENDPOINT_CONTRACT.md`** at the repo root in the required format: for each model, the
   field list, then an `Endpoints needed` table (`HTTP Method | URL | What it does`). Each
   explanation states what the backend must actually do — required auth role, query params,
   filtering/sorting, pagination, side effects, and which AI service it calls.
5. `Frontend/src/lib/api/registry.ts` — a machine-readable list of every endpoint with its
   `MOCK | LIVE` status. This is the single source the engineer dashboard renders and the
   audit script counts against.

**Done when:** every entity in PRD §8 has a schema and a contract entry, and
`npm run contract:check` (a small script) reports zero mismatches between `registry.ts` and
`ENDPOINT_CONTRACT.md`.

---

## Phase 2 — Mock data layer and the API client

**Goal:** realistic data, contract-shaped, swappable one endpoint at a time.

1. `Frontend/src/mocks/` — fixtures per entity. Realistic Indian statistical-system content:
   MoSPI/NSO/State DES departments, real designations (SSO, JSO, DD, Investigator), the four
   competency domains from PRD §5, plausible iGOT course titles and NSSTA TPAC programmes.
   Fixtures are **validated against their Zod schema at module load** — a shape drift throws in dev.
2. `Frontend/src/lib/api/http.ts` — the single `request()` helper: base URL, auth header from
   Clerk, JSON parsing, typed errors, retry, abort.
3. `Frontend/src/lib/api/mock.ts` — `mock(data, {delayMs})` returning a promise, so loading and
   error states are real, not fake-instant.
4. `Frontend/src/lib/api/<resource>.ts` — one module per resource. Every exported function:
   ```ts
   // @replace_with_real_API "GET /api/v1/courses"
   export async function listCourses(q: CourseQuery): Promise<Paginated<Course>> {
     if (USE_MOCKS) return mock(filterCourses(courseFixtures, q));
     return request<Paginated<Course>>("/api/v1/courses", { query: q });
   }
   ```
   The `USE_MOCKS` branch means flipping one env var moves the whole app to the real backend,
   and removing a single line moves one endpoint at a time.
5. TanStack Query hooks in `Frontend/src/hooks/` wrapping each client function.
6. `scripts/audit-mocks.ts` — fails CI if a `@replace_with_real_API` tag has no matching row in
   `ENDPOINT_CONTRACT.md`, or vice versa.

**Done when:** every planned endpoint has a tagged client function, a fixture, and a hook.

---

## Phase 3 — Design system

**Goal:** every later page is assembly, not invention.

1. Tailwind theme tokens: an India-government-appropriate palette (deep indigo/navy primary,
   saffron accent used sparingly, semantic success/warning/danger), spacing, radius, shadow,
   typography scale. Dark mode via `class` strategy.
2. Primitives in `Frontend/src/components/ui/`: Button, Input, Select, Checkbox, Radio, Textarea,
   Card, Badge, Tabs, Table, Modal, Drawer, Tooltip, Dropdown, Toast, Avatar, Progress, Skeleton,
   EmptyState, ErrorState, Pagination, Breadcrumb, Stepper, FileDropzone.
3. Layout: `PublicHeader`, `PublicFooter`, `AppShell` (sidebar + topbar), `RoleNav` (nav items
   derived from role), `PageHeader`, `MobileNav`.
4. Charts in `components/charts/`: RadarChart, BarChart, LineChart, DonutChart, Heatmap,
   Sparkline, GaugeRing — each with an accessible data-table fallback.
5. Domain components: `CompetencyBadge`, `LevelMeter`, `GapBar`, `CourseCard`, `PathwayTimeline`,
   `StatTile`, `RecommendationCard`, `QuestionCard`.
6. i18n scaffold: `Frontend/src/i18n/{en,hi}.ts` + `useT()`; language toggle in the header.

**Done when:** a `/design` internal page renders every primitive in light + dark, and no page
built later needs a new one-off style.

---

## Phase 4 — Authentication and role management

**Goal:** one login page, three roles, enforced on both sides.

1. Install Clerk in `Frontend`; wrap the root layout in `<ClerkProvider>`.
2. **Single login page** at `/sign-in/[[...rest]]` using `<SignIn />`, themed with our tokens.
   Deliberately no role selector — the role comes from the account, not from user choice.
   `/sign-up/[[...rest]]` mirrors it.
3. Role storage: Clerk `publicMetadata.role ∈ {employee, administrator, engineer}`.
   New users default to `employee`; the Backend can promote via an admin endpoint.
4. `Frontend/src/middleware.ts` (`clerkMiddleware`):
   - public routes: `/`, `/about`, `/courses`, `/courses/*`, `/programmes`, `/sign-in/*`, `/sign-up/*`
   - authenticated routes: everything else
   - role-gated prefixes: `/dashboard/admin` + `/admin/*` → `administrator`;
     `/dashboard/engineer` + `/engineer/*` → `engineer`; `/dashboard/employee`, `/competency/*`,
     `/my-courses/*`, `/learning-paths/*` → `employee`; `/studio/*` → `administrator|engineer`
   - unauthorised → `/403` (a real page, never a crash or a blank redirect loop)
   - missing profile → `/onboarding`
5. `/dashboard` is a server component that reads the role and redirects to the right dashboard.
6. `Frontend/src/lib/auth/rbac.ts`: `hasRole()`, `requireRole()`, `ROLE_NAV`, `ROLE_LABELS` —
   used by nav rendering *and* server checks so they can't drift.
7. `/onboarding`: multi-step wizard (identity → service record → qualifications → prior trainings
   → self-assessment) that POSTs the profile and seeds the competency baseline.
8. Profile menu: name, role badge, department, switch language, sign out.

**Done when:** three seeded Clerk test accounts (one per role) each land on their own dashboard,
and each gets `/403` on the other two roles' routes — verified with the browser and with `curl`
against the Backend.

---

## Phase 5 — Backend auth & role service

**Goal:** the minimum real backend the demo needs; a clean base my teammates extend.

1. `Backend/src/index.ts` — Express, helmet, CORS (allowlist the frontend origin), JSON body
   limit, request-ID + structured logging, `/health`.
2. `Backend/src/middleware/auth.ts` — `clerkMiddleware()` + `requireAuth()`.
3. `Backend/src/middleware/rbac.ts` — `requireRole('administrator', 'engineer')` reading
   `sessionClaims.publicMetadata.role`; returns the standard error envelope on 401/403.
4. `Backend/src/routes/auth.ts` — `GET /api/v1/auth/me` (identity + role + profile completeness),
   `POST /api/v1/auth/onboarding`, `PATCH /api/v1/users/:id/role` (administrator only, writes
   Clerk `publicMetadata`, audit-logged).
5. `Backend/src/routes/webhooks.ts` — Clerk `user.created` / `user.updated` webhook (Svix
   signature verified) that sets the default role and mirrors the user record.
6. `Backend/src/routes/mock/*.ts` — the contract's read endpoints served from the same fixture
   JSON as the frontend, so teammates can develop against a live URL immediately. Each handler
   carries a `// @replace_with_real_API` marker and a TODO naming the real data source.
7. `Backend/src/lib/errors.ts` — one error shape matching the contract; Zod validation on every
   request body.
8. `Backend/README.md` — how to run, how to add a real route, where to plug the database in.

**Done when:** `curl -H "Authorization: Bearer <token>" .../api/v1/auth/me` returns the right
role for each test account, and a wrong-role call returns 403 in the contract's error shape.

---

## Phase 6 — Public pages

**Goal:** the site a judge sees first.

1. **Landing** `/`: hero with the problem in one sentence, six solution pillars (competency
   assessment, gap analysis, iGOT integration, personalised pathways, AI question generation,
   dashboards), how-it-works stepper, the four competency domains, integration story
   (iGOT + NSSTA TPAC), impact stat band, FAQ, CTA, footer. All copy and stats from mocks.
2. **About** `/about`: mission, Mission Karmayogi & MoSPI alignment, architecture diagram,
   tech stack, team, contact form (POSTs to a contract endpoint).
3. **Course catalogue** `/courses`: search, filters (domain, competency, level, provider,
   duration, language, source: iGOT/TPAC), sort, grid/list toggle, cursor pagination, skeletons,
   empty and error states. Signed-in users additionally see a personalised match %.
4. **Course detail** `/courses/[courseId]`: outcomes, competencies covered with target levels,
   modules, duration, provider, rating, prerequisites, related courses, enrol CTA (which prompts
   sign-in when signed out).
5. **Programmes** `/programmes`: NSSTA TPAC programme listing with schedule and eligibility.
6. SEO: metadata, OG images, sitemap, robots.

**Done when:** all four pages are responsive 360→1920px, keyboard navigable, and render entirely
from the mock API with visible loading and error states.

---

## Phase 7 — Employee experience

1. `/dashboard/employee`: welcome + role/department context, competency radar across the four
   domains, overall competency score gauge, top 5 skill gaps, "next best action" recommendation
   cards with reason codes, learning hours (week/month/total), streak, in-progress courses,
   upcoming deadlines, recent certificates.
2. `/competency`: full table — competency, domain, current level, required level, gap, evidence
   chips, confidence, last assessed, history sparkline; filter by domain; export.
3. `/competency/gaps`: ranked gaps with severity, estimated hours to close, and the specific
   courses/programmes that close each; "build my pathway" CTA.
4. `/learning-paths` and `/learning-paths/[id]`: milestone timeline (course → assessment → lab →
   certificate), progress, estimated completion date, reorder/skip with justification.
5. `/my-courses`: In progress / Completed / Bookmarked tabs, progress bars, resume, filters.
6. `/my-courses/[id]/learn`: module sidebar, content viewer, notes, mark complete, module quiz.
7. `/certificates`: list, preview, verification code, download.
8. `/notifications`: grouped, mark-read, deep links.

**Done when:** an employee can go profile → gaps → pathway → course → assessment → certificate
without a dead end, and every screen has loading, empty and error states.

---

## Phase 8 — Administrator experience

1. `/dashboard/admin`: KPI tiles (officials, avg competency, gap index, completion rate, hours
   delivered), competency heatmap by department × domain, gap distribution, training
   effectiveness trend, enrolment funnel, predicted skill demand, emerging-skills watchlist.
2. `/admin/workforce`: searchable, filterable table (department, designation, competency band,
   gap severity); bulk select; drill into `/admin/workforce/[id]` for a read-only competency
   profile plus nomination history.
3. `/admin/programmes`: create/edit TPAC programmes, capacity, schedule, eligibility;
   nominate individuals or bulk-assign a cohort; nomination status tracking.
4. `/admin/analytics`: date range, department and domain slicing, pre/post assessment delta,
   cost per competency point, forecast horizon toggle.
5. `/admin/reports`: saved report definitions, run, CSV/PDF export.

**Done when:** an administrator can answer "who needs Python training next quarter and why" in
under three clicks, and export it.

---

## Phase 9 — Assessment engine (Studio)

1. `/studio/uploads`: drag-and-drop PDF/DOCX/PPTX/video/URL, upload progress, parse status
   (queued → parsing → ready → failed), asset list with size, pages/duration, detected language.
2. `/studio/generate`: pick asset(s), question count, difficulty mix, Bloom levels, competency
   tags, language, question types; submit → job status → generated set.
3. `/studio/questions/[id]`: review queue — stem, options, correct answer, explanation,
   distractor rationale, source snippet with page reference, confidence; approve / edit / reject;
   bulk actions; publish as an assessment bound to a course, competency or cohort.
4. `/assessments`, `/assessments/[id]`, `/assessments/[id]/result` (learner side): instructions,
   timer, one-question-at-a-time with a question navigator, save-and-resume, submit; instant
   score, per-question explanation, competency-wise breakdown, recommended remediation courses,
   retake policy.
5. Adaptive mode flag on the contract: next question chosen by running ability estimate.

**Done when:** upload → generate → review → publish → take → result runs end to end on mocks,
with the generation job showing real async states.

---

## Phase 10 — AI assistant (chatbot)

1. `/assistant` and `/assistant/[threadId]`: ChatGPT/Gemini-style layout — thread sidebar (new,
   rename, delete, search), message list with markdown + code rendering, token-by-token streaming
   presentation, stop generation, regenerate, copy, thumbs up/down.
2. Suggested prompts seeded from the user's own gaps ("How do I get to Practitioner in Sampling?").
3. Grounded answers: responses carry citation chips linking to courses, competencies and
   programmes; clicking a chip navigates there.
4. Attach context: current course, current gap, or an uploaded document.
5. Mock streaming that emits chunks on a timer, so the real SSE swap is one function.
6. Available to all three roles, with role-appropriate system context (an admin asks about the
   workforce, an employee about their own path).

**Done when:** conversations persist across navigation, streaming can be stopped mid-flight, and
the whole page works on mobile.

---

## Phase 11 — Engineer experience

1. `/dashboard/engineer`: service health tiles, error rate, p95 latency, job queue depth, last
   iGOT sync, recent incidents.
2. `/engineer/api-registry`: renders `registry.ts` — method, URL, purpose, role required,
   MOCK/LIVE badge, owner, linked contract anchor. This is the live progress board for the
   backend team.
3. `/engineer/integrations`: iGOT catalogue sync (trigger + last run + record counts), webhook
   status, credential expiry warnings.
4. `/engineer/audit`: filterable audit log with actor, action, resource, IP, timestamp.

**Done when:** the registry page count matches `ENDPOINT_CONTRACT.md` exactly.

---

## Phase 12 — Hardening, polish and handover

1. Accessibility pass: axe clean, keyboard-only walkthrough of every flow, focus traps in modals,
   ARIA on all charts + data-table fallbacks, reduced-motion support.
2. Performance: lazy-load chart bundles, `next/image`, font subsetting, route-level splitting,
   Lighthouse ≥ 90 on the public pages.
3. Resilience: error boundaries per route group, global 404/500/403 pages, toast on API failure,
   retry affordances.
4. i18n sweep: no hard-coded strings left; Hindi dictionary complete.
5. Security: CSP headers, no secrets client-side, Zod validation on every input, rate-limit the
   Backend.
6. Docs: root `README.md` (run instructions, screenshots, architecture), finalise
   `ENDPOINT_CONTRACT.md`, and a `HANDOVER.md` for teammates: how to replace one mock with a real
   call, how to add a route with RBAC, and the definition-of-done for a backend endpoint.
7. Run `scripts/audit-mocks.ts`, `npm run build/lint/typecheck` in both folders; commit and push
   to `claude/ai-lms-statistics-training-k08cr5`.

**Done when:** every box in PRD §12 is ticked.

---

## Build order at a glance

```
0 Scaffold ─► 1 Types + Contract ─► 2 Mocks + API client ─► 3 Design system
                                                              │
                              ┌───────────────────────────────┘
                              ▼
                       4 Auth + roles ─► 5 Backend auth service
                              │
        ┌─────────────┬───────┴────────┬──────────────┬─────────────┐
        ▼             ▼                ▼              ▼             ▼
  6 Public pages  7 Employee     8 Administrator  9 Studio    10 Assistant
                                                                   │
                                                            11 Engineer
                                                                   │
                                                          12 Hardening
```

Phases 6–11 are independent once Phase 4 lands, so they can be parallelised or reordered by
demo priority without rework.

## Conventions applied throughout

- **No hard-coded display data.** Everything renders from `src/mocks` through the API client.
- **Every mock is tagged** `@replace_with_real_API "METHOD /path"` and listed in the contract.
- **Schemas are the source of truth** — types, fixtures, form validation and the contract all
  derive from the same Zod definitions.
- **Server-side RBAC always.** Client role checks are for UX only.
- **Every list view** ships loading, empty and error states — no silent blank screens.
- **Commit per phase** with a clear message, pushed to `claude/ai-lms-statistics-training-k08cr5`.
