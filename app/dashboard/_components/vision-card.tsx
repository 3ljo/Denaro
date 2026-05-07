'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import {
  CandlestickSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { intervalLabel, type Interval, type OHLCBar } from '@/lib/market/ohlc'
import { getStrategyDef } from '@/lib/denaro/strategies'
import type { Strategy } from '@/lib/profile/types'
import { CHART_OPTIONS, CANDLE_OPTIONS } from './chart-theme'
import FormattedAnalysis from './formatted-analysis'

type StackPosition = 'htf' | 'mtf' | 'ltf'

type Tf = {
  interval: Interval
  /** Trader-notation label, e.g. '4H', 'D1', 'W1'. */
  label: string
  /** Position in the HTF→MTF→LTF stack. */
  tag: StackPosition
  /** TradingView widget interval string. */
  tvInterval: string
}

/** Map our `Interval` type to the string TradingView's widget expects. */
function intervalToTv(interval: Interval): string {
  switch (interval) {
    case '5m':  return '5'
    case '15m': return '15'
    case '30m': return '30'
    case '1h':  return '60'
    case '4h':  return '240'
    case '1d':  return 'D'
    case '1wk': return 'W'
    case '1mo': return 'M'
  }
}

const TAG_LABEL: Record<StackPosition, string> = {
  htf: 'HTF',
  mtf: 'MTF',
  ltf: 'LTF',
}

function buildStack(strategy: Strategy): Tf[] {
  const [htf, mtf, ltf] = getStrategyDef(strategy).visionStack
  return [
    { interval: htf, label: intervalLabel(htf), tag: 'htf', tvInterval: intervalToTv(htf) },
    { interval: mtf, label: intervalLabel(mtf), tag: 'mtf', tvInterval: intervalToTv(mtf) },
    { interval: ltf, label: intervalLabel(ltf), tag: 'ltf', tvInterval: intervalToTv(ltf) },
  ]
}

// Friendly asset names for the pair-selector cards.
const PAIR_LABEL: Record<string, string> = {
  XAUUSD: 'Gold',
  EURUSD: 'EUR / USD',
  GBPUSD: 'GBP / USD',
  USDJPY: 'USD / JPY',
  AUDUSD: 'AUD / USD',
  USDCAD: 'USD / CAD',
  NZDUSD: 'NZD / USD',
  EURJPY: 'EUR / JPY',
  GBPJPY: 'GBP / JPY',
  BTCUSD: 'Bitcoin',
  ETHUSD: 'Ethereum',
  NAS100: 'Nasdaq 100',
  SPX500: 'S&P 500',
  US30: 'Dow',
  GER40: 'DAX',
  UK100: 'FTSE 100',
  OIL: 'Crude Oil',
  SILVER: 'Silver',
}

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

export default function VisionCard({
  pairs,
  strategy,
}: {
  pairs: string[]
  strategy: Strategy
}) {
  const t = useTranslations('dashboard.vision')
  const tCommon = useTranslations('common')
  const [selected, setSelected] = useState<string>(pairs[0] ?? 'XAUUSD')

  // Stack is per-strategy: SMC/Trend = 4H/1H/15M, Swing = W1/D1/4H,
  // Scalping = 30M/15M/5M, etc. Recomputed when the user flips strategy
  // in settings — the dashboard re-mounts this component.
  const stack = useMemo(() => buildStack(strategy), [strategy])

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

      for (let i = 0; i < stack.length; i++) {
        const chart = chartRefs.current[i]
        if (!chart) throw new Error(t('errorChartNotReady', { label: stack[i].label }))

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
          new File([blob], `${selected}-${stack[i].label}.png`, {
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
            {getStrategyDef(strategy).visionBlurb}
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

      {/* Pair selector — two-line cards: pair code + friendly name. */}
      <div
        role="tablist"
        aria-label="Pair to analyze"
        className="flex flex-wrap gap-2"
      >
        {pairs.map((p) => {
          const on = p === selected
          const label = PAIR_LABEL[p.toUpperCase()] ?? p
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSelected(p)}
              className={`group relative flex items-center gap-2.5 overflow-hidden rounded-md border px-3 py-2 text-left transition ${
                on
                  ? 'border-amber-300/70 bg-gradient-to-br from-amber-400/20 via-amber-300/10 to-transparent shadow-[0_0_22px_rgba(251,191,36,0.28)]'
                  : 'border-cyan-400/20 bg-cyan-500/[0.04] hover:border-cyan-300/50 hover:bg-cyan-500/[0.08]'
              }`}
            >
              <span
                aria-hidden
                className={`h-2 w-2 shrink-0 rounded-full transition ${
                  on
                    ? 'bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-cyan-400/40 group-hover:bg-cyan-300/70'
                }`}
              />
              <span className="flex flex-col leading-tight">
                <span
                  className={`font-display text-[0.7rem] font-bold tracking-[0.2em] ${
                    on ? 'text-amber-50' : 'text-cyan-100/90'
                  }`}
                >
                  {p}
                </span>
                <span
                  className={`font-display text-[0.5rem] tracking-[0.2em] ${
                    on ? 'text-amber-200/80' : 'text-cyan-200/45'
                  }`}
                >
                  {label}
                </span>
              </span>
              {on && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Three-up timeframe stack */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {stack.map((tf, i) => (
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
          aria-busy={analyzing}
          className="inline-flex items-center justify-center rounded-md px-5 py-2 font-display text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#1a1303] shadow-[0_4px_18px_rgba(251,191,36,0.25)] transition hover:brightness-110 hover:shadow-[0_6px_24px_rgba(251,191,36,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background:
              'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #d97706 100%)',
          }}
        >
          {analyzing ? t('capturing') : t('capture')}
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
          tf={stack[expandedIdx]}
          tagLabel={TAG_LABEL[stack[expandedIdx].tag]}
          tfLabel={stack[expandedIdx].label}
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
  return (
    <div className="relative overflow-hidden rounded border border-cyan-400/20 bg-slate-950/60">
      <div className="flex items-center justify-between border-b border-cyan-400/15 bg-cyan-500/[0.04] px-2 py-1">
        <span className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-50">
          {symbol}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-display text-[0.55rem] tracking-[0.22em] text-amber-300/80">
            {TAG_LABEL[tf.tag]} · {tf.label}
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
