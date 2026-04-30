'use client'

import { useLocale } from 'next-intl'
import { useTransition } from 'react'
import { setLocale } from '@/lib/i18n/actions'
import { LOCALES, LOCALE_LABEL, type Locale } from '@/i18n/config'

type Variant = 'compact' | 'pill'

export default function LanguageSwitcher({
  variant = 'compact',
}: {
  variant?: Variant
}) {
  const current = useLocale() as Locale
  const [isPending, startTransition] = useTransition()

  function pick(next: Locale) {
    if (next === current || isPending) return
    startTransition(() => {
      void setLocale(next)
    })
  }

  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center gap-1 rounded-md border border-cyan-400/25 bg-cyan-500/[0.04] p-0.5">
        {LOCALES.map((loc) => {
          const on = loc === current
          return (
            <button
              key={loc}
              type="button"
              onClick={() => pick(loc)}
              disabled={isPending}
              aria-pressed={on}
              className={`rounded px-2 py-1 font-display text-[0.6rem] tracking-[0.2em] uppercase transition disabled:opacity-50 ${
                on
                  ? 'bg-amber-400/15 text-amber-100 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                  : 'text-cyan-200/65 hover:bg-cyan-500/10 hover:text-cyan-100'
              }`}
            >
              {loc.toUpperCase()}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1 font-display text-[0.6rem] tracking-[0.2em]">
      {LOCALES.map((loc, i) => {
        const on = loc === current
        return (
          <span key={loc} className="flex items-center gap-1">
            {i > 0 && <span className="text-cyan-200/30">·</span>}
            <button
              type="button"
              onClick={() => pick(loc)}
              disabled={isPending}
              aria-pressed={on}
              title={LOCALE_LABEL[loc]}
              className={`uppercase transition disabled:opacity-50 ${
                on
                  ? 'text-amber-200'
                  : 'text-cyan-200/55 hover:text-cyan-100'
              }`}
            >
              {loc}
            </button>
          </span>
        )
      })}
    </div>
  )
}
