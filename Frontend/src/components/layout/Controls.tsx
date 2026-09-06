"use client";

import { Languages, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useT } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

/**
 * Both icons are always rendered and CSS decides which is visible. Choosing in
 * JavaScript would require knowing the resolved theme during the server render,
 * which is impossible when the preference is "system" — and guessing produces a
 * hydration mismatch on every load.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground",
        className,
      )}
    >
      <Moon className="size-[18px] dark:hidden" aria-hidden />
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
    </button>
  );
}

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useT();
  return (
    <button
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      aria-label={language === "en" ? "हिंदी में बदलें" : "Switch to English"}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground",
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      {language === "en" ? "EN" : "हिं"}
    </button>
  );
}
