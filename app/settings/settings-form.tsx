'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import {
  POPULAR_PAIRS,
  STRATEGIES,
  type Profile,
  type Strategy,
} from '@/lib/profile/types'
import { saveSettings } from '@/lib/profile/actions'
import { deleteAccount, logout } from '@/lib/auth/actions'
import LanguageSwitcher from '@/app/_components/language-switcher'

type SettingsTabId = 'profile' | 'trading' | 'account'
const TAB_IDS: SettingsTabId[] = ['profile', 'trading', 'account']

const TAB_ICONS: Record<SettingsTabId, React.ReactNode> = {
  profile: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  trading: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="13" width="3.5" height="7" />
      <rect x="10.25" y="8" width="3.5" height="12" />
      <rect x="16.5" y="11" width="3.5" height="9" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  ),
  account: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
}

export default function SettingsForm({
  profile,
  email,
}: {
  profile: Profile
  email: string
}) {
  const t = useTranslations('settings')
  const tTabs = useTranslations('settings.tabs')
  const tSec = useTranslations('settings.sections')
  const tField = useTranslations('settings.fields')
  const tDanger = useTranslations('settings.sections.danger')
  const tStrat = useTranslations('strategies')
  const tHeader = useTranslations('dashboard.header')
  const tErr = useTranslations('auth.errors')

  const [tab, setTab] = useState<SettingsTabId>('profile')
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [pairs, setPairs] = useState<string[]>(profile.pairs ?? [])
  const [strategy, setStrategy] = useState<Strategy>(profile.strategy)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, startDeleting] = useTransition()
  const canDelete = deleteConfirm.trim() === 'DELETE'

  function submitDelete() {
    setDeleteError(null)
    const fd = new FormData()
    fd.set('confirm', deleteConfirm.trim())
    startDeleting(async () => {
      const result = await deleteAccount(fd)
      if (result?.errorKey) setDeleteError(tErr(result.errorKey))
    })
  }

  function togglePair(symbol: string) {
    setPairs((curr) => {
      if (curr.includes(symbol)) return curr.filter((s) => s !== symbol)
      if (curr.length >= 3) return curr
      return [...curr, symbol]
    })
  }

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await saveSettings({
        pairs,
        strategy,
        displayName,
      })
      if (result?.errorKey) setError(tErr(result.errorKey))
      else if (result?.error) setError(result.error)
      else if (result?.success) setSavedAt(Date.now())
    })
  }

  // Save bar applies to Profile + Trading (writes via saveSettings).
  // The Account tab has its own actions (logout / delete).
  const showSaveBar = tab !== 'account'

  return (
    <div className="flex flex-col gap-4">
      {/* Header strip */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.4em] text-amber-300/80">
            {t('badge')}
          </p>
          <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-cyan-50 sm:text-xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-[0.7rem] tracking-wide text-cyan-100/55">
            {t('subtitle')}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="font-display text-[0.65rem] tracking-[0.22em] text-cyan-200/70 transition hover:text-cyan-100"
        >
          {t('back')}
        </Link>
      </header>

      {/* Tab bar */}
      <nav aria-label="Settings sections">
        <div className="denaro-panel rounded-md p-1">
          <div className="flex gap-1">
            {TAB_IDS.map((id) => {
              const on = tab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={on ? 'page' : undefined}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 font-display text-[0.65rem] uppercase tracking-[0.22em] transition sm:text-[0.7rem] ${
                    on
                      ? 'bg-amber-400/15 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.2)]'
                      : 'text-cyan-200/65 hover:bg-cyan-500/10 hover:text-cyan-100'
                  }`}
                >
                  {TAB_ICONS[id]}
                  <span>{tTabs(id)}</span>
                  {on && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Tab panels */}
      {tab === 'profile' && (
        <div className="flex flex-col gap-4">
          {/* Identity */}
          <section className="denaro-panel rounded-md p-4">
            <SectionHeader
              title={tSec('identity.title')}
              subtitle={tSec('identity.subtitle')}
            />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="display-name" className="denaro-label">
                  {tField('displayName')}
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={tField('displayNamePlaceholder')}
                  maxLength={40}
                  className="denaro-input"
                />
              </div>
              <div>
                <label htmlFor="email" className="denaro-label">
                  {tField('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="denaro-input cursor-not-allowed opacity-70"
                />
                <p className="mt-1.5 text-[0.62rem] tracking-wide text-cyan-100/45">
                  {tField('emailHint')}
                </p>
              </div>
            </div>
          </section>

          {/* Preferences — z-30 so the language dropdown sits above siblings. */}
          <section className="denaro-panel relative z-30 rounded-md p-4">
            <SectionHeader
              title={tSec('preferences.title')}
              subtitle={tSec('preferences.subtitle')}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="font-display text-[0.7rem] tracking-[0.2em] text-cyan-100/85">
                {tField('language')}
              </span>
              <LanguageSwitcher />
            </div>
          </section>
        </div>
      )}

      {tab === 'trading' && (
        <div className="flex flex-col gap-4">
          {/* Markets */}
          <section className="denaro-panel rounded-md p-4">
            <SectionHeader
              title={tSec('markets.title')}
              subtitle={tSec('markets.subtitle')}
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {POPULAR_PAIRS.map((p) => {
                const selected = pairs.includes(p.symbol)
                return (
                  <button
                    key={p.symbol}
                    type="button"
                    onClick={() => togglePair(p.symbol)}
                    aria-pressed={selected}
                    className={`rounded border px-2.5 py-1.5 font-display text-[0.65rem] tracking-[0.18em] transition ${
                      selected
                        ? 'border-amber-300/80 bg-amber-400/15 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.35)]'
                        : 'border-cyan-400/30 bg-cyan-500/[0.04] text-cyan-100/80 hover:border-cyan-300/50 hover:bg-cyan-500/10'
                    }`}
                  >
                    {selected && <span className="mr-1 text-amber-300">✓</span>}
                    {p.symbol}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[0.65rem] tracking-wide text-cyan-100/45">
              {tSec('markets.selected', { count: pairs.length })}
            </p>
          </section>

          {/* Strategy */}
          <section className="denaro-panel rounded-md p-4">
            <SectionHeader
              title={tSec('strategy.title')}
              subtitle={tSec('strategy.subtitle')}
            />
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STRATEGIES.map((s) => {
                const selected = strategy === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStrategy(s)}
                    aria-pressed={selected}
                    className={`block rounded-md border px-3 py-2.5 text-left transition ${
                      selected
                        ? 'border-amber-300/80 bg-amber-400/10 shadow-[0_0_22px_rgba(251,191,36,0.25)]'
                        : 'border-cyan-400/25 bg-cyan-500/[0.04] hover:border-cyan-300/50 hover:bg-cyan-500/[0.07]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[0.74rem] font-bold uppercase tracking-[0.16em] text-cyan-50">
                        {tStrat(`${s}.label`)}
                      </span>
                      {selected && (
                        <span className="font-display text-[0.55rem] tracking-[0.25em] text-amber-300">
                          {tSec('strategy.active')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[0.7rem] leading-snug text-cyan-100/60">
                      {tStrat(`${s}.blurb`)}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {tab === 'account' && (
        <div className="flex flex-col gap-4">
          {/* Session */}
          <section className="denaro-panel rounded-md p-4">
            <SectionHeader
              title={tSec('session.title')}
              subtitle={tSec('session.subtitle')}
            />
            <form action={logout} className="mt-3">
              <button type="submit" className="denaro-btn-ghost">
                {tHeader('logout')}
              </button>
            </form>
          </section>

          {/* Danger zone */}
          <section className="denaro-panel rounded-md border-rose-500/30 p-4 ring-1 ring-rose-500/15">
            <div>
              <h2 className="font-display text-[0.78rem] font-bold uppercase tracking-[0.2em] text-rose-200">
                {tDanger('title')}
              </h2>
              <p className="mt-1 text-[0.7rem] leading-snug text-rose-100/60">
                {tDanger('subtitle')}
              </p>
            </div>

            {!showDelete ? (
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null)
                  setDeleteConfirm('')
                  setShowDelete(true)
                }}
                className="mt-3 w-full rounded-md border border-rose-500/50 bg-rose-500/10 px-4 py-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-rose-100 transition hover:border-rose-400/80 hover:bg-rose-500/20"
              >
                {tDanger('deleteAccount')}
              </button>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-[0.7rem] leading-snug text-rose-100/80">
                  {tDanger('warning')}
                </p>
                <label htmlFor="delete-confirm" className="denaro-label">
                  {tDanger('confirmLabel')}
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  className="denaro-input"
                />
                {deleteError && (
                  <div className="denaro-banner denaro-banner-error">
                    {deleteError}
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={submitDelete}
                    disabled={!canDelete || isDeleting}
                    className="flex-1 rounded-md border border-rose-500/70 bg-rose-500/30 px-4 py-2 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-rose-50 transition hover:bg-rose-500/45 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isDeleting ? tDanger('deleting') : tDanger('confirmDelete')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDelete(false)
                      setDeleteError(null)
                      setDeleteConfirm('')
                    }}
                    disabled={isDeleting}
                    className="rounded-md border border-cyan-400/30 bg-cyan-500/[0.06] px-4 py-2 font-display text-[0.7rem] tracking-[0.2em] text-cyan-100/80 transition hover:border-cyan-300/50 hover:bg-cyan-500/10 disabled:opacity-40"
                  >
                    {tDanger('cancel')}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Save bar — only on tabs that write through saveSettings. */}
      {showSaveBar && (
        <div className="sticky bottom-3 z-20 flex flex-col gap-2">
          {error && (
            <div className="denaro-banner denaro-banner-error">{error}</div>
          )}
          {savedAt && !error && (
            <div className="denaro-banner denaro-banner-success">{t('saved')}</div>
          )}
          <button
            onClick={submit}
            disabled={isPending}
            className="denaro-btn"
          >
            {isPending ? t('saving') : t('save')}
          </button>
        </div>
      )}
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div>
      <h2 className="font-display text-[0.78rem] font-bold uppercase tracking-[0.2em] text-cyan-50">
        {title}
      </h2>
      <p className="mt-1 text-[0.7rem] leading-snug text-cyan-100/55">
        {subtitle}
      </p>
    </div>
  )
}
