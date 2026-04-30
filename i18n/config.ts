/** Locale constants — safe to import from client components.
 *  No server-only imports (cookies/headers) live here. */

export const LOCALES = ['en', 'sq', 'it', 'de', 'fr', 'es', 'tr', 'ar'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

/** Native label shown in the dropdown. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  sq: 'Shqip',
  it: 'Italiano',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  tr: 'Türkçe',
  ar: 'العربية',
}

/** Two-letter ISO code shown in compact UI (uppercase). */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  sq: 'SQ',
  it: 'IT',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  tr: 'TR',
  ar: 'AR',
}

/** Flag emoji for the dropdown — drop-in extensible when new locales land. */
export const LOCALE_FLAG: Record<Locale, string> = {
  en: '🇬🇧',
  sq: '🇦🇱',
  it: '🇮🇹',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  tr: '🇹🇷',
  ar: '🇸🇦',
}

/** Right-to-left scripts. Drives the `dir` attribute on <html>. */
const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['ar'])

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale)
}

export function getDir(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}
