import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { Providers } from "@/components/layout/Providers";
import { ThemeScript } from "@/components/layout/ThemeProvider";
import { LANGUAGE_COOKIE } from "@/i18n/I18nProvider";
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
  // Read the language server-side so Hindi renders on the first paint, not after it.
  const cookieStore = await cookies();
  const stored = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const language: Language = stored === "hi" ? "hi" : "en";

  return (
    <html lang={language} className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">
          Skip to main content
        </a>
        <Providers initialLanguage={language}>{children}</Providers>
      </body>
    </html>
  );
}
