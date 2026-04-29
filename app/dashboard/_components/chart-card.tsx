'use client'

import DenaroChart from './denaro-chart'

export default function ChartCard({ pair }: { pair: string }) {
  return (
    <div className="denaro-panel relative flex flex-col gap-3 rounded-md p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            // CHART
          </p>
          <h3 className="font-display text-lg font-bold uppercase tracking-[0.18em] text-cyan-50">
            {pair}
          </h3>
        </div>
      </header>

      <DenaroChart symbol={pair} />
    </div>
  )
}
