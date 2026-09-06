import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { getSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/rbac";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Signed-in visitors get a link straight to their dashboard instead of "Sign in".
  const session = await getSession();
  return (
    <>
      <PublicHeader
        dashboardHref={session ? ROLE_HOME[session.role] : null}
        userName={session?.user.fullName ?? null}
      />
      {children}
      <PublicFooter />
    </>
  );
}
