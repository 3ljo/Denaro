'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Impact, NewsItem } from '@/lib/market/news'

/** Last N seconds before the event — show "SOON" / amber pulse. */
const IMMINENT_BEFORE = 5 * 60
/** First N seconds after the event — show "LIVE" / red pulse. */
const LIVE_AFTER = 5 * 60

type EventStatus = 'past' | 'live' | 'imminent' | 'upcoming'

/** delta = event.timeUtc - now (seconds). Positive = future, negative = past. */
function statusOf(delta: number): EventStatus {
  if (delta < -LIVE_AFTER) return 'past'
  if (delta <= 0) return 'live'           // event has happened, still fresh
  if (delta <= IMMINENT_BEFORE) return 'imminent' // last few minutes before
  return 'upcoming'
}

export default function NewsCard({ pair }: { pair: string }) {
  const t = useTranslations('dashboard.newsCard')
  const tCommon = useTranslations('common')
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<number>(() => Math.floor(Date.now() / 1000))

  // Tick every second so countdowns and LIVE state stay live.
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/news?symbol=${pair}&count=8`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`request failed (${res.status})`)
      const data = (await res.json()) as { items: NewsItem[] }
      setItems(data.items ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 5 * 60_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair])

  const liveCount = items.filter((e) => statusOf(e.timeUtc - now) === 'live').length
  const highCount = items.filter((e) => e.impact === 'high').length
  const medCount = items.filter((e) => e.impact === 'medium').length

  return (
    <div className="denaro-panel relative flex flex-col gap-3 rounded-md p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            {t('badge')}
          </p>
          <h3 className="font-display text-lg font-bold uppercase tracking-[0.18em] text-cyan-50">
            {t('feedTitle', { pair })}
          </h3>
          {items.length > 0 && (
            <div className="mt-1 flex items-center gap-2 font-display text-[0.55rem] tracking-[0.18em]">
              {liveCount > 0 && (
                <span className="flex items-center gap-1 text-rose-200 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]" />
                  {liveCount} {t('live')}
                </span>
              )}
              <span className="flex items-center gap-1 text-rose-300/85">
                <ImpactDot impact="high" />
                {highCount} {t('high')}
              </span>
              <span className="flex items-center gap-1 text-amber-200/85">
                <ImpactDot impact="medium" />
                {medCount} {t('med')}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label={tCommon('refresh')}
          className="rounded border border-cyan-400/30 bg-cyan-500/[0.06] px-2 py-1 font-display text-[0.6rem] tracking-[0.2em] text-cyan-100/80 transition hover:border-cyan-300/60 hover:bg-cyan-500/10 disabled:opacity-40"
        >
          {loading ? '…' : '↻'}
        </button>
      </header>

      {loading && items.length === 0 && <Skeleton />}
      {error && items.length === 0 && (
        <div className="rounded border border-rose-400/30 bg-rose-500/10 p-2.5 text-[0.7rem] text-rose-200">
          {tCommon('signalLost', { error })}
        </div>
      )}
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((event) => (
            <li key={event.id}>
              <EventRow event={event} now={now} pair={pair} />
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-[0.7rem] text-cyan-100/40">
          {t('empty', { pair })}
        </p>
      )}
    </div>
  )
}

function EventRow({ event, now, pair }: { event: NewsItem; now: number; pair: string }) {
  const t = useTranslations('dashboard.newsCard')
  const delta = event.timeUtc - now // seconds
  const status = statusOf(delta)
  const styles = IMPACT_STYLES[event.impact]

  // AI prediction state — only used for HIGH impact events that haven't fully passed.
  const [prediction, setPrediction] = useState<string | null>(null)
  const [predicting, setPredicting] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)

  const canPredict = event.impact === 'high' && status !== 'past'
  const scenarios = prediction ? parseScenarios(prediction) : []

  async function fetchPrediction(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (predicting || prediction) return
    setPredicting(true)
    setPredictionError(null)
    try {
      const res = await fetch('/api/denaro/news-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair,
          title: event.title,
          currency: event.currency,
          impact: event.impact,
          forecast: event.forecast,
          previous: event.previous,
          timeIso: new Date(event.timeUtc * 1000).toISOString(),
        }),
      })
      const text = await res.text()
      if (!res.ok) throw new Error(text || 'failed')
      setPrediction(text)
    } catch (err) {
      setPredictionError(err instanceof Error ? err.message : 'failed')
    } finally {
      setPredicting(false)
    }
  }

  // Container classes — status drives the visual tint.
  const containerClass =
    status === 'live'
      ? 'denaro-live border border-l-[3px] border-rose-400 bg-rose-500/10'
      : status === 'imminent'
        ? 'denaro-live border border-l-[3px] border-amber-300/80 bg-amber-400/[0.07]'
        : `border border-l-[3px] ${styles.container} ${
            status === 'past' ? 'opacity-65' : ''
          }`

  const Wrapper = event.url ? ('a' as const) : ('div' as const)
  const wrapperProps = event.url
    ? { href: event.url, target: '_blank', rel: 'noopener noreferrer' as const }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={`block rounded px-3 py-2.5 transition ${containerClass}`}
    >
      {/* Top row: currency + title + status pill cluster */}
      <div className="flex items-start gap-2.5">
        <CurrencyTag currency={event.currency} />
        <p className="line-clamp-2 flex-1 text-[0.82rem] font-medium leading-snug text-cyan-50">
          {event.title}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <ImpactBadge impact={event.impact} />
          {status === 'live' && (
            <span className="rounded border border-rose-400/80 bg-rose-500/25 px-1.5 py-0.5 font-display text-[0.5rem] tracking-[0.22em] text-rose-100">
              {t('live')}
            </span>
          )}
          {status === 'imminent' && (
            <span className="rounded border border-amber-300/80 bg-amber-400/20 px-1.5 py-0.5 font-display text-[0.5rem] tracking-[0.22em] text-amber-100">
              {t('soon')}
            </span>
          )}
        </div>
      </div>

      {/* Meta row: time on the left, F/P chips in the middle, big countdown on the right */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-mono text-[0.68rem] text-cyan-200/65">
          {fmtTime(event.timeUtc)}
        </span>
        {event.forecast && (
          <DataChip label={t('forecast')} value={event.forecast} />
        )}
        {event.previous && (
          <DataChip label={t('previous')} value={event.previous} />
        )}
        <span className="ml-auto">
          <Countdown delta={delta} status={status} />
        </span>
      </div>

      {/* Predict CTA — neutral surface with a small gold dot accent */}
      {canPredict && !prediction && (
        <button
          type="button"
          onClick={fetchPrediction}
          disabled={predicting}
          className="mt-2.5 inline-flex items-center gap-2 rounded-md border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 font-display text-[0.58rem] tracking-[0.22em] text-cyan-100/85 transition hover:border-amber-300/50 hover:bg-slate-900/80 hover:text-amber-100 disabled:opacity-60"
        >
          <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
          {predicting ? <Spinner /> : <CrystalBallIcon />}
          <span>{predicting ? t('predicting') : t('predict')}</span>
        </button>
      )}

      {/* AI read — single dark tray with 3 labelled rows */}
      {prediction && (
        <div className="mt-3 rounded-md border border-slate-700/50 bg-slate-950/60 p-2.5">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
            <span className="font-display text-[0.55rem] font-bold tracking-[0.24em] text-amber-200/90">
              {t('predictionLabel')}
            </span>
            <span className="h-px flex-1 bg-slate-700/40" />
          </div>
          {scenarios.length === 3 ? (
            <div className="space-y-1.5">
              {scenarios.map((s) => (
                <ScenarioRow key={s.kind} kind={s.kind} text={s.text} />
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-line text-[0.72rem] leading-relaxed text-cyan-50/85">
              {prediction}
            </p>
          )}
        </div>
      )}

      {predictionError && (
        <p className="mt-2 text-[0.62rem] text-rose-300/85">// {predictionError}</p>
      )}
    </Wrapper>
  )
}

/* -- Forecast / Previous chip with full-word label. -- */
function DataChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-slate-700/50 bg-slate-900/50 px-2 py-0.5">
      <span className="font-display text-[0.5rem] tracking-[0.22em] text-slate-400">
        {label}
      </span>
      <span className="font-mono text-[0.65rem] text-cyan-50/90">{value}</span>
    </span>
  )
}

/* -- Single AI scenario row inside the dark tray.
 *    The whole tray is one neutral dark surface; only the icon-pill on the
 *    left and the label color signal the scenario kind. -- */
type ScenarioKind = 'hot' | 'cold' | 'inline'
function ScenarioRow({ kind, text }: { kind: ScenarioKind; text: string }) {
  const cfg = SCENARIO_STYLES[kind]
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[0.65rem] font-bold ${cfg.iconBg} ${cfg.iconText}`}
        aria-hidden
      >
        {cfg.glyph}
      </span>
      <div className="min-w-0 flex-1">
        <span
          className={`mr-1.5 font-display text-[0.55rem] font-bold tracking-[0.22em] ${cfg.label}`}
        >
          {cfg.title}
        </span>
        <span className="text-[0.72rem] leading-snug text-cyan-50/85">{text}</span>
      </div>
    </div>
  )
}

