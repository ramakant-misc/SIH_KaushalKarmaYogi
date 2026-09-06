# Product Requirements Document (PRD)

**Project:** KaushalKarmaYogi — AI-enabled Skill Intelligence & Learning Platform for India's Official Statistical System
**SIH 2026 Problem Statement:** 26101
**Document owner:** Frontend team
**Status:** Draft v1.0
**Last updated:** 2026-09-06

---

## 1. Purpose of this document

This PRD defines *what* we are building and *why*. It is the single source of truth for
scope, users, screens, data and acceptance criteria.

Two companion documents complete the spec:

| Document | Purpose |
|---|---|
| `IMPLEMENTATION_PLAN.md` | Step-by-step build order for the frontend + auth backend |
| `ENDPOINT_CONTRACT.md` | Every data model and every REST endpoint the backend team must implement |

**Team split**
- **This repository's current scope (me):** complete production-grade **frontend** (Next.js + Tailwind), **authentication + role management** (Clerk), and the **written API contract**.
- **Teammates:** the real backend (business logic, AI/ML services, iGOT integration, database).

Every screen consumes data through a typed API client. Until the backend exists, that client
returns **mock JSON that already matches the agreed contract shape**, and every mock is tagged:

```ts
// @replace_with_real_API "GET /api/courses"
```

Swapping mocks for `fetch()` must be a one-line change per endpoint — no component rewrites.

---

## 2. Background

India's statistical system (MoSPI, NSO, NSSTA, State Directorates of Economics & Statistics)
is adopting AI/ML, big data, GIS and cloud at speed. Officials who collect, process, analyse
and disseminate official statistics must continuously upskill.

The **iGOT Karmayogi** platform (built under Mission Karmayogi, structured around the
**FRAC** model — Framework of Roles, Activities and Competencies) already hosts a very large
course repository. The gap is *navigational and diagnostic*: an official cannot easily find
which of thousands of courses actually closes **their** competency gap for **their** role.

There is today no intelligent mechanism that:
1. builds a competency profile automatically from an official's service record,
2. scores it against a statistics-specific competency framework,
3. computes the skill gap, and
4. recommends a personalised, sequenced learning pathway drawn from iGOT + NSSTA's TPAC
   recommended training programmes.

**KaushalKarmaYogi** is that missing intelligence layer. It does not replace iGOT — it sits
on top of it as a skill-intelligence and assessment platform.

---

## 3. Goals and non-goals

### 3.1 Product goals
| # | Goal | How we measure it |
|---|---|---|
| G1 | Auto-generate a competency profile for every official | % of logged-in users with a complete profile |
| G2 | Quantify skill gaps against a statistics competency framework | Gap score per competency, per domain |
| G3 | Recommend personalised learning pathways from iGOT + TPAC | Recommendation acceptance / enrolment rate |
| G4 | Generate MCQs and quizzes automatically from uploaded content | Questions generated per upload; trainer edit rate |
| G5 | Give learners and admins actionable dashboards | Time-to-insight; dashboard weekly active use |
| G6 | Be secure, scalable, interoperable, role-based | RBAC coverage; SSO; audit log completeness |

### 3.2 Goals for *this* repository (the deliverable I own)
- A complete, navigable, responsive, accessible frontend for all roles.
- Working authentication and three-role authorisation via Clerk, with a **single login page**.
- A mock data layer that is contract-accurate and trivially replaceable.
- `ENDPOINT_CONTRACT.md` documenting every model and endpoint.

### 3.3 Non-goals (explicitly out of scope for this repo)
- Training or hosting real ML models / LLMs.
- Real iGOT Karmayogi API integration (credentials are government-issued).
- Production database, migrations, queues, or cloud infra.
- Real MCQ generation from PDFs/videos (UI + contract only; the engine is backend work).

These are **teammate scope** and are fully specified in `ENDPOINT_CONTRACT.md` so they can be
built independently and dropped in.

---

## 4. Users and roles

The platform has **three roles**. All three use **one shared login page**; the app routes
each user to their own dashboard after authentication based on their role claim.

