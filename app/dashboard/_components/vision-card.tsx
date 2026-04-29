'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import type { Interval, OHLCBar } from '@/lib/market/ohlc'
import { CHART_OPTIONS, CANDLE_OPTIONS } from './chart-theme'
import FormattedAnalysis from './formatted-analysis'

type Tf = { interval: Interval; label: string; tag: string }

const STACK: Tf[] = [
  { interval: '4h', label: '4H', tag: 'HTF' },
  { interval: '1h', label: '1H', tag: 'MTF' },
  { interval: '15m', label: '15M', tag: 'LTF' },
]

export default function VisionCard({ pairs }: { pairs: string[] }) {
  const [selected, setSelected] = useState<string>(pairs[0] ?? 'XAUUSD')

  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Hold IChartApi for each timeframe so we can take all 3 screenshots.
  const chartRefs = useRef<(IChartApi | null)[]>([null, null, null])

  async function captureAll() {
    if (analyzing) return

    setAnalyzing(true)
    setAnalysis('')
    setError(null)

    try {
      const fd = new FormData()

      for (let i = 0; i < STACK.length; i++) {
        const chart = chartRefs.current[i]
        if (!chart) throw new Error(`${STACK[i].label} chart not ready`)

        const source = chart.takeScreenshot()
        const out = document.createElement('canvas')
        out.width = source.width
        out.height = source.height
        const ctx = out.getContext('2d')
        if (!ctx) throw new Error('canvas context unavailable')
        ctx.fillStyle = '#0a1322'
        ctx.fillRect(0, 0, out.width, out.height)
        ctx.drawImage(source, 0, 0)

        const blob: Blob | null = await new Promise((resolve) =>
          out.toBlob(resolve, 'image/png'),
        )
        if (!blob) throw new Error('snapshot failed')

        fd.append(
          'charts',
          new File([blob], `${selected}-${STACK[i].label}.png`, {
            type: 'image/png',
          }),
        )
      }

      fd.append(
        'note',
        `${selected} multi-timeframe stack — chart 1 = HTF (4H), chart 2 = MTF (1H), chart 3 = LTF (15M).`,
      )

      const res = await fetch('/api/denaro/vision', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => 'request failed')
        throw new Error(t)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setAnalysis(acc)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <section className="denaro-panel space-y-3 rounded-md p-4">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            // VISION ▸ MULTI-TF READ
          </p>
          <h2 className="font-display text-base font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-lg">
            HTF → MTF → LTF Snap
          </h2>
          <p className="mt-1 text-[0.7rem] leading-snug text-cyan-100/55">
            Capture 4H · 1H · 15M for the selected pair and let Denaro read the
            full stack.
          </p>
        </div>

        {(analysis || error) && !analyzing && (
          <button
            type="button"
            onClick={() => {
              setAnalysis('')
              setError(null)
            }}
            className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/45 transition hover:text-cyan-100/80"
          >
            CLEAR
          </button>
        )}
      </header>

      {/* Pair selector */}
      <div className="flex flex-wrap gap-1.5">
        {pairs.map((p) => {
          const on = p === selected
          return (
            <button
              key={p}
              type="button"
              onClick={() => setSelected(p)}
              className={`rounded border px-2.5 py-1 font-display text-[0.65rem] tracking-[0.18em] transition ${
                on
                  ? 'border-amber-300/70 bg-amber-400/15 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                  : 'border-cyan-400/25 bg-cyan-500/[0.04] text-cyan-100/75 hover:border-cyan-300/45 hover:bg-cyan-500/[0.08]'
              }`}
            >
              {p}
            </button>
          )
        })}
      </div>

      {/* Three-up timeframe stack */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {STACK.map((tf, i) => (
          <TfChart
            key={`${selected}-${tf.interval}`}
            symbol={selected}
            tf={tf}
            onChartRef={(chart) => {
              chartRefs.current[i] = chart
            }}
          />
        ))}
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={captureAll}
        disabled={analyzing}
        className="denaro-btn"
      >
        {analyzing ? 'Reading the stack…' : 'Capture HTF → LTF & Analyze'}
      </button>

      {/* Output */}
      {(analyzing || analysis || error) && (
        <div className="rounded border border-cyan-400/20 bg-cyan-500/[0.04] p-3">
          {error && (
            <p className="text-[0.7rem] text-rose-300/90">// {error}</p>
          )}
          {analyzing && !analysis && !error && (
            <p className="font-display text-[0.6rem] tracking-[0.32em] text-cyan-200/60">
              // READING THE STACK…
            </p>
          )}
          {analysis && <FormattedAnalysis text={analysis} />}
        </div>
      )}
    </section>
  )
}

/* -- single mini-chart, fixed timeframe -- */

function TfChart({
  symbol,
  tf,
  onChartRef,
}: {
  symbol: string
  tf: Tf
  onChartRef: (chart: IChartApi | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [bars, setBars] = useState<OHLCBar[]>([])
  const [loading, setLoading] = useState(true)

  // Build chart once
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const chart = createChart(el, CHART_OPTIONS)
    const series = chart.addSeries(CandlestickSeries, CANDLE_OPTIONS)
    seriesRef.current = series
    onChartRef(chart)
    return () => {
      chart.remove()
      onChartRef(null)
      seriesRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pull data — initial + polling so the snap captures fresh candles.
  useEffect(() => {
    let cancelled = false
    let isInitial = true

    async function load() {
      if (isInitial) setLoading(true)
      try {
        const r = await fetch(
          `/api/ohlc?symbol=${symbol}&interval=${tf.interval}&_=${Date.now()}`,
          { cache: 'no-store' },
        )
        if (!r.ok) return
        const data = (await r.json()) as { bars: OHLCBar[] }
        if (cancelled) return
        const newBars = data.bars ?? []
        setBars(newBars)
        const series = seriesRef.current
        if (series) {
          series.setData(
            newBars.map((b) => ({
              time: b.time as UTCTimestamp,
              open: b.open,
              high: b.high,
              low: b.low,
              close: b.close,
            })),
          )
        }
      } catch {
        // ignore — keep prior data on screen
      } finally {
        if (!cancelled && isInitial) {
          setLoading(false)
          isInitial = false
        }
      }
    }

    load()

    // Match the per-pair chart cadence: HTF polls slowly, LTF fast.
    const pollMs =
      tf.interval === '4h' ? 180_000 : tf.interval === '1h' ? 120_000 : 45_000
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      if (!cancelled) load()
    }, pollMs)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [symbol, tf.interval])

  return (
    <div className="relative overflow-hidden rounded border border-cyan-400/20 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-cyan-400/15 bg-cyan-500/[0.04] px-2 py-1">
        <span className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-50">
          {symbol}
        </span>
        <span className="font-display text-[0.55rem] tracking-[0.22em] text-amber-300/80">
          {tf.tag} · {tf.label}
        </span>
      </div>
      <div className="relative h-[160px] sm:h-[200px]">
        <div ref={containerRef} className="absolute inset-0" />
        {loading && bars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[0.55rem] tracking-[0.32em] text-cyan-200/45">
              LOADING
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
