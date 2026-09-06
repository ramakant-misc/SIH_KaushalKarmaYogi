import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/rbac";
import { ROLE_LABELS } from "@/schemas";

export const metadata = { title: "Not authorised" };

export default async function ForbiddenPage() {
  const session = await getSession();

  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-danger-50 text-danger-600 dark:bg-danger-700/15">
          <ShieldAlert className="size-7" aria-hidden />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-foreground">You do not have access to this page</h1>
        <p className="mt-2 text-sm text-foreground-subtle">
          {session
            ? `You are signed in as ${ROLE_LABELS[session.role]}. This area is restricted to a different role.`
            : "Sign in with an account that has permission for this area."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {session ? (
            <ButtonLink href={ROLE_HOME[session.role]}>Go to my dashboard</ButtonLink>
          ) : (
            <ButtonLink href="/sign-in">Sign in</ButtonLink>
          )}
          <ButtonLink href="/" variant="secondary">Home</ButtonLink>
        </div>
      </div>
    </main>
  );
}
