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

/** Two-letter ISO code shown in compact UI (uppercase). */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  sq: 'SQ',
}

/** Flag emoji for the dropdown — drop-in extensible when new locales land. */
export const LOCALE_FLAG: Record<Locale, string> = {
  en: '🇬🇧',
  sq: '🇦🇱',
}
