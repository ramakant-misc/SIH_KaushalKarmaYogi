/**
 * Cookie names shared between server and client.
 *
 * These MUST live in a module without "use client". When a server component
 * imports from a client module, every export it receives is a client-reference
 * proxy rather than the real value — so a constant imported that way silently
 * becomes an object, and cookies().get() looks up nothing.
 */
export const THEME_COOKIE = "kky_theme";
export const LANGUAGE_COOKIE = "kky_lang";

export type ThemePreference = "light" | "dark" | "system";
