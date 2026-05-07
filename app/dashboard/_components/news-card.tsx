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
      const res = await fetch(`/api/news?symbol=${pair}&count=20`, {
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
    <div className="denaro-panel relative flex flex-col gap-3 rounded-md p-3 sm:p-4">
      {/* Compact meta header — pair name comes from the parent accordion. */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-[0.55rem] tracking-[0.22em]">
          {items.length > 0 ? (
            <>
              <span className="text-cyan-200/65">
                {t('eventCount', { count: items.length })} · {t('thisWeek')}
              </span>
              {liveCount > 0 && (
                <span className="flex items-center gap-1 text-rose-200 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]" />
                  {liveCount} {t('live')}
                </span>
              )}
              {highCount > 0 && (
                <span className="flex items-center gap-1 text-rose-300/85">
                  <ImpactDot impact="high" />
                  {highCount} {t('high')}
                </span>
              )}
              {medCount > 0 && (
                <span className="flex items-center gap-1 text-amber-200/85">
                  <ImpactDot impact="medium" />
                  {medCount} {t('med')}
                </span>
              )}
            </>
          ) : (
            <span className="text-cyan-200/55">{t('thisWeek')}</span>
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
        <div className="-mx-3 overflow-x-auto sm:-mx-4">
          <table className="w-full min-w-[720px] border-collapse text-left text-[0.72rem]">
            <thead>
              <tr className="border-y border-cyan-400/15 bg-cyan-500/[0.04] font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/70">
                <th className="px-3 py-2 font-medium">{t('colTime')}</th>
                <th className="px-2 py-2 font-medium">{t('colCcy')}</th>
                <th className="px-2 py-2 font-medium">{t('colEvent')}</th>
                <th className="px-2 py-2 font-medium">{t('colImpact')}</th>
                <th className="px-2 py-2 text-right font-medium">{t('forecast')}</th>
                <th className="px-2 py-2 text-right font-medium">{t('previous')}</th>
                <th className="px-2 py-2 text-right font-medium">{t('colIn')}</th>
                <th className="px-2 py-2 pr-3" aria-label={t('predict')} />
              </tr>
            </thead>
            <tbody>
              {items.map((event) => (
                <EventTableRow
                  key={event.id}
                  event={event}
                  now={now}
                  pair={pair}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-[0.7rem] text-cyan-100/40">
          {t('empty', { pair })}
        </p>
      )}
    </div>
  )
}

function EventTableRow({ event, now, pair }: { event: NewsItem; now: number; pair: string }) {
  const t = useTranslations('dashboard.newsCard')
  const delta = event.timeUtc - now
  const status = statusOf(delta)

  const [prediction, setPrediction] = useState<string | null>(null)
  const [predicting, setPredicting] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)

  const canPredict = event.impact === 'high' && status !== 'past'
  const scenarios = prediction ? parseScenarios(prediction) : []

  async function fetchPrediction() {
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

  // Per-status row styling — kept subtle so the table stays calm.
  const rowTint =
    status === 'live'
      ? 'denaro-live bg-rose-500/[0.10]'
      : status === 'imminent'
        ? 'denaro-live bg-amber-400/[0.06]'
        : status === 'past'
          ? 'opacity-60'
          : event.impact === 'high'
            ? 'bg-rose-500/[0.03]'
            : ''

  return (
    <>
      <tr
        className={`border-b border-cyan-400/10 transition hover:bg-cyan-500/[0.03] ${rowTint}`}
      >
        <td className="whitespace-nowrap px-3 py-2 align-top font-mono text-[0.68rem] text-cyan-100/85">
          {fmtTime(event.timeUtc)}
        </td>
        <td className="px-2 py-2 align-top">
          <CurrencyTag currency={event.currency} />
        </td>
        <td className="px-2 py-2 align-top">
          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.78rem] font-medium text-cyan-50 transition hover:text-amber-200"
            >
              {event.title}
            </a>
          ) : (
            <span className="text-[0.78rem] font-medium text-cyan-50">{event.title}</span>
          )}
        </td>
        <td className="whitespace-nowrap px-2 py-2 align-top">
          <div className="flex items-center gap-1.5">
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
        </td>
        <td className="whitespace-nowrap px-2 py-2 text-right align-top font-mono text-[0.7rem] text-cyan-50/85">
          {event.forecast ?? '—'}
        </td>
        <td className="whitespace-nowrap px-2 py-2 text-right align-top font-mono text-[0.7rem] text-cyan-50/65">
          {event.previous ?? '—'}
        </td>
        <td className="whitespace-nowrap px-2 py-2 text-right align-top">
          <Countdown delta={delta} status={status} />
        </td>
        <td className="whitespace-nowrap px-2 py-2 pr-3 text-right align-top">
          {canPredict && !prediction && (
            <button
              type="button"
              onClick={fetchPrediction}
              disabled={predicting}
              aria-label={t('predict')}
              title={t('predict')}
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-md border border-amber-300/50 bg-gradient-to-r from-amber-400/10 via-amber-300/25 to-amber-400/10 px-2.5 py-1 font-display text-[0.58rem] font-bold uppercase tracking-[0.22em] text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.12)] transition hover:border-amber-300/80 hover:from-amber-400/20 hover:via-amber-300/40 hover:to-amber-400/20 hover:text-amber-50 hover:shadow-[0_0_18px_rgba(251,191,36,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {/* Subtle shimmer on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-200/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative flex items-center gap-1.5">
                {predicting ? <Spinner /> : <SparkleIcon />}
                <span className="hidden lg:inline">
                  {predicting ? t('predicting') : t('predict')}
                </span>
              </span>
            </button>
          )}
        </td>
      </tr>

      {(prediction || predictionError) && (
        <tr className={rowTint}>
          <td colSpan={8} className="px-3 pb-3 pt-0">
            {prediction && (
              <div className="rounded-md border border-slate-700/50 bg-slate-950/60 p-2.5">
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
              <p className="text-[0.62rem] text-rose-300/85">// {predictionError}</p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

/* -- Single AI scenario row inside the dark tray.
 *    Compact 3-column grid: icon · label · body, vertically aligned across rows. -- */
type ScenarioKind = 'hot' | 'cold' | 'inline'
function ScenarioRow({ kind, text }: { kind: ScenarioKind; text: string }) {
  const cfg = SCENARIO_STYLES[kind]
  return (
    <div className="grid grid-cols-[auto_56px_1fr] items-center gap-x-2.5 gap-y-0 py-1">
      <span
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[0.7rem] font-bold ${cfg.iconBg} ${cfg.iconText}`}
        aria-hidden
      >
        {cfg.glyph}
      </span>
      <span
        className={`font-display text-[0.6rem] font-bold tracking-[0.22em] ${cfg.label}`}
      >
        {cfg.title}
      </span>
      <span className="text-[0.78rem] leading-snug text-cyan-50/90">{text}</span>
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

function SparkleIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]"
    >
      {/* Big 4-point star */}
      <path d="M12 2.5 13.6 9 20 10.5 13.6 12 12 18.5 10.4 12 4 10.5 10.4 9 12 2.5Z" />
      {/* Small accent star */}
      <path d="M19 16l.7 2.1L22 19l-2.3.9L19 22l-.7-2.1L16 19l2.3-.9L19 16Z" opacity="0.8" />
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
