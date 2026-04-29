'use client'

import { useEffect, useState } from 'react'

type Tick = {
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  error?: string
}

export default function TickerBar({ pairs }: { pairs: string[] }) {
  const [data, setData] = useState<Tick[]>([])
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (pairs.length === 0) return
    let cancelled = false

    async function pull() {
      try {
        const res = await fetch(`/api/ticker?symbols=${pairs.join(',')}`, {
          cache: 'no-store',
        })
        if (!res.ok) return
        const json = (await res.json()) as Tick[]
        if (!cancelled) {
          setData(json)
          setUpdatedAt(new Date())
        }
      } catch {
        // soft-fail
      }
    }

    pull()
    const id = setInterval(pull, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [pairs.join(',')])

  return (
    <div className="denaro-panel relative flex items-center gap-4 overflow-x-auto rounded-md px-3 py-2">
      <span className="denaro-pill shrink-0 text-[0.55rem]">
        <span className="denaro-dot" />
        LIVE
      </span>
      {pairs.map((p) => {
        const t = data.find((d) => d.symbol === p)
        return <TickerItem key={p} symbol={p} t={t} />
      })}
      {updatedAt && (
        <span className="ml-auto shrink-0 font-display text-[0.55rem] tracking-[0.18em] text-cyan-200/40">
          {fmtTime(updatedAt)}
        </span>
      )}
    </div>
  )
}

function TickerItem({ symbol, t }: { symbol: string; t?: Tick }) {
  const up = (t?.changePercent ?? 0) >= 0
  return (
    <div className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
      <span className="font-display text-[0.62rem] tracking-[0.2em] text-cyan-200/80">
        {symbol}
      </span>
      <span className="font-mono text-[0.85rem] text-cyan-50">
        {t?.price != null ? formatPrice(symbol, t.price) : '—'}
      </span>
      {t?.changePercent != null && (
        <span
          className={`font-mono text-[0.7rem] ${
            up ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {up ? '+' : ''}
          {t.changePercent.toFixed(2)}%
        </span>
      )}
    </div>
  )
}

function formatPrice(symbol: string, p: number) {
  if (symbol.includes('JPY')) return p.toFixed(3)
  if (['XAUUSD', 'OIL', 'SILVER'].includes(symbol)) return p.toFixed(2)
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') return p.toFixed(0)
  if (['NAS100', 'SPX500', 'US30', 'GER40', 'UK100'].includes(symbol)) {
    return p.toFixed(0)
  }
  return p.toFixed(5)
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
