import { redirect } from "next/navigation";
import { ROLE_HOME } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";

/** /dashboard is a router: it sends each role to its own dashboard. */
export default async function DashboardIndex() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  redirect(ROLE_HOME[session.role]);
}
