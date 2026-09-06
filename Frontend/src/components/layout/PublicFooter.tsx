import Link from "next/link";
import { Brand } from "./Brand";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Course catalogue", href: "/courses" },
      { label: "TPAC programmes", href: "/programmes" },
      { label: "About the platform", href: "/about" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
  {
    title: "Competency domains",
    links: [
      { label: "Statistical", href: "/courses?domain=statistical" },
      { label: "Technical", href: "/courses?domain=technical" },
      { label: "Digital Governance", href: "/courses?domain=digital_governance" },
      { label: "Behavioural & Managerial", href: "/courses?domain=behavioural" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "iGOT Karmayogi", href: "https://igotkarmayogi.gov.in/", external: true },
      { label: "MoSPI", href: "https://www.mospi.gov.in/", external: true },
      { label: "Mission Karmayogi", href: "https://karmayogibharat.gov.in/", external: true },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border-default bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Brand />
            <p className="mt-3 max-w-xs text-sm text-foreground-subtle">
              AI-enabled competency assessment and personalised learning pathways for India&apos;s official
              statistical workforce.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground-subtle hover:text-foreground hover:underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-foreground-subtle hover:text-foreground hover:underline">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border-default pt-6 text-xs text-foreground-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>Built for Smart India Hackathon 2026 · Problem Statement 26101</p>
          <p>A prototype aligned to Mission Karmayogi and the iGOT ecosystem.</p>
        </div>
      </div>
    </footer>
  );
}
