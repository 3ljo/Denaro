'use client'

import { useEffect, useState } from 'react'
import type { Impact, NewsItem } from '@/lib/market/news'

/** Window in seconds where an event is treated as "LIVE" (pulses red). */
const LIVE_WINDOW = 15 * 60

export default function NewsCard({ pair }: { pair: string }) {
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

  const liveCount = items.filter((e) => Math.abs(e.timeUtc - now) <= LIVE_WINDOW).length
  const highCount = items.filter((e) => e.impact === 'high').length
  const medCount = items.filter((e) => e.impact === 'medium').length

  return (
    <div className="denaro-panel relative flex flex-col gap-3 rounded-md p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            // NEWS · CALENDAR
          </p>
          <h3 className="font-display text-lg font-bold uppercase tracking-[0.18em] text-cyan-50">
            {pair} Feed
          </h3>
          {items.length > 0 && (
            <div className="mt-1 flex items-center gap-2 font-display text-[0.55rem] tracking-[0.18em]">
              {liveCount > 0 && (
                <span className="flex items-center gap-1 text-rose-200 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]" />
                  {liveCount} LIVE
                </span>
              )}
              <span className="flex items-center gap-1 text-rose-300/85">
                <ImpactDot impact="high" />
                {highCount} HIGH
              </span>
              <span className="flex items-center gap-1 text-amber-200/85">
                <ImpactDot impact="medium" />
                {medCount} MED
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Refresh"
          className="rounded border border-cyan-400/30 bg-cyan-500/[0.06] px-2 py-1 font-display text-[0.6rem] tracking-[0.2em] text-cyan-100/80 transition hover:border-cyan-300/60 hover:bg-cyan-500/10 disabled:opacity-40"
        >
          {loading ? '…' : '↻'}
        </button>
      </header>

      {loading && items.length === 0 && <Skeleton />}
      {error && items.length === 0 && (
        <div className="rounded border border-rose-400/30 bg-rose-500/10 p-2.5 text-[0.7rem] text-rose-200">
          // signal lost — {error}
        </div>
      )}
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((event) => (
            <li key={event.id}>
              <EventRow event={event} now={now} />
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-[0.7rem] text-cyan-100/40">
          No medium / high-impact events scheduled for {pair} this week.
        </p>
      )}
    </div>
  )
}

function EventRow({ event, now }: { event: NewsItem; now: number }) {
  const delta = event.timeUtc - now // seconds
  const isLive = Math.abs(delta) <= LIVE_WINDOW
  const isPast = delta < -LIVE_WINDOW
  const styles = IMPACT_STYLES[event.impact]

  // Container classes — LIVE state overrides impact tint with a red pulse.
  const containerClass = isLive
    ? 'denaro-live border border-l-[3px] border-rose-400 bg-rose-500/10'
    : `border border-l-[3px] ${styles.container} ${
        isPast ? 'opacity-65' : ''
      }`

  const Wrapper = event.url
    ? ('a' as const)
    : ('div' as const)

  const wrapperProps = event.url
    ? { href: event.url, target: '_blank', rel: 'noopener noreferrer' as const }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={`block rounded px-2.5 py-2 transition ${containerClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-1 items-start gap-2 overflow-hidden">
          <CurrencyTag currency={event.currency} />
          <p className="line-clamp-2 flex-1 text-[0.78rem] leading-snug text-cyan-50">
            {event.title}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ImpactBadge impact={event.impact} />
          {isLive && (
            <span className="rounded border border-rose-400/80 bg-rose-500/25 px-1.5 py-0.5 font-display text-[0.5rem] tracking-[0.22em] text-rose-100">
              LIVE
            </span>
          )}
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[0.62rem]">
        <span className="text-cyan-200/65">{fmtTime(event.timeUtc)}</span>
        <Countdown delta={delta} />
      </div>

      {(event.forecast || event.previous) && (
        <div className="mt-1 flex gap-3 text-[0.6rem] text-cyan-200/55">
          {event.forecast && (
            <span>
              <span className="text-cyan-300/45">F</span> {event.forecast}
            </span>
          )}
          {event.previous && (
            <span>
              <span className="text-cyan-300/45">P</span> {event.previous}
            </span>
          )}
        </div>
      )}
    </Wrapper>
  )
}

function Countdown({ delta }: { delta: number }) {
  // delta = event.timeUtc - now (seconds)
  if (Math.abs(delta) <= LIVE_WINDOW) {
    return (
      <span className="font-display tracking-[0.22em] text-rose-200">
        ▶ NOW
      </span>
    )
  }
  if (delta < 0) {
    // past
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
  if (impact === 'low') return null
  const cfg =
    impact === 'high'
      ? {
          label: 'HIGH',
          klass: 'border-rose-400/60 bg-rose-500/15 text-rose-200',
        }
      : {
          label: 'MED',
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