const SCENARIO_STYLES: Record<
  ScenarioKind,
  { iconBg: string; iconText: string; label: string; glyph: string; title: string }
> = {
  hot: {
    iconBg: 'bg-orange-500/15',
    iconText: 'text-orange-300',
    label: 'text-orange-200',
    glyph: '▲',
    title: 'HOT',
  },
  cold: {
    iconBg: 'bg-sky-500/15',
    iconText: 'text-sky-300',
    label: 'text-sky-200',
    glyph: '▼',
    title: 'COLD',
  },
  inline: {
    iconBg: 'bg-slate-700/50',
    iconText: 'text-slate-300',
    label: 'text-slate-200',
    glyph: '＝',
    title: 'IN-LINE',
  },
}

/* Parse the AI response into 3 scenarios. Returns [] if format doesn't match. */
function parseScenarios(text: string): { kind: ScenarioKind; text: string }[] {
  const out: { kind: ScenarioKind; text: string }[] = []
  // Split by lines, looking for "HOT (...): body" / "COLD ...:" / "IN-LINE...:"
  const re = /^\s*(HOT|COLD|IN[-\s]?LINE)\b[^:]*:\s*(.+)$/i
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const m = re.exec(line)
    if (!m) continue
    const headRaw = m[1].toUpperCase().replace(/\s/g, '')
    const kind: ScenarioKind =
      headRaw === 'HOT' ? 'hot' : headRaw === 'COLD' ? 'cold' : 'inline'
    if (out.find((s) => s.kind === kind)) continue
    out.push({ kind, text: m[2].trim() })
  }
  return out
}

