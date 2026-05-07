import type { Locale } from '@/i18n/config'

/**
 * Per-locale instruction injected into Denaro's OpenAI system prompts so the
 * AI's free-form output matches the operator's chosen UI language.
 *
 * IMPORTANT: structural tokens stay in English on purpose so the client-side
 * parsers keep working without per-locale branches:
 *   - card route → JSON keys + bias enum ("bullish" / "bearish" / "range")
 *   - vision route → section headers + bias keyword (BULLISH / BEARISH /
 *     NEUTRAL / RANGE) consumed by `formatted-analysis.tsx`
 *
 * The pair card translates the bias enum to the user's locale via t(bias)
 * client-side; the vision pill currently stays in English.
 */
const NATIVE_LANGUAGE_NAME: Record<Locale, string> = {
  en: 'English',
  sq: 'Albanian (Shqip)',
  it: 'Italian (Italiano)',
  de: 'German (Deutsch)',
  fr: 'French (Français)',
  es: 'Spanish (Español)',
  pt: 'Brazilian Portuguese (Português)',
  tr: 'Turkish (Türkçe)',
  ru: 'Russian (Русский)',
  ar: 'Arabic (العربية)',
  ja: 'Japanese (日本語)',
  ko: 'Korean (한국어)',
  zh: 'Simplified Chinese (简体中文)',
}

export function getChatLanguageInstruction(locale: Locale): string {
  if (locale === 'en') return ''
  return `\n\nLANGUAGE: Respond in ${NATIVE_LANGUAGE_NAME[locale]}. Keep technical trading vocabulary (HH/HL, BoS, CHoCH, FVG, OB, liquidity sweep, mitigation) and ticker symbols in their standard English form, but write all surrounding prose, explanations, and structure in ${NATIVE_LANGUAGE_NAME[locale]}.`
}

export function getCardLanguageInstruction(locale: Locale): string {
  if (locale === 'en') return ''
  return `\n\nLANGUAGE: Write every JSON string value (the "summary" field and every string inside the "fields" object) in ${NATIVE_LANGUAGE_NAME[locale]}. KEEP these in English exactly: the JSON keys themselves, the "bias" field's enum value (must be one of "bullish" | "bearish" | "range"), trading vocabulary (HH/HL, BoS, CHoCH, FVG, OB, liquidity sweep, supply, demand, range, mean, pullback, retest), and ticker symbols. Translate only the natural-language explanations.`
}

export function getVisionLanguageInstruction(locale: Locale): string {
  if (locale === 'en') return ''
  return `\n\nLANGUAGE: Write the body of every section in ${NATIVE_LANGUAGE_NAME[locale]}. KEEP these in English exactly: every section header given to you (the **Header** lines, including any strategy-specific name), the single-word bias keyword in the **Bias** section (must be BULLISH, BEARISH, or NEUTRAL), trading vocabulary (BoS, CHoCH, FVG, OB, supply, demand, liquidity, pullback, retest, range, mean), and ticker symbols. Translate only the natural-language explanations.`
}
