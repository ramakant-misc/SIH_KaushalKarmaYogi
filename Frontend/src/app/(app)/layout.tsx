import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CLERK_ENABLED } from "@/lib/auth/config";
import { ROLE_NAV } from "@/lib/auth/nav";
import { getSession } from "@/lib/auth/session";

/**
 * Shell for every signed-in route.
 *
 * Middleware already redirects unauthenticated visitors; this second check is
 * the server-side backstop, so a route can never render with no session even if
 * the matcher misses it.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <AppShell
      user={session.user}
      role={session.role}
      nav={ROLE_NAV[session.role]}
      clerkEnabled={CLERK_ENABLED}
    >
      {children}
    </AppShell>
  );
}