| Role key | Label | Who they are | Primary jobs-to-be-done |
|---|---|---|---|
| `employee` | Employee / Official | SSO, JSO, DD, Statistical Officer, Investigator, Data Analyst in MoSPI / NSO / State DES | See my competency profile and gaps; follow a recommended pathway; take courses and assessments; ask the AI assistant; track my hours and certificates |
| `administrator` | Administrator | Training coordinator, NSSTA/TPAC officer, HoD, capacity-building cell | See workforce-wide competency distribution; assign/nominate officials to programmes; measure training effectiveness; forecast future skill demand; export reports |
| `engineer` | Engineer / Developer | Platform engineer, integration & ML ops | Monitor integration health with iGOT; inspect API/mock status; manage competency framework versions; view content ingestion & question-generation pipelines; audit logs |

> Note: the problem statement uses "Developer" in one line and we use the role key `engineer`
> throughout code, with UI label "Engineer / Developer". One key, one label — no ambiguity.

### 4.1 Personas
- **Priya, Junior Statistical Officer, State DES.** Strong in survey design, weak in Python and
  GIS. Needs to know *exactly* which 3 courses to take next, in what order, and how long it takes.
- **Mr. Rao, Deputy Director & Training Coordinator, NSSTA.** Must nominate 40 officers for
  next quarter's programmes and justify the choice with data. Needs distribution charts and export.
- **Aditi, Platform Engineer.** Needs to see that the iGOT catalogue sync ran, which endpoints
  are still mocked, and what the question-generation queue is doing.

---

## 5. Competency model

The AI engine maps competencies across four domains. This taxonomy drives the entire product —
profiles, gaps, recommendations, dashboards and assessment tagging.

| Domain key | Domain | Example competencies |
|---|---|---|
| `statistical` | Statistical | Survey Design, Sampling, National Accounts, Price Statistics, Labour Statistics, Agricultural Statistics, Industrial Statistics, SDG Indicators, Metadata Standards, Data Quality Frameworks |
| `technical` | Technical | Python, R, SQL, Stata, SPSS, SAS, GIS, Data Visualization, AI/ML, Cloud Computing, APIs, Open Data |
| `digital_governance` | Digital Governance | Cybersecurity, Data Privacy, Digital Signatures, Government Cloud, Digital Public Infrastructure |
| `behavioural` | Behavioural & Managerial | Leadership, Communication, Project Management, Ethics, Decision Making, Change Management |

**Proficiency scale (0–5), used everywhere:**

| Level | Name | Meaning |
|---|---|---|
| 0 | None | No exposure |
| 1 | Awareness | Knows concepts |
| 2 | Working | Performs with guidance |
| 3 | Practitioner | Performs independently |
| 4 | Advanced | Designs solutions, reviews others |
| 5 | Expert | Sets standards, trains others |

**Gap definition:** `gap = required_level (from role's FRAC target) − current_level (assessed)`.
A gap ≥ 1 is actionable; gaps are ranked by `gap × competency_weight × role_criticality`.

**Evidence sources for `current_level`:** self-assessment, adaptive assessment score,
completed course outcomes, prior trainings on record, years of relevant experience, supervisor
endorsement. Each contributes a weighted signal with a stored `confidence` value so the UI can
show *why* a level was assigned.

---

## 6. Feature requirements

Priority: **P0** = required for the SIH demo, **P1** = strongly desired, **P2** = stretch.

### 6.1 Public / pre-login
| ID | Feature | Priority | Description |
|---|---|---|---|
| F-01 | Landing page | P0 | Hero, problem framing, the 6 solution pillars, how-it-works (4 steps), competency domains, iGOT/TPAC integration story, stats band, testimonials, FAQ, CTA, footer |
| F-02 | About us page | P0 | Mission, alignment to Mission Karmayogi & MoSPI, architecture overview, team, tech stack, contact |
| F-03 | Public course catalogue | P0 | Browse/search/filter iGOT + TPAC courses without logging in; personalised "match %" appears only when signed in |
| F-04 | Course detail page | P0 | Outcomes, competencies covered, duration, level, provider, modules, ratings, enrol CTA |
| F-05 | Single login page | P0 | One Clerk sign-in for all three roles; no role picker at login — the role comes from the account |

### 6.2 Authentication and roles
| ID | Feature | Priority | Description |
|---|---|---|---|
| F-10 | Clerk authentication | P0 | Email/password + OAuth; session managed by Clerk; middleware-protected routes |
| F-11 | Role assignment | P0 | Role stored in Clerk `publicMetadata.role` (`employee` \| `administrator` \| `engineer`); default `employee` |
| F-12 | Role-based routing | P0 | `/dashboard` redirects to the role's dashboard; cross-role URLs return 403 page, not a crash |
| F-13 | Onboarding wizard | P0 | First login collects designation, department, cadre, qualifications, experience, prior trainings → creates the competency profile |
| F-14 | RBAC on the API | P0 | Every backend route checks role server-side; the UI never relies on client-side checks alone |
| F-15 | SSO readiness | P1 | Documented path for Parichay/NIC SSO via Clerk enterprise connection |

