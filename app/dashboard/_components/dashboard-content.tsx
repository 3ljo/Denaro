'use client'

import { useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Profile } from '@/lib/profile/types'
import SessionBar from './session-bar'
import TickerBar from './ticker-bar'
import ChartCard from './chart-card'
import PairCard from './pair-card'
import NewsCard from './news-card'
import VisionCard from './vision-card'
import AskDenaro from './ask-denaro'
import {
  DesktopTabBar,
  MobileBottomNav,
  type TabId,
} from './dashboard-nav'

const VALID_TABS: TabId[] = ['markets', 'news', 'vision', 'channel']

function isTabId(v: string | null): v is TabId {
  return !!v && (VALID_TABS as string[]).includes(v)
}

export default function DashboardContent({ profile }: { profile: Profile }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const urlTab = params.get('tab')
  const tab: TabId = isTabId(urlTab) ? urlTab : 'markets'

  const setTab = useCallback(
    (next: TabId) => {
      const usp = new URLSearchParams(params.toString())
      if (next === 'markets') usp.delete('tab')
      else usp.set('tab', next)
      const qs = usp.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router],
  )

  return (
    // Bottom padding clears the fixed mobile nav (~64px tall + safe area).
    <div className="flex flex-1 flex-col gap-3 pb-24 lg:pb-6">
      <SessionBar />
      <TickerBar pairs={profile.pairs} />

      <DesktopTabBar active={tab} onSelect={setTab} />

      <div className="flex-1">
        {tab === 'markets' && (
          <MarketsTab pairs={profile.pairs} strategy={profile.strategy} />
        )}
        {tab === 'news' && <NewsTab pairs={profile.pairs} />}
        {tab === 'vision' && <VisionCard pairs={profile.pairs} />}
        {tab === 'channel' && (
          <AskDenaro pairs={profile.pairs} strategy={profile.strategy} />
        )}
      </div>

      <MobileBottomNav active={tab} onSelect={setTab} />
    </div>
  )
}

/* --- Tab content --- */

/**
 * Markets — single-pair-open accordion. Opening one closes the others so the
 * page never becomes a wall. On lg+ the expanded body splits chart-left /
 * analysis-right to use the wide screen.
 */
function MarketsTab({
  pairs,
  strategy,
}: {
  pairs: string[]
  strategy: Profile['strategy']
}) {
  // Single open pair — null means everything collapsed.
  const [openPair, setOpenPair] = useState<string | null>(pairs[0] ?? null)
  return (
    <div className="space-y-2">
      {pairs.map((pair) => (
        <PairAccordion
          key={pair}
          pair={pair}
          strategy={strategy}
          open={openPair === pair}
          onToggle={() =>
            setOpenPair((curr) => (curr === pair ? null : pair))
          }
        />
      ))}
    </div>
  )
}

function PairAccordion({
  pair,
  strategy,
  open,
  onToggle,
}: {
  pair: string
  strategy: Profile['strategy']
  open: boolean
  onToggle: () => void
}) {
  const tAcc = useTranslations('dashboard.accordion')
  const panelId = `pair-panel-${pair}`
  return (
    <div
      className={`overflow-hidden rounded-md border border-cyan-400/25 bg-cyan-500/[0.04] transition ${
        open ? 'shadow-[0_0_18px_rgba(34,211,238,0.15)]' : ''
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-cyan-500/[0.06] sm:px-4 sm:py-3"
      >
        <span className="font-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-[0.85rem] sm:tracking-[0.2em]">
          {pair}
        </span>
        <span className="flex items-center gap-2">
          <span className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/55">
            {open ? tAcc('tapToClose') : tAcc('tapToOpen')}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className={`shrink-0 text-cyan-200/70 transition ${open ? 'rotate-180' : ''}`}
          >
            <path
              d="M2.5 4.5l3.5 3 3.5-3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          className="grid grid-cols-1 gap-3 border-t border-cyan-400/15 p-2.5 lg:grid-cols-2 lg:gap-4 lg:p-4"
        >
          <ChartCard pair={pair} />
          <PairCard pair={pair} strategy={strategy} />
        </div>
      )}
    </div>
  )
}

function NewsTab({ pairs }: { pairs: string[] }) {
  const [openPair, setOpenPair] = useState<string | null>(pairs[0] ?? null)
  return (
    <div className="space-y-2">
      {pairs.map((pair) => (
        <NewsAccordion
          key={pair}
          pair={pair}
          open={openPair === pair}
          onToggle={() =>
            setOpenPair((curr) => (curr === pair ? null : pair))
          }
        />
      ))}
    </div>
  )
}

function NewsAccordion({
  pair,
  open,
  onToggle,
}: {
  pair: string
  open: boolean
  onToggle: () => void
}) {
  const tAcc = useTranslations('dashboard.accordion')
  const panelId = `news-panel-${pair}`
  return (
    <div
      className={`overflow-hidden rounded-md border border-cyan-400/25 bg-cyan-500/[0.04] transition ${
        open ? 'shadow-[0_0_18px_rgba(34,211,238,0.15)]' : ''
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-cyan-500/[0.06] sm:px-4 sm:py-3"
      >
        <span className="font-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-[0.85rem] sm:tracking-[0.2em]">
          {pair}
        </span>
        <span className="flex items-center gap-2">
          <span className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/55">
            {open ? tAcc('tapToClose') : tAcc('tapToOpen')}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className={`shrink-0 text-cyan-200/70 transition ${open ? 'rotate-180' : ''}`}
          >
            <path
              d="M2.5 4.5l3.5 3 3.5-3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          className="border-t border-cyan-400/15 p-2.5 lg:p-4"
        >
          <NewsCard pair={pair} />
        </div>
      )}
    </div>
  )
}
