'use client'

import { useState } from 'react'
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

export default function DashboardContent({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<TabId>('markets')

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
 * Markets — mobile collapses each pair into an accordion (first one open) so
 * users aren't forced to scroll past hundreds of pixels of chart + analysis
 * per pair. Desktop renders the original side-by-side grid for all pairs.
 */
function MarketsTab({
  pairs,
  strategy,
}: {
  pairs: string[]
  strategy: Profile['strategy']
}) {
  return (
    <>
      {/* Mobile: accordion — one pair expanded at a time. */}
      <div className="space-y-2 lg:hidden">
        {pairs.map((pair, i) => (
          <PairAccordion
            key={pair}
            pair={pair}
            strategy={strategy}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Desktop: full grid, all pairs visible. */}
      <div className="hidden space-y-5 lg:block">
        {pairs.map((pair) => (
          <div key={pair} className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ChartCard pair={pair} />
            <PairCard pair={pair} strategy={strategy} />
          </div>
        ))}
      </div>
    </>
  )
}

function PairAccordion({
  pair,
  strategy,
  defaultOpen,
}: {
  pair: string
  strategy: Profile['strategy']
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`overflow-hidden rounded-md border border-cyan-400/25 bg-cyan-500/[0.04] transition ${open ? 'shadow-[0_0_18px_rgba(34,211,238,0.15)]' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-cyan-500/[0.06]"
      >
        <span className="font-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-cyan-50">
          {pair}
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
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-cyan-400/15 p-2.5">
          <ChartCard pair={pair} />
          <PairCard pair={pair} strategy={strategy} />
        </div>
      )}
    </div>
  )
}

function NewsTab({ pairs }: { pairs: string[] }) {
  return (
    <>
      {/* Mobile: accordion — one feed expanded at a time. */}
      <div className="space-y-2 md:hidden">
        {pairs.map((pair, i) => (
          <NewsAccordion key={pair} pair={pair} defaultOpen={i === 0} />
        ))}
      </div>

      {/* Tablet+: original grid, all feeds visible. */}
      <div className="hidden grid-cols-1 gap-3 md:grid md:grid-cols-2 xl:grid-cols-3">
        {pairs.map((pair) => (
          <NewsCard key={pair} pair={pair} />
        ))}
      </div>
    </>
  )
}

function NewsAccordion({
  pair,
  defaultOpen,
}: {
  pair: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`overflow-hidden rounded-md border border-cyan-400/25 bg-cyan-500/[0.04] transition ${open ? 'shadow-[0_0_18px_rgba(34,211,238,0.15)]' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-cyan-500/[0.06]"
      >
        <span className="font-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-cyan-50">
          {pair}
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
      </button>
      {open && (
        <div className="border-t border-cyan-400/15 p-2.5">
          <NewsCard pair={pair} />
        </div>
      )}
    </div>
  )
}
