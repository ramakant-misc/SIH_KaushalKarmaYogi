/**
 * Auth mode.
 *
 * Clerk throws on a placeholder publishable key, which would make the whole app
 * unrunnable for anyone who has not yet created a Clerk instance. So the app
 * detects a real key and falls back to a demo session when there isn't one.
 * Both modes go through the same session, role and guard code — adding real
 * keys changes the identity provider, not the application.
 */
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const CLERK_ENABLED =
  publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_");

/** Only set in demo mode. Never used when Clerk is configured. */
export const DEMO_ROLE_COOKIE = "kky_demo_role";
