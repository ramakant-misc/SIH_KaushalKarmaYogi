import type { Role } from "@/schemas";

/**
 * Role-based access control.
 *
 * ROUTE_ROLES is the single definition of who may see what. Middleware, server
 * guards and navigation rendering all read it, so they cannot drift apart.
 */

export const ROLE_HOME: Record<Role, string> = {
  employee: "/dashboard/employee",
  administrator: "/dashboard/admin",
  engineer: "/dashboard/engineer",
};

/** Longest matching prefix wins. An unlisted route needs auth but no role. */
export const ROUTE_ROLES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/dashboard/employee", roles: ["employee"] },
  { prefix: "/dashboard/admin", roles: ["administrator"] },
  { prefix: "/dashboard/engineer", roles: ["engineer"] },
  { prefix: "/competency", roles: ["employee"] },
  { prefix: "/learning-paths", roles: ["employee"] },
  { prefix: "/my-courses", roles: ["employee"] },
  { prefix: "/assessments", roles: ["employee"] },
  { prefix: "/certificates", roles: ["employee"] },
  { prefix: "/labs", roles: ["employee"] },
  { prefix: "/admin", roles: ["administrator"] },
  { prefix: "/studio", roles: ["administrator", "engineer"] },
  { prefix: "/engineer", roles: ["engineer"] },
];

export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/courses",
  "/programmes",
  "/sign-in",
  "/sign-up",
  "/design",
  "/403",
];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** The roles allowed on a path, or null when any signed-in user may view it. */
export function rolesForPath(pathname: string): Role[] | null {
  const match = ROUTE_ROLES.filter((entry) => pathname.startsWith(entry.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  )[0];
  return match ? match.roles : null;
}

export function canAccess(pathname: string, role: Role | null): boolean {
  if (isPublicRoute(pathname)) return true;
  if (!role) return false;
  const roles = rolesForPath(pathname);
  return roles === null || roles.includes(role);
}
