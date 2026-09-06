import { NextResponse, type NextRequest } from "next/server";
import { CLERK_ENABLED, DEMO_ROLE_COOKIE } from "@/lib/auth/config";
import { canAccess, isPublicRoute } from "@/lib/auth/rbac";
import type { Role } from "@/schemas";

/**
 * Route protection.
 *
 * This is a UX guard: it decides what the browser is allowed to navigate to.
 * It is NOT the security boundary — the API enforces roles server-side on every
 * request, because a client-side check can always be bypassed.
 *
 * With Clerk configured, clerkMiddleware runs instead (see middlewareClerk),
 * reading the same ROUTE_ROLES table so the two modes cannot diverge.
 */
function guard(request: NextRequest, role: Role | null) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) return NextResponse.next();

  if (!role) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signIn);
  }

  if (!canAccess(pathname, role)) {
    return NextResponse.rewrite(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export default async function middleware(request: NextRequest) {
  if (!CLERK_ENABLED) {
    const cookieRole = request.cookies.get(DEMO_ROLE_COOKIE)?.value;
    const role: Role | null =
      cookieRole === "employee" || cookieRole === "administrator" || cookieRole === "engineer"
        ? cookieRole
        : null;
    return guard(request, role);
  }

  const { clerkMiddleware } = await import("@clerk/nextjs/server");
  return clerkMiddleware(async (auth) => {
    const { userId, sessionClaims } = await auth();
    const metadata = (sessionClaims?.publicMetadata ?? {}) as { role?: Role };
    return guard(request, userId ? (metadata.role ?? "employee") : null);
  })(request, {} as never);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};
