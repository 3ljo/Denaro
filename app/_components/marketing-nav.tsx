'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './language-switcher'

export default function MarketingNav({ isAuthed }: { isAuthed: boolean }) {
  const t = useTranslations('marketing.nav')
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/#features', label: t('features') },
    { href: '/#strategies', label: t('strategies') },
    { href: '/pricing', label: t('pricing') },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-400/15 bg-denaro-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-5">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-sm font-bold uppercase tracking-[0.28em] text-cyan-50 sm:text-base sm:tracking-[0.3em]">
            Denaro
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-display text-[0.7rem] tracking-[0.22em] text-cyan-100/70 transition hover:text-amber-200"
            >
              {l.label.toUpperCase()}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="denaro-btn !w-auto !px-4 !py-2 !text-[0.62rem]"
            >
              {t('openApp')}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="font-display text-[0.65rem] tracking-[0.22em] text-cyan-100/80 transition hover:text-amber-200"
              >
                {t('signIn').toUpperCase()}
              </Link>
              <Link
                href="/register"
                className="denaro-btn !w-auto !px-4 !py-2 !text-[0.62rem]"
              >
                {t('signUp')}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? t('close') : t('menu')}
          className="inline-flex items-center justify-center rounded border border-cyan-400/30 bg-cyan-500/[0.06] p-2 text-cyan-100 transition hover:border-cyan-300/60 md:hidden"
        >
          {open ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-cyan-400/15 bg-denaro-bg/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-3 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-2.5 font-display text-[0.72rem] tracking-[0.22em] text-cyan-100/85 transition hover:bg-cyan-500/10 hover:text-amber-200"
              >
                {l.label.toUpperCase()}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-cyan-400/15 pt-3">
              <LanguageSwitcher />
              {isAuthed ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="denaro-btn !w-auto !px-4 !py-2 !text-[0.62rem]"
                >
                  {t('openApp')}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="denaro-btn-ghost"
                  >
                    {t('signIn')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="denaro-btn !w-auto !px-4 !py-2 !text-[0.62rem]"
                  >
                    {t('signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function Logo() {
  return (
    <span
      aria-hidden
      className="relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-amber-300/60 bg-gradient-to-br from-amber-300/30 via-amber-400/10 to-cyan-400/20 shadow-[0_0_18px_rgba(251,191,36,0.35)]"
    >
      <span className="font-display text-[0.7rem] font-bold tracking-[0.05em] text-amber-100">
        D
      </span>
    </span>
  )
}
