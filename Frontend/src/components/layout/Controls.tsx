"use client";

import { Languages, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useT } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
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
