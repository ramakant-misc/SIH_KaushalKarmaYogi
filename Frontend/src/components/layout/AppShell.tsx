"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Award, BookOpen, CalendarDays, ChartColumn, ClipboardCheck, Code2, FileText, FlaskConical,
  LayoutDashboard, Library, LogOut, Menu, Plug, Route, ScrollText, Sparkles, Target,
  TrendingUp, Upload, Users, Wand2, X, type LucideIcon,
} from "lucide-react";
import { Brand } from "./Brand";
import { LanguageToggle, ThemeToggle } from "./Controls";
import { Badge } from "@/components/ui/Badge";
import { DEMO_ROLE_COOKIE } from "@/lib/auth/config";
import { cn } from "@/lib/cn";
import { ROLE_LABELS, type Role, type User } from "@/schemas";
import type { NavSection } from "@/lib/auth/nav";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, BookOpen, Route, ClipboardCheck, FlaskConical, Target, TrendingUp, Award,
  Library, CalendarDays, Sparkles, ChartColumn, FileText, Users, Upload, Wand2, Plug, Code2,
  ScrollText,
};

export function AppShell({
  user,
  role,
  nav,
  clerkEnabled,
  children,
}: {
  user: User;
  role: Role;
  nav: NavSection[];
  clerkEnabled: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signOut = () => {
    // Clerk mode routes through Clerk's own sign-out page.
    if (clerkEnabled) {
      router.push("/sign-out");
      return;
    }
    document.cookie = `${DEMO_ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
    router.push("/");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-default px-4">
        <Brand />
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="rounded-lg p-1.5 text-foreground-subtle hover:bg-surface-muted lg:hidden"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
        {nav.map((section) => (
          <div key={section.title} className="mb-5">
            <h2 className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-foreground-subtle">
              {section.title}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                // Exact match for index routes so /competency does not stay lit on /competency/gaps.
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                          : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border-default p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
            {user.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{user.fullName}</span>
            <span className="block truncate text-xs text-foreground-subtle">{ROLE_LABELS[role]}</span>
          </span>
        </div>
        <button
          onClick={signOut}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border-default bg-surface lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border-default bg-surface lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border-default bg-surface/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-foreground">{user.department ?? "—"}</p>
              <p className="truncate text-xs text-foreground-subtle">{user.designation ?? ROLE_LABELS[role]}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!clerkEnabled && <Badge tone="warning">Demo mode</Badge>}
            <Link
              href="/assistant"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground"
            >
              <Sparkles className="size-4" aria-hidden />
              <span className="hidden sm:inline">Assistant</span>
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
