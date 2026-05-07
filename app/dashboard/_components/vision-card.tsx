'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
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

type Tf = {
  interval: Interval
  labelKey: 'tf4h' | 'tf1h' | 'tf15m'
  tagKey: 'htf' | 'mtf' | 'ltf'
  tvInterval: string
}

const STACK: Tf[] = [
  { interval: '4h',  labelKey: 'tf4h',  tagKey: 'htf', tvInterval: '240' },
  { interval: '1h',  labelKey: 'tf1h',  tagKey: 'mtf', tvInterval: '60'  },
  { interval: '15m', labelKey: 'tf15m', tagKey: 'ltf', tvInterval: '15'  },
]

// Same map used by the Markets-tab chart + ticker.
const TV_SYMBOL: Record<string, string> = {
  XAUUSD: 'OANDA:XAUUSD',
  EURUSD: 'OANDA:EURUSD',
  GBPUSD: 'OANDA:GBPUSD',
  USDJPY: 'OANDA:USDJPY',
  AUDUSD: 'OANDA:AUDUSD',
  USDCAD: 'OANDA:USDCAD',
  NZDUSD: 'OANDA:NZDUSD',
  EURJPY: 'OANDA:EURJPY',
  GBPJPY: 'OANDA:GBPJPY',
  BTCUSD: 'BINANCE:BTCUSDT',
  ETHUSD: 'BINANCE:ETHUSDT',
  NAS100: 'NASDAQ:NDX',
  SPX500: 'SP:SPX',
  US30: 'DJ:DJI',
  GER40: 'XETR:DAX',
  UK100: 'TVC:UKX',
  OIL: 'NYMEX:CL1!',
  SILVER: 'OANDA:XAGUSD',
}

export default function VisionCard({ pairs }: { pairs: string[] }) {
  const t = useTranslations('dashboard.vision')
  const tStack = useTranslations('dashboard.vision.stack')
  const tCommon = useTranslations('common')
  const [selected, setSelected] = useState<string>(pairs[0] ?? 'XAUUSD')

  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Hold IChartApi for each timeframe so we can take all 3 screenshots.
  // Charts live in off-screen capture canvases (not what the user sees).
  const chartRefs = useRef<(IChartApi | null)[]>([null, null, null])

  // Which timeframe panel is currently maximized (null = none).
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  // ESC closes the maximized chart modal.
  useEffect(() => {
    if (expandedIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedIdx(null)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [expandedIdx])

  async function captureAll() {
    if (analyzing) return

    setAnalyzing(true)
    setAnalysis('')
    setError(null)

    try {
      const fd = new FormData()

      for (let i = 0; i < STACK.length; i++) {
        const chart = chartRefs.current[i]
        if (!chart) throw new Error(t('errorChartNotReady', { label: tStack(STACK[i].labelKey) }))

        const source = chart.takeScreenshot()
        const out = document.createElement('canvas')
        out.width = source.width
        out.height = source.height
        const ctx = out.getContext('2d')
        if (!ctx) throw new Error(t('errorCanvas'))
        ctx.fillStyle = '#0a1322'
        ctx.fillRect(0, 0, out.width, out.height)
        ctx.drawImage(source, 0, 0)

        const blob: Blob | null = await new Promise((resolve) =>
          out.toBlob(resolve, 'image/png'),
        )
        if (!blob) throw new Error(t('errorSnapshot'))

        fd.append(
          'charts',
          new File([blob], `${selected}-${tStack(STACK[i].labelKey)}.png`, {
            type: 'image/png',
          }),
        )
      }

      fd.append('note', t('captureNote', { pair: selected }))

      const res = await fetch('/api/denaro/vision', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => t('errorRequest'))
        throw new Error(errText)
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
      setError(err instanceof Error ? err.message : t('errorFailed'))
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
            {t('badge')}
          </p>
          <h2 className="font-display text-base font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-lg">
            {t('title')}
          </h2>
          <p className="mt-1 text-[0.7rem] leading-snug text-cyan-100/55">
            {t('subtitle')}
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
            {tCommon('clear')}
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
          <TfPanel
            key={`${selected}-${tf.interval}`}
            symbol={selected}
            tf={tf}
            expandLabel={t('expand')}
            onExpand={() => setExpandedIdx(i)}
            onChartRef={(chart) => {
              chartRefs.current[i] = chart
            }}
          />
        ))}
      </div>

      {/* Action */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={captureAll}
          disabled={analyzing}
          className="group inline-flex items-center gap-2 rounded-md border border-amber-300/50 bg-gradient-to-r from-amber-400/15 via-amber-300/20 to-amber-400/15 px-4 py-2 font-display text-[0.65rem] font-bold tracking-[0.24em] text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.12)] transition hover:border-amber-300/80 hover:bg-amber-400/25 hover:text-amber-50 hover:shadow-[0_0_22px_rgba(251,191,36,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-busy={analyzing}
        >
          {analyzing ? (
            <svg
              className="h-3.5 w-3.5 animate-spin text-amber-200"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5 text-amber-200 transition group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m12 3 1.7 4.3 4.3 1.7-4.3 1.7-1.7 4.3-1.7-4.3-4.3-1.7 4.3-1.7L12 3Z" />
              <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
            </svg>
          )}
          <span>{analyzing ? t('capturing') : t('capture')}</span>
        </button>
      </div>

      {/* Output */}
      {(analyzing || analysis || error) && (
        <div className="rounded border border-cyan-400/20 bg-cyan-500/[0.04] p-3">
          {error && (
            <p className="text-[0.7rem] text-rose-300/90">// {error}</p>
          )}
          {analyzing && !analysis && !error && (
            <p className="font-display text-[0.6rem] tracking-[0.32em] text-cyan-200/60">
              {t('reading')}
            </p>
          )}
          {analysis && <FormattedAnalysis text={analysis} />}
        </div>
      )}

      {/* Maximized chart modal */}
      {expandedIdx !== null && (
        <ChartModal
          symbol={selected}
          tf={STACK[expandedIdx]}
          tagLabel={tStack(STACK[expandedIdx].tagKey)}
          tfLabel={tStack(STACK[expandedIdx].labelKey)}
          closeLabel={t('expandClose')}
          onClose={() => setExpandedIdx(null)}
        />
      )}
    </section>
  )
}

/* -- Single mini-panel: TradingView live chart visible to the user, plus a
 *    hidden lightweight-charts canvas that the Capture button screenshots
 *    for the AI. Both fetch the same symbol/interval, so what the AI reads
 *    matches what the user sees closely enough for swing-trading reads. */

function TfPanel({
  symbol,
  tf,
  expandLabel,
  onExpand,
  onChartRef,
}: {
  symbol: string
  tf: Tf
  expandLabel: string
  onExpand: () => void
  onChartRef: (chart: IChartApi | null) => void
}) {
  const tStack = useTranslations('dashboard.vision.stack')
  return (
    <div className="relative overflow-hidden rounded border border-cyan-400/20 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-cyan-400/15 bg-cyan-500/[0.04] px-2 py-1">
        <span className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-50">
          {symbol}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-display text-[0.55rem] tracking-[0.22em] text-amber-300/80">
            {tStack(tf.tagKey)} · {tStack(tf.labelKey)}
          </span>
          <button
            type="button"
            onClick={onExpand}
            aria-label={expandLabel}
            title={expandLabel}
            className="inline-flex h-5 w-5 items-center justify-center rounded border border-cyan-400/25 bg-cyan-500/[0.06] text-cyan-200/70 transition hover:border-amber-300/60 hover:bg-amber-300/10 hover:text-amber-200"
          >
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
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Visible TradingView live chart */}
      <div className="relative h-[200px] sm:h-[240px]">
        <TradingViewMini symbol={symbol} tvInterval={tf.tvInterval} />
      </div>

      {/* Off-screen capture canvas — kept mounted so the Capture button can
          screenshot it. Sized to a sensible chart aspect for the AI. */}
      <div
        aria-hidden
        className="pointer-events-none fixed opacity-0"
        style={{ left: '-99999px', top: '-99999px', width: 600, height: 320 }}
      >
        <CaptureChart
          symbol={symbol}
          interval={tf.interval}
          onChartRef={onChartRef}
        />
      </div>
    </div>
  )
}

