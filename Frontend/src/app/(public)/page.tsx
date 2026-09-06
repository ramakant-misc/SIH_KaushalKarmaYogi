import Link from "next/link";
import {
  ArrowRight, BarChart3, BrainCircuit, ClipboardCheck, FileSearch, GraduationCap,
  Route as RouteIcon, ShieldCheck, Sparkles, Target,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { CourseCard } from "@/components/domain";
import { catalogueApi, competencyApi } from "@/lib/api";
import { DOMAIN_LABELS, type CompetencyDomain } from "@/schemas";
import { DOMAIN_COLORS } from "@/components/charts/palette";

export const metadata = {
  title: "AI Skill Intelligence for India's Official Statistical System",
  description:
    "Competency assessment, automated skill-gap analysis and personalised learning pathways from iGOT Karmayogi and NSSTA TPAC, for officials across India's statistical system.",
};

const PILLARS = [
  {
    icon: Target,
    title: "AI competency assessment",
    body: "A competency profile is built automatically from designation, role, qualifications, experience and prior training — then scored against the framework for Official Statistics.",
  },
  {
    icon: FileSearch,
    title: "Automated skill-gap analysis",
    body: "Every gap is ranked by severity, weighted by how critical the competency is to the officer's role, with the hours and the exact courses needed to close it.",
  },
  {
    icon: RouteIcon,
    title: "Personalised learning pathways",
    body: "Sequenced pathways drawn from the iGOT Karmayogi catalogue and NSSTA's TPAC recommended programmes, ordered so each course is confirmed by an assessment.",
  },
  {
    icon: ClipboardCheck,
    title: "AI question generation",
    body: "Upload a document, presentation or lecture video and the engine generates MCQs with explanations, distractor rationales and a citation back to the source page.",
  },
  {
    icon: BarChart3,
    title: "Dashboards that decide",
    body: "Officials see their gaps and next actions. Administrators see workforce-wide competency distribution, training effectiveness and forecast skill demand.",
  },
  {
    icon: ShieldCheck,
    title: "Secure and interoperable",
    body: "Role-based access control, SSO-ready authentication and standard REST APIs designed to integrate with existing government digital infrastructure.",
  },
];

const STEPS = [
  { title: "Build the profile", body: "Service record, qualifications, experience and prior training become a competency profile with an evidence trail." },
  { title: "Measure the gap", body: "Assessed levels are compared against the FRAC target for the officer's role across all four domains." },
  { title: "Recommend the path", body: "Ranked recommendations from iGOT and TPAC, each with the reason it was suggested." },
  { title: "Confirm and update", body: "Assessments and completions feed evidence back, so the profile and the recommendations stay current." },
];

export default async function LandingPage() {
  // Rendered on the server from the same API client the rest of the app uses.
  const [framework, popular] = await Promise.all([
    competencyApi.getFramework(),
    catalogueApi.listCourses({ limit: 3, sort: "rating" }),
  ]);

  const domainCounts = (["statistical", "technical", "digital_governance", "behavioural"] as CompetencyDomain[]).map(
    (domain) => ({
      domain,
      count: framework.competencies.filter((c) => c.domain === domain).length,
      examples: framework.competencies.filter((c) => c.domain === domain).slice(0, 4).map((c) => c.name),
    }),
  );

  return (
    <main id="main" className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-default bg-surface">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--color-primary-600) 0, transparent 45%), radial-gradient(circle at 80% 30%, var(--color-domain-technical) 0, transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <Badge tone="primary">
              <Sparkles className="size-3" aria-hidden /> Smart India Hackathon 2026 · PS 26101
            </Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The right training,{" "}
              <span className="text-primary-600 dark:text-primary-400">for the right official</span>, at
              the right time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
              iGOT Karmayogi already holds thousands of courses. What it cannot tell an officer in
              India&apos;s statistical system is which of them closes <em>their</em> competency gap.
              KaushalKarmaYogi is that missing layer — it assesses competencies, finds the gaps, and
              builds a personalised pathway.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/sign-in" size="lg">
                Get started <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/courses" size="lg" variant="secondary">
                Explore the catalogue
              </ButtonLink>
            </div>

            <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { value: framework.competencies.length, label: "Competencies mapped" },
                { value: 4, label: "Competency domains" },
                { value: "0–5", label: "Proficiency scale" },
                { value: "2", label: "Integrated sources" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-3xl font-semibold tabular-nums text-foreground">{stat.value}</dt>
                  <dd className="mt-1 text-sm text-foreground-subtle">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="border-b border-border-default">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                A large catalogue is not the same as a clear path
              </h2>
              <p className="mt-4 text-foreground-muted">
                Officials engaged in data collection, processing, analysis and dissemination must keep
                pace with AI, machine learning, big data, GIS and cloud. The learning content exists.
                What is missing is a mechanism that knows what each officer already has, what their
                role demands, and what to do about the difference.
              </p>
              <p className="mt-4 text-foreground-muted">
                Without it, training is chosen by availability rather than need — and capacity building
                cannot be measured, only counted.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { stat: "No", label: "systematic competency baseline for statistical roles" },
                { stat: "Manual", label: "course selection, unconnected to job requirements" },
                { stat: "Unmeasured", label: "effect of training on actual competency" },
                { stat: "Reactive", label: "planning, with no forecast of future skill demand" },
              ].map((item) => (
                <Card key={item.label} className="p-5">
                  <p className="text-lg font-semibold text-danger-600">{item.stat}</p>
                  <p className="mt-1 text-sm text-foreground-subtle">{item.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-b border-border-default bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl text-2xl font-semibold text-foreground sm:text-3xl">
            What the platform does
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} className="p-6">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-subtle">{pillar.body}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border-default">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="inline-grid size-8 place-items-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm text-foreground-subtle">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Competency domains */}
      <section className="border-b border-border-default bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {framework.competencies.length} competencies, four domains
          </h2>
          <p className="mt-3 max-w-2xl text-foreground-muted">
            Every profile, gap, recommendation and dashboard in the platform is built on this
            framework, maintained by {framework.owner}.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {domainCounts.map(({ domain, count, examples }) => (
              <Card key={domain} className="flex flex-col p-6">
                <span className="h-1 w-10 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[domain] }} aria-hidden />
                <h3 className="mt-4 font-semibold text-foreground">{DOMAIN_LABELS[domain]}</h3>
                <p className="mt-1 text-sm text-foreground-subtle">{count} competencies</p>
                <ul className="mt-4 space-y-1.5 text-sm text-foreground-muted">
                  {examples.map((name) => (
                    <li key={name} className="flex gap-2">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current opacity-40" aria-hidden />
                      {name}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="border-b border-border-default">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                Built on the iGOT Karmayogi ecosystem
              </h2>
              <p className="mt-4 text-foreground-muted">
                The platform does not replace iGOT — it sits on top of it. Course catalogues,
                enrolment and completion flow through iGOT&apos;s APIs, while NSSTA&apos;s TPAC
                recommended programmes are surfaced alongside them, so an officer sees one ranked
                list rather than two disconnected systems.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Course catalogue synchronised from iGOT Karmayogi",
                  "NSSTA TPAC recommended programmes with nomination workflow",
                  "Enrolment and completion kept in sync with the source system",
                  "Competency scores updated automatically as learning completes",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-foreground-muted">
                    <GraduationCap className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Card>
              <CardBody>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BrainCircuit className="size-4 text-primary-600" aria-hidden />
                  Highest rated in the catalogue
                </div>
                <div className="mt-4 space-y-3">
                  {popular.items.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block rounded-lg border border-border-default p-3 transition-colors hover:bg-surface-muted"
                    >
                      <p className="text-sm font-medium text-foreground">{course.title}</p>
                      <p className="mt-0.5 text-xs text-foreground-subtle">
                        {course.provider} · {Math.round(course.durationMinutes / 60)} hours
                      </p>
                    </Link>
                  ))}
                </div>
                <ButtonLink href="/courses" variant="secondary" size="sm" className="mt-4 w-full">
                  Browse all courses
                </ButtonLink>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="border-b border-border-default bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Start here</h2>
            <Link href="/courses" className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-400">
              View the full catalogue →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {popular.items.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-900">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            See your competency profile
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-100">
            Sign in to view your assessed competencies, your ranked skill gaps, and the learning
            pathway built for your role.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/sign-in" size="lg" className="bg-white text-primary-800 hover:bg-primary-50">
              Sign in
            </ButtonLink>
            <ButtonLink href="/about" size="lg" variant="ghost" className="text-white hover:bg-white/10">
              Learn more
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
