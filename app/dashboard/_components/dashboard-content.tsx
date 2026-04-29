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
  DASHBOARD_TABS,
  type TabId,
} from './dashboard-nav'

export default function DashboardContent({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<TabId>('markets')

  const tabMeta = DASHBOARD_TABS.find((t) => t.id === tab)

  return (
    // Bottom padding clears the fixed mobile nav (~64px tall + safe area).
    <div className="flex flex-1 flex-col gap-3 pb-24 lg:pb-6">
      <SessionBar />
      <TickerBar pairs={profile.pairs} />

      <DesktopTabBar active={tab} onSelect={setTab} />

      {/* Mobile-only contextual title for the active tab */}
      <div className="flex items-baseline justify-between lg:hidden">
        <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
          // {tabMeta?.label.toUpperCase()}
        </p>
      </div>

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
 * Markets — one row per pair, with the live chart and the AI analysis
 * pinned together. Mobile stacks them; lg+ runs them side-by-side.
 */
function MarketsTab({
  pairs,
  strategy,
}: {
  pairs: string[]
  strategy: Profile['strategy']
}) {
  return (
    <div className="space-y-5">
      {pairs.map((pair) => (
        <div
          key={pair}
          className="grid grid-cols-1 gap-3 lg:grid-cols-2"
        >
          <ChartCard pair={pair} />
          <PairCard pair={pair} strategy={strategy} />
        </div>
      ))}
    </div>
  )
}

function NewsTab({ pairs }: { pairs: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {pairs.map((pair) => (
        <NewsCard key={pair} pair={pair} />
      ))}
    </div>
  )
}
