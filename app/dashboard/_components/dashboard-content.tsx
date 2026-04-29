'use client'

import type { Profile } from '@/lib/profile/types'
import SessionBar from './session-bar'
import TickerBar from './ticker-bar'
import ChartCard from './chart-card'
import PairCard from './pair-card'
import NewsCard from './news-card'
import VisionCard from './vision-card'
import AskDenaro from './ask-denaro'

export default function DashboardContent({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-1 flex-col gap-4 pb-6">
      <SessionBar />
      <TickerBar pairs={profile.pairs} />

      <section>
        <header className="mb-3">
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            // ACTIVE MARKETS
          </p>
          <h2 className="font-display text-base font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-lg">
            {profile.pairs.length} Pair{profile.pairs.length === 1 ? '' : 's'} Tracked
          </h2>
        </header>

        <div className="space-y-5">
          {profile.pairs.map((pair) => (
            <PairRow key={pair} pair={pair} strategy={profile.strategy} />
          ))}
        </div>
      </section>

      <VisionCard pairs={profile.pairs} />

      <AskDenaro />
    </div>
  )
}

/**
 * One row per pair — three parallel cards: Chart | Analysis | News.
 * Layout responds:
 *   <md  : single column (stacked).
 *   md   : chart full width on top, analysis + news side-by-side below.
 *   xl+  : 3 columns, all cards in a single row.
 */
function PairRow({
  pair,
  strategy,
}: {
  pair: string
  strategy: Profile['strategy']
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div className="md:col-span-2 xl:col-span-1">
        <ChartCard pair={pair} />
      </div>
      <PairCard pair={pair} strategy={strategy} />
      <NewsCard pair={pair} />
    </div>
  )
}
