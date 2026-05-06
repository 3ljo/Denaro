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

/**
 * Gold-themed language switcher built to match the eSports template's
 * navbar aesthetic (Barlow heading font, deep dark glass, gold accents,
 * tracked uppercase). Functionally identical to the cyan one used inside
 * the Denaro app — same setLocale server action, same locale list.
 */
export default function TemplateLanguageSwitcher() {
  const current = useLocale() as Locale
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

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

  function pick(next: Locale) {
    if (next === current || isPending) return
    setOpen(false)
    startTransition(() => {
      void setLocale(next)
    })
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: open ? 'rgba(251, 191, 36, 0.10)' : 'rgba(15, 22, 27, 0.55)',
          border: `1px solid ${open ? 'rgba(251, 191, 36, 0.7)' : 'rgba(251, 191, 36, 0.32)'}`,
          borderRadius: 4,
          color: open ? '#fde68a' : '#fbbf24',
          fontFamily: 'var(--tg-heading-font-family)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.5 : 1,
          transition: 'border-color 180ms, background-color 180ms, color 180ms, box-shadow 180ms',
          boxShadow: open ? '0 0 14px rgba(251, 191, 36, 0.28)' : 'none',
        }}
      >
        <GlobeIcon />
        <span>{LOCALE_SHORT[current]}</span>
        <Caret open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            minWidth: 200,
            margin: 0,
            padding: 6,
            listStyle: 'none',
            background: 'rgba(10, 14, 19, 0.96)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 14px 40px rgba(0, 0, 0, 0.6), 0 0 22px rgba(251, 191, 36, 0.12)',
            zIndex: 1000,
            maxHeight: 360,
            overflowY: 'auto',
          }}
        >
          {LOCALES.map((loc) => {
            const on = loc === current
            return (
              <li key={loc} style={{ margin: 0 }}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => pick(loc)}
                  disabled={isPending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 10px',
                    background: on ? 'rgba(251, 191, 36, 0.14)' : 'transparent',
                    border: 'none',
                    borderRadius: 3,
                    color: on ? '#fde68a' : 'rgba(255, 255, 255, 0.82)',
                    fontFamily: 'var(--tg-body-font-family)',
                    fontWeight: on ? 700 : 500,
                    fontSize: 12,
                    letterSpacing: '0.06em',
                    textAlign: 'left',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    opacity: isPending && !on ? 0.5 : 1,
                    transition: 'background-color 140ms, color 140ms',
                  }}
                  onMouseEnter={(e) => {
                    if (!on) e.currentTarget.style.background = 'rgba(251, 191, 36, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    if (!on) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
                    {LOCALE_FLAG[loc]}
                  </span>
                  <span style={{ flex: 1 }}>{LOCALE_LABEL[loc]}</span>
                  <span
                    style={{
                      fontFamily: 'var(--tg-heading-font-family)',
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      color: on ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {LOCALE_SHORT[loc]}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      style={{ transition: 'transform 180ms', transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <path
        d="M2.5 4.5l3.5 3 3.5-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