### 6.3 Employee experience
| ID | Feature | Priority | Description |
|---|---|---|---|
| F-20 | Employee dashboard | P0 | Competency radar by domain, top skill gaps, recommended next actions, learning hours, streak, progress ring, upcoming deadlines, certificates |
| F-21 | Competency profile page | P0 | Full per-competency table: current vs required, evidence, confidence, history sparkline |
| F-22 | Skill-gap analysis | P0 | Ranked gaps with severity, the courses that close each one, estimated hours to close |
| F-23 | Learning pathway | P0 | Sequenced, milestone-based path (course → assessment → lab → certificate) with progress |
| F-24 | My courses | P0 | Tabs: In progress / Completed / Bookmarked; resume-where-you-left-off; progress bars |
| F-25 | Course player | P1 | Module list, video/doc viewer, notes, mark-complete, module quiz |
| F-26 | AI assistant (chat) | P0 | ChatGPT/Gemini-style page: streaming-style responses, conversation list, suggested prompts, citations to courses/competencies, new chat, rename, delete |
| F-27 | Assessments | P0 | Take adaptive assessment; instant scoring; per-question explanation; competency-wise breakdown; retake policy |
| F-28 | Virtual labs | P2 | Launch card + status for hands-on AI/Cloud/Cyber labs (stub UI, contract defined) |
| F-29 | Certificates | P1 | List, preview, verify code, download |
| F-30 | Notifications | P1 | Nominations, deadlines, new recommendations |
| F-31 | Multilingual UI | P1 | English + Hindi toggle; i18n scaffolding for regional languages |

### 6.4 Administrator experience
| ID | Feature | Priority | Description |
|---|---|---|---|
| F-40 | Admin dashboard | P0 | Org KPIs, competency heatmap by department, gap distribution, training effectiveness, enrolment funnel, predicted future skill demand |
| F-41 | Workforce directory | P0 | Searchable officials list with competency score, gaps, last training; drill into a profile |
| F-42 | Programme management | P0 | Create/edit NSSTA TPAC programmes; nominate or bulk-assign officials; capacity and calendar |
| F-43 | Training effectiveness | P1 | Pre/post assessment delta, completion rate, satisfaction, cost per competency point |
| F-44 | Predictive analytics | P1 | Forecast competency demand 6/12 months out; emerging-skill watchlist |
| F-45 | Reports & export | P1 | Filterable reports; CSV/PDF export |
| F-46 | Framework management | P2 | View/version the competency framework and role→required-level matrix |

### 6.5 Trainer / assessment engine (available to administrator + engineer)
| ID | Feature | Priority | Description |
|---|---|---|---|
| F-50 | Content upload | P0 | Upload PDF/DOCX/PPTX/video/URL; shows parse status |
| F-51 | AI question generation | P0 | Generate MCQs/quizzes from uploaded content; choose count, difficulty, Bloom level, competency tags, language |
| F-52 | Review & edit questions | P0 | Approve/edit/reject generated questions; per-question explanation and distractor rationale |
| F-53 | Publish quiz | P0 | Turn approved questions into an assessment assigned to a course/competency/cohort |
| F-54 | Item analytics | P2 | Difficulty index, discrimination, flagged items |

### 6.6 Engineer experience
| ID | Feature | Priority | Description |
|---|---|---|---|
| F-60 | Engineer dashboard | P0 | Service health, iGOT sync status, job queues, error rate, latency |
| F-61 | API/mock registry | P0 | Live table of every endpoint in `ENDPOINT_CONTRACT.md` with MOCK / LIVE status — reads the same registry the API client uses |
| F-62 | Integration console | P1 | iGOT catalogue sync trigger + last-run log; webhook status |
| F-63 | Audit log viewer | P1 | Who did what, when, from where |
| F-64 | Feature flags | P2 | Toggle AI features per environment |

---

## 7. Information architecture

