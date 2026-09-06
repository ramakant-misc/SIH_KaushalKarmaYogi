import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "@/components/layout/Providers";
import { LANGUAGE_COOKIE, THEME_COOKIE, type ThemePreference } from "@/lib/preferences";
import type { Language } from "@/schemas";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "KaushalKarmaYogi — AI Skill Intelligence for Official Statistics",
    template: "%s | KaushalKarmaYogi",
  },
  description:
    "AI-enabled competency assessment, skill-gap analysis and personalised learning pathways for India's official statistical workforce, integrated with iGOT Karmayogi.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Theme and language are read server-side so the first paint is already
  // correct — no flash, and no hydration mismatch from deciding on the client.
  const cookieStore = await cookies();

  const storedLanguage = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const language: Language = storedLanguage === "hi" ? "hi" : "en";

  const storedTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme: ThemePreference =
    storedTheme === "dark" ? "dark" : storedTheme === "light" ? "light" : "system";

  return (
    <html
      lang={language}
      // No class when the user has not chosen: the CSS then follows the OS setting.
      className={`${geistSans.variable} ${geistMono.variable} h-full ${theme === "system" ? "" : theme}`}
    >
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">
          Skip to main content
        </a>
        <Providers initialLanguage={language} initialTheme={theme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
