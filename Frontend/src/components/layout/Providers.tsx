"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "./ThemeProvider";
import type { Language } from "@/schemas";

export function Providers({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  // Created inside the component so each server request gets its own cache.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider initialLanguage={initialLanguage}>{children}</I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
