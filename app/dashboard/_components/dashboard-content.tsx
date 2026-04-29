'use client'

import type { Profile } from '@/lib/profile/types'
import SessionBar from './session-bar'
import TickerBar from './ticker-bar'
import PairCard from './pair-card'
import ChartUpload from './chart-upload'
import AskDenaro from './ask-denaro'

export default function DashboardContent({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-1 flex-col gap-4 pb-6">
      <SessionBar />
      <TickerBar pairs={profile.pairs} />

      <section>
        <header className="mb-3 flex items-baseline justify-between">
          <div>
            <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
              // ACTIVE MARKETS
            </p>
            <h2 className="font-display text-base font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-lg">
              {profile.pairs.length} Pair{profile.pairs.length === 1 ? '' : 's'} Tracked
            </h2>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {profile.pairs.map((pair) => (
            <PairCard key={pair} pair={pair} strategy={profile.strategy} />
          ))}
        </div>
      </section>

      <ChartUpload />

      <AskDenaro />
    </div>
  )
}
