'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { logout } from '@/lib/auth/actions'

/** Avatar that opens a menu with greeting, settings, language, and logout.
 *  Replaces three separate header controls (logout / language / avatar) so
 *  the mobile header doesn't get crowded. */
export default function ProfileMenu({
  displayName,
  email,
  lensLabel,
}: {
  displayName: string | null
  email: string
  /** Translated strategy label, e.g. "Smart Money Concepts" */
  lensLabel: string
}) {
  const t = useTranslations('dashboard.header')
  const initial = pickInitial(displayName, email)
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

  const greeting = displayName || email.split('@')[0]

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('openSettings')}
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/[0.06] font-display text-[0.85rem] font-bold uppercase tracking-wide text-cyan-100 transition hover:border-amber-300/70 hover:bg-amber-400/15 hover:text-amber-100"
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-full blur-md transition ${open ? 'bg-amber-400/30' : 'bg-cyan-400/0 group-hover:bg-amber-400/30'}`}
        />
        <span className="relative">{initial}</span>
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-denaro-bg bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md border border-cyan-400/25 bg-denaro-bg/95 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          {/* Identity strip */}
          <div className="border-b border-cyan-400/15 px-3 py-2.5">
            <p className="truncate font-display text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cyan-50">
              {greeting}
            </p>
            <p className="mt-0.5 truncate text-[0.6rem] tracking-wide text-cyan-100/45">
              {email}
            </p>
            <p className="mt-1.5 text-[0.6rem] tracking-wide text-cyan-100/55">
              {t('lens')} <span className="text-amber-200/85">{lensLabel}</span>
            </p>
          </div>

          {/* Settings link */}
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-cyan-100/85 transition hover:bg-cyan-500/10 hover:text-cyan-50"
          >
            <SettingsIcon />
            <span className="font-display text-[0.7rem] tracking-[0.18em]">
              {t('settings')}
            </span>
          </Link>

          {/* Logout */}
          <form action={logout} role="none">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 border-t border-cyan-400/15 px-3 py-2.5 text-rose-200/90 transition hover:bg-rose-500/10 hover:text-rose-100"
            >
              <LogoutIcon />
              <span className="font-display text-[0.7rem] tracking-[0.18em]">
                {t('logout')}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function pickInitial(displayName: string | null, email: string): string {
  const source = (displayName ?? '').trim() || email
  if (!source) return '?'
  const m = source.match(/\p{L}|\p{N}/u)
  return (m?.[0] ?? source[0] ?? '?').toUpperCase()
}

function SettingsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}
