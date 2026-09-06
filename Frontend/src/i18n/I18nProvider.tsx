"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DICTIONARIES, type TranslationKey } from "./dictionaries";
import type { Language } from "@/schemas";

type I18nValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
export const LANGUAGE_COOKIE = "kky_lang";

/**
 * Language is persisted in a cookie rather than localStorage so the SERVER can
 * read it and render the correct language on the first paint. Reading it on the
 * client after mount would render English and then flip to Hindi — a visible
 * flash, and a hydration mismatch, on every page load for Hindi users.
 */
export function I18nProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    // One year, site-wide, so the choice survives navigation and return visits.
    document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: TranslationKey) => DICTIONARIES[language][key] ?? DICTIONARIES.en[key],
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside I18nProvider");
  return ctx;
}