```
/                          Landing                       public
/about                     About us                      public
/courses                   Course catalogue              public
/courses/[courseId]        Course detail                 public
/programmes                NSSTA TPAC programmes         public
/sign-in/[[...rest]]       Single login page             public
/sign-up/[[...rest]]       Registration                  public
/onboarding                Profile wizard                auth
/dashboard                 Role router (redirect)        auth
/dashboard/employee        Employee dashboard            employee
/dashboard/admin           Administrator dashboard       administrator
/dashboard/engineer        Engineer dashboard            engineer
/competency                My competency profile         employee
/competency/gaps           Skill-gap analysis            employee
/learning-paths            My pathways                   employee
/learning-paths/[id]       Pathway detail                employee
/my-courses                My courses                    employee
/my-courses/[id]/learn     Course player                 employee
/assessments               Assessment list               employee
/assessments/[id]          Take assessment               employee
/assessments/[id]/result   Result + explanations         employee
/labs                      Virtual labs                  employee
/certificates              My certificates               employee
/assistant                 AI chatbot                    auth (all roles)
/assistant/[threadId]      Conversation                  auth
/notifications             Notifications                 auth
/profile                   Profile & settings            auth
/admin/workforce           Workforce directory           administrator
/admin/workforce/[id]      Official detail               administrator
/admin/programmes          Programme management          administrator
/admin/analytics           Deep analytics                administrator
/admin/reports             Reports & export              administrator
/studio/uploads            Content uploads               administrator, engineer
/studio/generate           AI question generation        administrator, engineer
/studio/questions/[id]     Review & edit questions       administrator, engineer
/engineer/integrations     Integration console           engineer
/engineer/api-registry     API / mock registry           engineer
/engineer/audit            Audit log                     engineer
/403                       Not authorised                any
```

---

## 8. Data model (summary)

Full field-level definitions and every endpoint live in `ENDPOINT_CONTRACT.md`. The core entities:

| Entity | Purpose |
|---|---|
| `User` | Identity, role, department, designation (mirrors Clerk) |
| `OfficialProfile` | Service record: cadre, qualifications, experience, prior trainings, current assignment |
| `CompetencyFramework` | Versioned set of competencies for Official Statistics |
| `Competency` | One competency: key, name, domain, description, weight |
| `RoleCompetencyRequirement` | Required level per competency for a given role/designation (FRAC target) |
| `CompetencyAssessmentRecord` | Assessed current level, evidence, confidence, timestamp |
| `SkillGap` | Derived: competency, current, required, gap, severity, hours to close |
| `Course` | iGOT / TPAC course metadata + competencies covered |
| `TrainingProgramme` | NSSTA TPAC programme with schedule and capacity |
| `LearningPath` | Ordered milestones generated for a user |
| `Recommendation` | A ranked suggestion with reason codes and match score |
| `Enrollment` | User ↔ course/programme state and progress |
| `ContentAsset` | Uploaded document/video, parse status |
| `Assessment` | A quiz: source, competencies, config, status |
| `Question` | MCQ: stem, options, answer, explanation, difficulty, Bloom level |
| `Attempt` | A user's assessment attempt with per-question responses |
| `Certificate` | Issued credential with verification code |
| `ChatThread` / `ChatMessage` | AI assistant conversations |
| `Notification` | User-facing alerts |
| `OrgAnalytics` | Aggregated admin metrics + forecasts |
| `AuditLog` | Security/action trail |
| `SystemHealth` | Engineer-facing service/integration status |

---

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | LCP < 2.5s on 4G; route-level code splitting; server components for static content |
| Accessibility | WCAG 2.1 AA: keyboard navigable, focus visible, ARIA on charts, ≥4.5:1 contrast, no colour-only meaning |
| Responsive | Fully usable 360px → 1920px; mobile-first navigation |
| Security | RBAC enforced server-side; no secrets in client bundles; CSP; input validation with Zod on every boundary |
| Privacy | Personal service-record data minimised; DPDP-aligned consent copy; no PII in logs or analytics events |
| Interoperability | REST + JSON, consistent envelope, cursor pagination, ISO-8601 UTC timestamps, standard error shape |
| Scalability | Stateless frontend, cache-friendly GETs, designed for horizontal scaling behind a load balancer |
| Observability | Structured logs, request IDs surfaced in the engineer dashboard |
| i18n | All user-facing strings in dictionaries; English + Hindi at minimum |
| Browser support | Latest 2 versions of Chrome, Edge, Firefox, Safari |

---

