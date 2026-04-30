/** Locale constants — safe to import from client components.
 *  No server-only imports (cookies/headers) live here. */

export const LOCALES = [
  'en',
  'sq',
  'it',
  'de',
  'fr',
  'es',
  'pt',
  'tr',
  'ru',
  'ar',
  'ja',
  'ko',
  'zh',
] as const
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
  pt: 'Português',
  tr: 'Türkçe',
  ru: 'Русский',
  ar: 'العربية',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
}

/** Two-letter ISO code shown in compact UI (uppercase). */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  sq: 'SQ',
  it: 'IT',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  pt: 'PT',
  tr: 'TR',
  ru: 'RU',
  ar: 'AR',
  ja: 'JA',
  ko: 'KO',
  zh: 'ZH',
}

/** Flag emoji for the dropdown — drop-in extensible when new locales land.
 *  pt → Brazil flag because BR is by far the larger trading market.
 *  zh → mainland China flag because Simplified Chinese targets that audience. */
export const LOCALE_FLAG: Record<Locale, string> = {
  en: '🇬🇧',
  sq: '🇦🇱',
  it: '🇮🇹',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  pt: '🇧🇷',
  tr: '🇹🇷',
  ru: '🇷🇺',
  ar: '🇸🇦',
  ja: '🇯🇵',
  ko: '🇰🇷',
  zh: '🇨🇳',
}

/** Right-to-left scripts. Drives the `dir` attribute on <html>. */
const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(['ar'])

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale)
}

export function getDir(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}
