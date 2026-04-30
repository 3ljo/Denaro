/** Locale constants — safe to import from client components.
 *  No server-only imports (cookies/headers) live here. */

export const LOCALES = ['en', 'sq'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  sq: 'Shqip',
}
