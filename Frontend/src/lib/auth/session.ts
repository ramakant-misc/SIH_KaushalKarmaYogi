import { cookies } from "next/headers";
import { CLERK_ENABLED, DEMO_ROLE_COOKIE } from "./config";
import { DEMO_USER_IDS, USER_BY_ID } from "@/mocks";
import type { Role, User } from "@/schemas";

export type Session = { user: User; role: Role } | null;

/**
 * Resolves the signed-in user on the server.
 *
 * With Clerk configured this reads the Clerk session and its publicMetadata
 * role. Without it, a demo role cookie stands in so the whole application —
 * routing, guards, dashboards — can be demonstrated before Clerk exists.
 */
export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();

  if (CLERK_ENABLED) {
    // Imported lazily so the package is never loaded in demo mode.
    const { auth } = await import("@clerk/nextjs/server");
    const { userId, sessionClaims } = await auth();
    if (!userId) return null;

    const metadata = (sessionClaims?.publicMetadata ?? {}) as { role?: Role };
    const role: Role = metadata.role ?? "employee";

    const claims = sessionClaims as { email?: string; fullName?: string } | undefined;
    return {
      role,
      user: {
        id: userId,
        email: claims?.email ?? "",
        fullName: claims?.fullName ?? "Official",
        avatarUrl: null,
        role,
        department: null,
        designation: null,
        preferredLanguage: "en",
        isProfileComplete: true,
        createdAt: new Date().toISOString(),
      },
    };
  }

  const demoRole = cookieStore.get(DEMO_ROLE_COOKIE)?.value;
  if (demoRole !== "employee" && demoRole !== "administrator" && demoRole !== "engineer") return null;

  const user = USER_BY_ID[DEMO_USER_IDS[demoRole]];
  if (!user) return null;
  return { user, role: demoRole };
}

export async function requireSession(): Promise<NonNullable<Session>> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}