## 10. Technology decisions

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Server components, routing, middleware, SSR for public pages |
| Styling | Tailwind CSS | Fast, consistent, tokenised design system |
| Auth | Clerk | Hosted auth, roles via `publicMetadata`, middleware, webhooks, SSO path |
| Charts | Recharts | Composable, accessible, React-native charting |
| Icons | lucide-react | Consistent icon set |
| Validation | Zod | One schema shared by mocks, API client and forms |
| State/data | React Server Components + TanStack Query for client fetching | Cache, retry, loading states |
| Backend (this repo) | Node + Express + `@clerk/express` | Minimal, readable service for auth/roles; teammates extend it |
| Mock data | Typed JSON fixtures behind an API client | Contract-accurate, one-line swap to `fetch()` |

**Repository layout**
```
/Frontend        Next.js app (all UI)
/Backend         Express auth + role service, mock-data endpoints, Clerk webhooks
PRD.md
IMPLEMENTATION_PLAN.md
ENDPOINT_CONTRACT.md
```

---

## 11. The mock-data rule (non-negotiable)

1. No component fetches data directly. Everything goes through `Frontend/src/lib/api/*`.
2. Every API client function is annotated:
   ```ts
   // @replace_with_real_API "GET /api/v1/competency/profile/:userId"
   export async function getCompetencyProfile(userId: string): Promise<CompetencyProfile> {
     return mock(competencyProfileFixture(userId));
   }
   ```
3. Fixture shapes are generated from the same Zod schemas the real API must satisfy, so a
   contract mismatch fails at build time, not in the demo.
4. No literal data is written inside JSX. Any value on screen comes from the API client.
5. Every function carrying the tag is listed in `ENDPOINT_CONTRACT.md` and surfaced in the
   engineer's API registry page as `MOCK` until it flips to `LIVE`.

---

## 12. Success criteria / acceptance

The build is done when:

- [ ] All P0 features are implemented and reachable from the UI.
- [ ] One login page authenticates all three roles and routes each to the correct dashboard.
- [ ] Accessing another role's route shows the 403 page; the API rejects it server-side.
- [ ] `ENDPOINT_CONTRACT.md` documents every model and every endpoint used by the UI.
- [ ] `grep -r "@replace_with_real_API" Frontend/src` count == endpoint count in the contract.
- [ ] No hard-coded display data outside `Frontend/src/mocks`.
- [ ] `npm run build`, `npm run lint`, `npm run typecheck` all pass in both folders.
- [ ] The app is usable end-to-end on a 360px viewport and via keyboard only.
- [ ] Dark mode and Hindi toggle work across all pages.

---

## 13. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Real iGOT API access unavailable before the demo | High | Contract-first mocks; adapter layer isolates iGOT field mapping in one file |
| Backend not ready at demo time | High | Frontend is fully functional on mocks; swap is per-endpoint, not big-bang |
| Contract drift between me and teammates | High | Zod schemas are the shared truth; contract doc regenerated from them |
| Scope creep from a very broad problem statement | Medium | P0/P1/P2 priorities; P2 items ship as designed stubs with contracts |
| Clerk role metadata missing on a new account | Medium | Middleware defaults to `employee` and forces the onboarding wizard |
| Chart-heavy dashboards hurt performance | Medium | Lazy-load chart bundles; server-render the shell |

---

## 14. Open questions for the team

1. Will Parichay/NIC SSO be available, or is Clerk-hosted auth the final answer for the demo?
2. Who owns the canonical competency framework JSON — us or NSSTA?
3. Which LLM provider backs question generation and the assistant, and does it need to be
   on-prem / GovCloud for data-residency compliance?
4. Are virtual labs in demo scope, or a designed stub?
5. Does the administrator role need department scoping (see only my department) for the demo?

---

## 15. Sources

- [iGOT Karmayogi — Training Division, DoPT](https://dopttrg.nic.in/igotmk/)
- [Moving towards Competency-based Capacity Building of Civil Servants: Mission Karmayogi — iGOT (NIUA)](https://niua.in/node/238)
- [iGOT Karmayogi FRAC Framework Overview](https://www.scribd.com/document/731669994/5144-12292020-iGOT)
- [Engineering a National-Scale Learning Platform — iGOT Karmayogi (Tarento)](https://www.tarento.com/case-studies/engineering-a-national-scale-learning-platform-igot-karmayogi-for-india/)
