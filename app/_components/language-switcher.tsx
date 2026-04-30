'use client'

import { useLocale } from 'next-intl'
import { useEffect, useRef, useState, useTransition } from 'react'
import { setLocale } from '@/lib/i18n/actions'
import {
  LOCALES,
  LOCALE_FLAG,
  LOCALE_LABEL,
  LOCALE_SHORT,
  type Locale,
} from '@/i18n/config'

type Variant = 'dropdown' | 'compact' | 'pill'

export default function LanguageSwitcher({
  variant = 'dropdown',
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

  if (variant === 'dropdown') {
    return <Dropdown current={current} pick={pick} isPending={isPending} />
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
              {LOCALE_SHORT[loc]}
            </button>
          )
        })}
      </div>
    )
  }

  // compact
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
                on ? 'text-amber-200' : 'text-cyan-200/55 hover:text-cyan-100'
              }`}
            >
              {LOCALE_SHORT[loc].toLowerCase()}
            </button>
          </span>
        )
      })}
    </div>
  )
}

function Dropdown({
  current,
  pick,
  isPending,
}: {
  current: Locale
  pick: (loc: Locale) => void
  isPending: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click + Escape — standard combobox UX.
  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function choose(loc: Locale) {
    setOpen(false)
    pick(loc)
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-md border bg-cyan-500/[0.04] px-2.5 py-1.5 font-display text-[0.65rem] tracking-[0.2em] uppercase transition disabled:opacity-50 ${
          open
            ? 'border-amber-300/60 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
            : 'border-cyan-400/25 text-cyan-100/85 hover:border-cyan-300/55 hover:bg-cyan-500/[0.08] hover:text-cyan-50'
        }`}
      >
        <span className="text-base leading-none" aria-hidden>
          {LOCALE_FLAG[current]}
        </span>
        <span>{LOCALE_SHORT[current]}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={`transition ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M2.5 4.5l3.5 3 3.5-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-md border border-cyan-400/25 bg-denaro-bg/95 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.55)] backdrop-blur-lg"
        >
          {LOCALES.map((loc) => {
            const on = loc === current
            return (
              <li key={loc}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => choose(loc)}
                  disabled={isPending}
                  className={`flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left transition disabled:opacity-50 ${
                    on
                      ? 'bg-amber-400/15 text-amber-100'
                      : 'text-cyan-100/85 hover:bg-cyan-500/10 hover:text-cyan-50'
                  }`}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {LOCALE_FLAG[loc]}
                  </span>
                  <span className="flex-1 font-display text-[0.7rem] tracking-[0.18em]">
                    {LOCALE_LABEL[loc]}
                  </span>
                  <span className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/55">
                    {LOCALE_SHORT[loc]}
                  </span>
                  {on && (
                    <span className="font-display text-[0.55rem] tracking-[0.2em] text-amber-300">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
