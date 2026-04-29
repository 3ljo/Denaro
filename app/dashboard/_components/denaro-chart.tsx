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

  // Snap-and-analyze state
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Build the chart once on mount.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(186, 230, 253, 0.7)',
        fontFamily:
          'var(--font-orbitron), ui-monospace, SFMono-Regular, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(125, 211, 252, 0.06)' },
        horzLines: { color: 'rgba(125, 211, 252, 0.06)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(125, 211, 252, 0.2)',
      },
      rightPriceScale: {
        borderColor: 'rgba(125, 211, 252, 0.2)',
      },
      crosshair: {
        vertLine: {
          color: 'rgba(251, 191, 36, 0.55)',
          width: 1,
          style: 3,
          labelBackgroundColor: 'rgba(251, 191, 36, 0.85)',
        },
        horzLine: {
          color: 'rgba(251, 191, 36, 0.55)',
          width: 1,
          style: 3,
          labelBackgroundColor: 'rgba(251, 191, 36, 0.85)',
        },
      },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#4ade80',
      downColor: '#f87171',
      borderUpColor: '#4ade80',
      borderDownColor: '#f87171',
      wickUpColor: 'rgba(74, 222, 128, 0.7)',
      wickDownColor: 'rgba(248, 113, 113, 0.7)',
    })

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

  /**
   * Capture the chart canvas, composite onto a dark background (the
   * lightweight-charts canvas is transparent so it blends with the panel),
   * then ship to /api/denaro/vision and stream the analysis back.
   */
  async function snapAndAnalyze() {
    const chart = chartRef.current
    if (!chart || analyzing) return

    setAnalyzing(true)
    setAnalysis('')
    setAnalysisError(null)

    try {
      const sourceCanvas = chart.takeScreenshot()
      const out = document.createElement('canvas')
      out.width = sourceCanvas.width
      out.height = sourceCanvas.height
      const ctx = out.getContext('2d')
      if (!ctx) throw new Error('canvas context unavailable')
      ctx.fillStyle = '#0a1322'
      ctx.fillRect(0, 0, out.width, out.height)
      ctx.drawImage(sourceCanvas, 0, 0)

      const blob: Blob | null = await new Promise((resolve) =>
        out.toBlob(resolve, 'image/png'),
      )
      if (!blob) throw new Error('snapshot failed')

      const fd = new FormData()
      fd.append(
        'charts',
        new File([blob], `${symbol}-${interval}.png`, { type: 'image/png' }),
      )
      fd.append(
        'note',
        `${symbol} on ${INTERVAL_LABEL[interval]} timeframe — captured from the Denaro dashboard. Analyse the visible structure.`,
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
      setAnalysisError(err instanceof Error ? err.message : 'failed')
    } finally {
      setAnalyzing(false)
    }
  }

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

      {/* Snap & Analyze action row */}
      <div className="flex items-center justify-between gap-2 border-t border-cyan-400/15 bg-cyan-500/[0.03] px-2.5 py-1.5">
        <button
          type="button"
          onClick={snapAndAnalyze}
          disabled={analyzing || bars.length === 0}
          className="inline-flex items-center gap-1.5 rounded border border-amber-300/40 bg-amber-400/10 px-2.5 py-1 font-display text-[0.6rem] tracking-[0.22em] text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-400/20 disabled:opacity-40"
        >
          <CaptureIcon />
          {analyzing ? 'Reading…' : 'Snap & Analyze'}
        </button>
        {(analysis || analysisError) && !analyzing && (
          <button
            type="button"
            onClick={() => {
              setAnalysis('')
              setAnalysisError(null)
            }}
            className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/45 transition hover:text-cyan-100/80"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Analysis output panel */}
      {(analyzing || analysis || analysisError) && (
        <div className="max-h-[260px] overflow-y-auto border-t border-cyan-400/15 bg-cyan-500/[0.04] px-3 py-2.5">
          {analysisError && (
            <p className="text-[0.7rem] text-rose-300/90">// {analysisError}</p>
          )}
          {analyzing && !analysis && !analysisError && (
            <p className="font-display text-[0.6rem] tracking-[0.28em] text-cyan-200/60">
              // READING CHART…
            </p>
          )}
          {analysis && (
            <div className="whitespace-pre-wrap text-[0.78rem] leading-relaxed text-cyan-50">
              {analysis}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CaptureIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
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
