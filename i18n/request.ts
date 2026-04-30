import { cookies, headers } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, type Locale } from './config'

export {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABEL,
  DEFAULT_LOCALE,
  type Locale,
} from './config'

function pickFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE
  const tags = header
    .split(',')
    .map((part) => part.split(';')[0]?.trim().toLowerCase())
    .filter(Boolean) as string[]
  for (const tag of tags) {
    const base = tag.split('-')[0] as Locale
    if ((LOCALES as readonly string[]).includes(base)) return base
  }
  return DEFAULT_LOCALE
}

export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value
  if (fromCookie && (LOCALES as readonly string[]).includes(fromCookie)) {
    return fromCookie as Locale
  }
  const h = await headers()
  return pickFromAcceptLanguage(h.get('accept-language'))
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale()
  const messages = (await import(`../messages/${locale}.json`)).default
  return { locale, messages }
})
