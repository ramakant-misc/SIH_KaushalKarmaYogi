"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Brand } from "./Brand";
import { LanguageToggle, ThemeToggle } from "./Controls";
import { ButtonLink } from "@/components/ui/Button";
import { useT } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/courses", key: "nav.courses" },
  { href: "/programmes", key: "nav.programmes" },
  { href: "/about", key: "nav.about" },
] as const;

export function PublicHeader({
  dashboardHref = null,
  userName = null,
}: {
  dashboardHref?: string | null;
  userName?: string | null;
} = {}) {
  const { t } = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-surface-muted text-foreground"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          {dashboardHref ? (
            <ButtonLink href={dashboardHref} size="sm" className="ml-1 hidden sm:inline-flex">
              {userName ? `${userName.split(" ")[0]}'s dashboard` : t("nav.dashboard")}
            </ButtonLink>
          ) : (
            <ButtonLink href="/sign-in" size="sm" className="ml-1 hidden sm:inline-flex">
              {t("action.signIn")}
            </ButtonLink>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface-muted md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-border-default bg-surface px-4 py-3 md:hidden" aria-label="Mobile">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <ButtonLink href={dashboardHref ?? "/sign-in"} size="sm" className="w-full">
                {dashboardHref ? t("nav.dashboard") : t("action.signIn")}
              </ButtonLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
