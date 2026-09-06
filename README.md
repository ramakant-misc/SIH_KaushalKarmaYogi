# KaushalKarmaYogi

**AI-enabled Skill Intelligence & Learning Platform for India's Official Statistical System**
Smart India Hackathon 2026 — Problem Statement **26101**

A platform that builds a competency profile for every statistical official, measures it against a
competency framework for Official Statistics, computes the skill gap, and recommends a
personalised learning pathway drawn from **iGOT Karmayogi** and **NSSTA TPAC** programmes — plus
an AI assessment engine that generates MCQs from uploaded learning material.

## Repository layout

| Folder | What it is |
|---|---|
| `Frontend/` | Next.js (App Router) + Tailwind CSS + Clerk. All UI. |
| `Backend/` | Node + Express + Clerk. Authentication, three-role RBAC, and mock data routes. |

## Documents

| File | Purpose |
|---|---|
| [`PRD.md`](./PRD.md) | Product requirements: users, roles, competency model, features, acceptance criteria |
| [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) | The 13-phase build order |
| [`ENDPOINT_CONTRACT.md`](./ENDPOINT_CONTRACT.md) | **Every data model and API endpoint the backend must implement** |

## Running locally

```bash
# Frontend — http://localhost:3000
cd Frontend
cp .env.example .env.local     # add your Clerk keys
npm install
npm run dev

# Backend — http://localhost:4000
cd Backend
cp .env.example .env           # same Clerk instance as the frontend
npm install
npm run dev
```

The frontend runs fully on mock data with `NEXT_PUBLIC_USE_MOCKS=true`, so you do not need the
backend running to work on the UI.

## The three roles

One shared login page authenticates all three; the app routes each user to their own dashboard
based on the Clerk `publicMetadata.role` claim.

| Role | Sees |
|---|---|
| `employee` | Competency profile, skill gaps, learning pathway, courses, assessments, AI assistant |
| `administrator` | Workforce analytics, competency distribution, programme nomination, reports |
| `engineer` | Service health, iGOT integration status, API registry, audit log |

## For the backend team

Start at **[`ENDPOINT_CONTRACT.md`](./ENDPOINT_CONTRACT.md)**. The frontend is already built
against those exact shapes, so a matching endpoint drops in with no frontend changes.

The shapes are executable: the Zod schemas in `Frontend/src/schemas/` are the source of truth,
and `Frontend/src/lib/api/registry.ts` tracks which of the 61 endpoints are still `MOCK`.

```bash
cd Frontend && npm run contract:check   # fails if the doc, the registry and the code disagree
```

Every mocked call in the UI is tagged so it is greppable:

```ts
// @replace_with_real_API "GET /api/v1/courses"
```

## Checks

```bash
cd Frontend && npm run lint && npm run typecheck && npm run contract:check && npm run build
cd Backend  && npm run typecheck && npm run build
```
