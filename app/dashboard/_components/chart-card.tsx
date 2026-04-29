'use client'

import TradingViewChart from './tradingview-chart'

export default function ChartCard({ pair }: { pair: string }) {
  return (
    <div className="denaro-panel relative flex flex-col gap-3 rounded-md p-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            // CHART ▸ LIVE
          </p>
          <h3 className="font-display text-lg font-bold uppercase tracking-[0.18em] text-cyan-50">
            {pair}
          </h3>
        </div>
        <span className="flex items-center gap-1.5 font-display text-[0.55rem] tracking-[0.22em] text-emerald-300/80">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"
            style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.8)' }}
            aria-hidden
          />
          REAL-TIME
        </span>
      </header>

      <TradingViewChart symbol={pair} />
    </div>
  )
}
