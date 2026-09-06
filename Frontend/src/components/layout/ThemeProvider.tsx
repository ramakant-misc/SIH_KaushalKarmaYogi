"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);
export const THEME_STORAGE_KEY = "kky.theme";

/**
 * The blocking script in <head> (see ThemeScript) applies the theme class before
 * the first paint, so there is no flash of the wrong theme. This provider reads
 * back what that script decided instead of deciding again in an effect.
 */
function readAppliedTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readAppliedTheme);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Storage unavailable (private mode): the theme still applies for this session.
      }
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

/**
 * Runs before React hydrates. Kept tiny and synchronous on purpose — anything
 * async here reintroduces the flash it exists to prevent.
 */
export function ThemeScript() {
  const script = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=s==="dark"||(!s&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
