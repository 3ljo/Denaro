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
        {tab === 'markets' && <MarketsTab pairs={profile.pairs} />}
        {tab === 'analysis' && (
          <AnalysisTab pairs={profile.pairs} strategy={profile.strategy} />
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

function MarketsTab({ pairs }: { pairs: string[] }) {
  // Charts benefit from width — go 1 col on mobile/tablet, 2 col on lg+.
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {pairs.map((pair) => (
        <ChartCard key={pair} pair={pair} />
      ))}
    </div>
  )
}

function AnalysisTab({
  pairs,
  strategy,
}: {
  pairs: string[]
  strategy: Profile['strategy']
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {pairs.map((pair) => (
        <PairCard key={pair} pair={pair} strategy={strategy} />
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
