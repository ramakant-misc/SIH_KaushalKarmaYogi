import type { CompetencyDomain } from "@/schemas";

/**
 * One colour per competency domain, used identically in every chart so a colour
 * always means the same thing across the product.
 */
export const DOMAIN_COLORS: Record<CompetencyDomain, string> = {
  statistical: "#4f46e5",
  technical: "#0891b2",
  digital_governance: "#7c3aed",
  behavioural: "#db2777",
};

/** Categorical series colours for charts not keyed by domain. */
export const SERIES_COLORS = ["#4f46e5", "#0891b2", "#7c3aed", "#db2777", "#f59e0b", "#10b981"];

export const SEVERITY_COLORS = {
  critical: "#dc2626",
  high: "#ea580c",
  moderate: "#f59e0b",
  low: "#10b981",
} as const;

/** Chart text/grid colours that work in both themes. */
export const AXIS_COLOR = "var(--foreground-subtle)";
export const GRID_COLOR = "var(--border)";
