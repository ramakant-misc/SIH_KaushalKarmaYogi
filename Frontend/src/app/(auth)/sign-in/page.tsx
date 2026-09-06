import Link from "next/link";
import { CLERK_ENABLED } from "@/lib/auth/config";
import { Brand } from "@/components/layout/Brand";
import { DemoSignIn } from "./DemoSignIn";
import { ClerkSignIn } from "./ClerkSignIn";

export const metadata = {
  title: "Sign in",
  description: "One sign-in for officials, administrators and platform engineers.",
};

/**
 * The single login page for all three roles.
 *
 * There is deliberately no role selector in Clerk mode: the role belongs to the
 * account, not to a choice made at the sign-in screen. In demo mode a role
 * picker stands in for real accounts so the app can be demonstrated end to end.
 */
export default function SignInPage() {
  return (
    <main id="main" className="grid min-h-screen lg:grid-cols-2">
      {/* Context panel — hidden on small screens where the form matters most. */}
      <section className="relative hidden flex-col justify-between bg-primary-900 p-10 text-white lg:flex">
        <Brand className="[&_span:first-child]:bg-white [&_span:first-child]:text-primary-800 [&_span_span]:text-white/70 [&_span_span:first-child]:text-white" />
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Know exactly which training closes your skill gap.
          </h1>
          <p className="mt-4 text-primary-100">
            KaushalKarmaYogi builds a competency profile for every official in India&apos;s statistical
            system, measures it against the framework for Official Statistics, and recommends a
            personalised pathway from iGOT Karmayogi and NSSTA TPAC programmes.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: "35", label: "Competencies mapped" },
              { value: "4", label: "Competency domains" },
              { value: "0–5", label: "Proficiency scale" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-semibold">{stat.value}</dt>
                <dd className="mt-1 text-xs text-primary-200">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-xs text-primary-300">
          Smart India Hackathon 2026 · Problem Statement 26101
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Brand />
          </div>
          <h2 className="mt-8 text-2xl font-semibold text-foreground lg:mt-0">Sign in</h2>
          <p className="mt-1.5 text-sm text-foreground-subtle">
            One sign-in for officials, administrators and platform engineers. You are taken to the
            dashboard for your role.
          </p>

          <div className="mt-8">{CLERK_ENABLED ? <ClerkSignIn /> : <DemoSignIn />}</div>

          <p className="mt-8 text-center text-xs text-foreground-subtle">
            By signing in you agree to the acceptable-use policy for government learning platforms.{" "}
            <Link href="/about" className="underline hover:text-foreground">
              About this platform
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
