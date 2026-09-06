"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { THEME_COOKIE, type ThemePreference } from "@/lib/preferences";

const ThemeContext = createContext<{ theme: ThemePreference; toggle: () => void } | null>(null);

/**
 * Theme is persisted in a cookie and applied by the SERVER as a class on <html>.
 *
 * The obvious alternative — an inline <script> in <head> that reads storage
 * before hydration — does not work in the App Router: React does not execute
 * script tags rendered inside components on the client, and hydration then
 * overwrites <html className>, stripping the class the script had added. Doing
 * it server-side removes both the flash and the mismatch.
 *
 * With no cookie set, no class is emitted and the CSS falls back to
 * prefers-color-scheme, so a first-time visitor still gets their system theme.
 */
export function ThemeProvider({
  children,
  initialTheme = "system",
}: {
  children: React.ReactNode;
  initialTheme?: ThemePreference;
}) {
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const root = document.documentElement;
      // From "system", flip to the opposite of what is currently displayed.
      const showingDark =
        current === "dark" ||
        (current === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      const next: ThemePreference = showingDark ? "light" : "dark";

      root.classList.toggle("dark", next === "dark");
      root.classList.toggle("light", next === "light");
      document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
