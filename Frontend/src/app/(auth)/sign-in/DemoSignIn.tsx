"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BriefcaseBusiness, Cog, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DEMO_ROLE_COOKIE } from "@/lib/auth/config";
import { ROLE_HOME } from "@/lib/auth/rbac";
import { cn } from "@/lib/cn";
import type { Role } from "@/schemas";

const OPTIONS: Array<{ role: Role; name: string; title: string; detail: string; icon: typeof Cog }> = [
  {
    role: "employee",
    name: "Priya Sharma",
    title: "Employee / Official",
    detail: "Junior Statistical Officer · MoSPI NSO, Nagpur",
    icon: BriefcaseBusiness,
  },
  {
    role: "administrator",
    name: "Suresh Rao",
    title: "Administrator",
    detail: "Deputy Director (Training) · NSSTA",
    icon: ShieldCheck,
  },
  {
    role: "engineer",
    name: "Aditi Menon",
    title: "Engineer / Developer",
    detail: "Platform Engineer · MoSPI DIID",
    icon: Cog,
  },
];

/**
 * Demo sign-in, used only while no Clerk instance is configured.
 *
 * It writes the same role signal the middleware and server guards read, so the
 * routing and access rules exercised here are the real ones — only the identity
 * provider is stubbed.
 */
export function DemoSignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const [selected, setSelected] = useState<Role>("employee");
  const [isSubmitting, setSubmitting] = useState(false);

  const signIn = () => {
    setSubmitting(true);
    document.cookie = `${DEMO_ROLE_COOKIE}=${selected}; path=/; max-age=86400; samesite=lax`;
    const redirect = params.get("redirect_url");
    router.push(redirect && redirect.startsWith("/") ? redirect : ROLE_HOME[selected]);
    router.refresh();
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Choose a demonstration account"
        className="space-y-2"
      >
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.role;
          return (
            <button
              key={option.role}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(option.role)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                isSelected
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                  : "border-border-default bg-surface hover:bg-surface-muted",
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-lg",
                  isSelected ? "bg-primary-600 text-white" : "bg-surface-muted text-foreground-muted",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{option.name}</span>
                <span className="block text-xs text-foreground-subtle">{option.title}</span>
                <span className="block truncate text-xs text-foreground-subtle">{option.detail}</span>
              </span>
              <span
                className={cn(
                  "size-4 shrink-0 rounded-full border-2",
                  isSelected ? "border-primary-600 bg-primary-600 ring-2 ring-inset ring-white" : "border-border-strong",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      <Button className="mt-5 w-full" size="lg" onClick={signIn} isLoading={isSubmitting}>
        Continue
      </Button>

      <p className="mt-4 rounded-lg border border-warning-100 bg-warning-50 p-3 text-xs text-warning-700 dark:border-warning-700/40 dark:bg-warning-700/10 dark:text-warning-500">
        <strong className="font-semibold">Demonstration mode.</strong> No Clerk instance is
        configured, so these stand in for real accounts. Add your Clerk keys to{" "}
        <code className="font-mono">.env.local</code> and this page becomes a real Clerk sign-in —
        no other code changes.
      </p>
    </div>
  );
}
