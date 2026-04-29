'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { type Interval, type OHLCBar } from '@/lib/market/ohlc'
import { CHART_OPTIONS, CANDLE_OPTIONS } from './chart-theme'

const VISIBLE_INTERVALS: Interval[] = [
  '5m',
  '15m',
  '30m',
  '1h',
  '4h',
  '1d',
  '1wk',
  '1mo',
]

const INTERVAL_LABEL: Record<Interval, string> = {
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1H',
  '4h': '4H',
  '1d': '1D',
  '1wk': '1W',
  '1mo': '1M',
}

export default function DenaroChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const [interval, setInterval] = useState<Interval>('15m')
  const [bars, setBars] = useState<OHLCBar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Build the chart once on mount.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, CHART_OPTIONS)
    const series = chart.addSeries(CandlestickSeries, CANDLE_OPTIONS)

    chartRef.current = chart
    seriesRef.current = series

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  // Pull data when symbol/interval changes.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/ohlc?symbol=${symbol}&interval=${interval}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`fetch failed (${r.status})`)
        return r.json() as Promise<{ bars: OHLCBar[] }>
      })
      .then((data) => {
        if (cancelled) return
        const newBars = data.bars ?? []
        setBars(newBars)
        const series = seriesRef.current
        const chart = chartRef.current
        if (series && chart) {
          series.setData(
            newBars.map((b) => ({
              time: b.time as UTCTimestamp,
              open: b.open,
              high: b.high,
              low: b.low,
              close: b.close,
            })),
          )
          chart.timeScale().fitContent()
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [symbol, interval])

  const last = bars[bars.length - 1]
  const first = bars[0]
  const change = last && first ? last.close - first.close : null
  const changePct =
    change != null && first && first.close !== 0
      ? (change / first.close) * 100
      : null
  const isUp = (changePct ?? 0) >= 0

  return (
    <div className="relative overflow-hidden rounded border border-cyan-400/20 bg-slate-950/50">
      {/* Header — symbol + price + change + timeframes */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-400/15 bg-cyan-500/[0.04] px-2.5 py-1.5">
        <div className="flex items-baseline gap-2 overflow-hidden">
          {last ? (
            <>
              <span className="font-mono text-base font-semibold text-cyan-50">
                {fmtPrice(symbol, last.close)}
              </span>
              {changePct != null && (
                <span
                  className={`font-mono text-[0.72rem] ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                </span>
              )}
            </>
          ) : (
            <span className="font-display text-[0.6rem] tracking-[0.25em] text-cyan-200/40">
              ···
            </span>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-0.5">
          {VISIBLE_INTERVALS.map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setInterval(iv)}
              className={`rounded px-1.5 py-0.5 font-display text-[0.6rem] tracking-[0.1em] transition ${
                interval === iv
                  ? 'border border-amber-300/60 bg-amber-400/15 text-amber-100'
                  : 'border border-transparent text-cyan-200/55 hover:bg-cyan-500/10 hover:text-cyan-100'
              }`}
            >
              {INTERVAL_LABEL[iv]}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas area — bigger now */}
      <div className="relative h-[300px] sm:h-[360px] xl:h-[420px]">
        <div ref={containerRef} className="absolute inset-0" />

        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
            <span className="font-display text-[0.6rem] tracking-[0.32em] text-cyan-200/60">
              LOADING
            </span>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="font-display text-[0.65rem] tracking-[0.18em] text-rose-300/80">
              // signal lost
            </span>
          </div>
        )}
        {!loading && !error && bars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="font-display text-[0.65rem] tracking-[0.18em] text-cyan-200/40">
              no data
            </span>
          </div>
        )}
      </div>

    </div>
  )
}

function fmtPrice(symbol: string, p: number) {
  if (symbol.includes('JPY')) return p.toFixed(3)
  if (['XAUUSD', 'OIL', 'SILVER'].includes(symbol)) return p.toFixed(2)
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') return p.toFixed(0)
  if (['NAS100', 'SPX500', 'US30', 'GER40', 'UK100'].includes(symbol)) {
    return p.toFixed(0)
  }
  return p.toFixed(5)
}
