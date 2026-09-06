import type { Role } from "@/schemas";

export type NavItem = { href: string; label: string; icon: string };
export type NavSection = { title: string; items: NavItem[] };

/**
 * Sidebar navigation per role. Icon names map to lucide-react components in
 * AppShell — kept as strings so this module stays server-safe.
 */
export const ROLE_NAV: Record<Role, NavSection[]> = {
  employee: [
    {
      title: "Learning",
      items: [
        { href: "/dashboard/employee", label: "Dashboard", icon: "LayoutDashboard" },
        { href: "/my-courses", label: "My Courses", icon: "BookOpen" },
        { href: "/learning-paths", label: "Learning Paths", icon: "Route" },
        { href: "/assessments", label: "Assessments", icon: "ClipboardCheck" },
        { href: "/labs", label: "Virtual Labs", icon: "FlaskConical" },
      ],
    },
    {
      title: "Competency",
      items: [
        { href: "/competency", label: "My Competencies", icon: "Target" },
        { href: "/competency/gaps", label: "Skill Gaps", icon: "TrendingUp" },
        { href: "/certificates", label: "Certificates", icon: "Award" },
      ],
    },
    {
      title: "Explore",
      items: [
        { href: "/courses", label: "Course Catalogue", icon: "Library" },
        { href: "/programmes", label: "TPAC Programmes", icon: "CalendarDays" },
        { href: "/assistant", label: "AI Assistant", icon: "Sparkles" },
      ],
    },
  ],
  administrator: [
    {
      title: "Overview",
      items: [
        { href: "/dashboard/admin", label: "Dashboard", icon: "LayoutDashboard" },
        { href: "/admin/analytics", label: "Analytics", icon: "ChartColumn" },
        { href: "/admin/reports", label: "Reports", icon: "FileText" },
      ],
    },
    {
      title: "Workforce",
      items: [
        { href: "/admin/workforce", label: "Workforce", icon: "Users" },
        { href: "/admin/programmes", label: "Programmes", icon: "CalendarDays" },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/studio/uploads", label: "Content Uploads", icon: "Upload" },
        { href: "/studio/generate", label: "Generate Questions", icon: "Wand2" },
        { href: "/assistant", label: "AI Assistant", icon: "Sparkles" },
      ],
    },
  ],
  engineer: [
    {
      title: "Platform",
      items: [
        { href: "/dashboard/engineer", label: "Dashboard", icon: "LayoutDashboard" },
        { href: "/engineer/integrations", label: "Integrations", icon: "Plug" },
        { href: "/engineer/api-registry", label: "API Registry", icon: "Code2" },
        { href: "/engineer/audit", label: "Audit Log", icon: "ScrollText" },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/studio/uploads", label: "Content Uploads", icon: "Upload" },
        { href: "/studio/generate", label: "Generate Questions", icon: "Wand2" },
        { href: "/assistant", label: "AI Assistant", icon: "Sparkles" },
      ],
    },
  ],
};
