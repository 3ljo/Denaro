'use client'

import { useEffect, useState } from 'react'
import type { Impact, NewsItem } from '@/lib/market/news'

export default function NewsCard({ pair }: { pair: string }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const highCount = items.filter((n) => n.impact === 'high').length
  const medCount = items.filter((n) => n.impact === 'medium').length

  return (
    <div className="denaro-panel relative flex flex-col gap-3 rounded-md p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            // NEWS
          </p>
          <h3 className="font-display text-lg font-bold uppercase tracking-[0.18em] text-cyan-50">
            {pair} Feed
          </h3>
          {items.length > 0 && (
            <div className="mt-1 flex items-center gap-2 font-display text-[0.55rem] tracking-[0.18em]">
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
          {items.map((n, i) => (
            <li key={`${n.link}-${i}`}>
              <NewsRow item={n} />
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-[0.7rem] text-cyan-100/40">
          No medium / high-impact headlines for {pair} right now.
        </p>
      )}
    </div>
  )
}

function NewsRow({ item }: { item: NewsItem }) {
  const styles = IMPACT_STYLES[item.impact]
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded border border-l-[3px] px-2.5 py-2 transition ${styles.container}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-[0.78rem] leading-snug text-cyan-50">
          {item.title}
        </p>
        <ImpactBadge impact={item.impact} />
      </div>
      <p className="mt-1 flex items-center justify-between text-[0.6rem] text-cyan-200/55">
        <span className="truncate font-display tracking-[0.12em]">
          {item.publisher || 'Unknown'}
        </span>
        <span className="ml-2 shrink-0 font-mono">
          {timeAgo(item.publishedAt)}
        </span>
      </p>
    </a>
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
    container:
      'border-cyan-400/15 border-l-cyan-400/40 bg-cyan-500/[0.04] hover:border-cyan-300/40 hover:bg-cyan-500/[0.08]',
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
      className={`shrink-0 rounded border px-1.5 py-0.5 font-display text-[0.5rem] tracking-[0.2em] ${cfg.klass}`}
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
        <li key={i} className="h-12 animate-pulse rounded bg-cyan-400/10" />
      ))}
    </ul>
  )
}

function timeAgo(unix: number): string {
  if (!unix) return ''
  const diff = Math.max(0, Date.now() / 1000 - unix)
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86_400)}d`
}