/* -- Visible chart: TradingView official embed, sized small. -- */

function TradingViewMini({
  symbol,
  tvInterval,
}: {
  symbol: string
  tvInterval: string
}) {
  const tvSymbol = TV_SYMBOL[symbol.toUpperCase()] ?? symbol
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = containerRef.current
    if (!host) return
    host.innerHTML = ''

    const inner = document.createElement('div')
    inner.className = 'tradingview-widget-container__widget h-full w-full'
    host.appendChild(inner)

    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: tvInterval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: 'rgba(10,19,34,0.6)',
      enable_publishing: false,
      hide_top_toolbar: true,
      hide_legend: true,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      save_image: false,
      withdateranges: false,
      details: false,
      hideideas: true,
      studies: [],
    })
    host.appendChild(script)

    return () => {
      host.innerHTML = ''
    }
  }, [tvSymbol, tvInterval])

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container absolute inset-0 h-full w-full"
    />
  )
}

/* -- Hidden canvas chart used only for the Capture button's screenshot. -- */

function CaptureChart({
  symbol,
  interval,
  onChartRef,
}: {
  symbol: string
  interval: Interval
  onChartRef: (chart: IChartApi | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

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

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const r = await fetch(
          `/api/ohlc?symbol=${symbol}&interval=${interval}&_=${Date.now()}`,
          { cache: 'no-store' },
        )
        if (!r.ok) return
        const data = (await r.json()) as { bars: OHLCBar[] }
        if (cancelled) return
        const series = seriesRef.current
        if (!series) return
        series.setData(
          (data.bars ?? []).map((b) => ({
            time: b.time as UTCTimestamp,
            open: b.open,
            high: b.high,
            low: b.low,
            close: b.close,
          })),
        )
      } catch {
        // ignore — keep prior data on screen
      }
    }

    load()

    const pollMs =
      interval === '4h' ? 180_000 : interval === '1h' ? 120_000 : 45_000
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      if (!cancelled) load()
    }, pollMs)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [symbol, interval])

  return <div ref={containerRef} className="h-full w-full" />
}

/* -- Fullscreen modal showing one timeframe at large size. -- */

function ChartModal({
  symbol,
  tf,
  tagLabel,
  tfLabel,
  closeLabel,
  onClose,
}: {
  symbol: string
  tf: Tf
  tagLabel: string
  tfLabel: string
  closeLabel: string
  onClose: () => void
}) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950/85 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex flex-1 flex-col overflow-hidden rounded-md border border-cyan-400/25 bg-slate-950/85 shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cyan-400/15 bg-cyan-500/[0.05] px-3 py-2">
          <div className="flex items-center gap-3">
            <span className="font-display text-[0.7rem] font-bold tracking-[0.22em] text-cyan-50">
              {symbol}
            </span>
            <span className="font-display text-[0.6rem] tracking-[0.22em] text-amber-300/80">
              {tagLabel} · {tfLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-cyan-400/25 bg-cyan-500/[0.08] text-cyan-100/80 transition hover:border-rose-300/60 hover:bg-rose-400/15 hover:text-rose-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="relative flex-1">
          <TradingViewMini symbol={symbol} tvInterval={tf.tvInterval} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