function Spinner() {
  return (
    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function CrystalBallIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="11" r="7" />
      <path d="M5 18h14" />
      <path d="M9 8.5a3 3 0 0 1 3-2.5" />
    </svg>
  )
}

function Countdown({ delta, status }: { delta: number; status: EventStatus }) {
  const t = useTranslations('dashboard.newsCard')
  // delta = event.timeUtc - now (seconds)
  if (status === 'live') {
    return (
      <span className="font-display tracking-[0.22em] text-rose-200">
        {t('now')}
      </span>
    )
  }
  if (status === 'imminent') {
    return (
      <span className="font-display tracking-[0.22em] text-amber-200">
        T-{fmtDuration(delta)}
      </span>
    )
  }
  if (status === 'past') {
    return (
      <span className="font-display tracking-[0.18em] text-cyan-200/45">
        +{fmtDuration(-delta)}
      </span>
    )
  }
  return (
    <span className="font-display tracking-[0.18em] text-amber-200/85">
      T-{fmtDuration(delta)}
    </span>
  )
}

function CurrencyTag({ currency }: { currency: string }) {
  return (
    <span className="shrink-0 rounded border border-cyan-400/30 bg-cyan-500/10 px-1.5 py-0.5 font-display text-[0.55rem] tracking-[0.18em] text-cyan-100">
      {currency}
    </span>
  )
}

const IMPACT_STYLES: Record<Impact, { container: string }> = {
  high: {
    container:
      'border-cyan-400/15 border-l-rose-500/80 bg-rose-500/[0.06] hover:border-l-rose-400 hover:bg-rose-500/[0.10]',
  },
  medium: {
    container:
      'border-cyan-400/15 border-l-amber-400/80 bg-amber-400/[0.05] hover:border-l-amber-300 hover:bg-amber-400/[0.09]',
  },
  low: {
    container: 'border-cyan-400/15 border-l-cyan-400/40 bg-cyan-500/[0.04]',
  },
}

function ImpactBadge({ impact }: { impact: Impact }) {
  const t = useTranslations('dashboard.newsCard')
  if (impact === 'low') return null
  const cfg =
    impact === 'high'
      ? {
          label: t('highBadge'),
          klass: 'border-rose-400/60 bg-rose-500/15 text-rose-200',
        }
      : {
          label: t('medBadge'),
          klass: 'border-amber-300/60 bg-amber-400/15 text-amber-200',
        }
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-display text-[0.5rem] tracking-[0.2em] ${cfg.klass}`}
    >
      {cfg.label}
    </span>
  )
}

function ImpactDot({ impact }: { impact: Impact }) {
  const color =
    impact === 'high'
      ? 'bg-rose-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]'
      : impact === 'medium'
        ? 'bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.7)]'
        : 'bg-cyan-400/60'
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
}

function Skeleton() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="h-14 animate-pulse rounded bg-cyan-400/10" />
      ))}
    </ul>
  )
}

function fmtDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const remM = m % 60
  if (h < 24) return remM > 0 ? `${h}h ${remM}m` : `${h}h`
  const d = Math.floor(h / 24)
  const remH = h % 24
  return remH > 0 ? `${d}d ${remH}h` : `${d}d`
}

function fmtTime(unix: number): string {
  const d = new Date(unix * 1000)
  // Local time hh:mm + UTC marker
  const local = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  const utcH = String(d.getUTCHours()).padStart(2, '0')
  const utcM = String(d.getUTCMinutes()).padStart(2, '0')
  // Day stamp if not today
  const today = new Date()
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  const dayPrefix = sameDay
    ? ''
    : d.toLocaleDateString([], { weekday: 'short' }) + ' '
  return `${dayPrefix}${local} · ${utcH}:${utcM}Z`
}
