'use client'

import { useEffect, useState } from 'react'
import type { NewsItem } from '@/lib/market/news'

export default function NewsCard({ pair }: { pair: string }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/news?symbol=${pair}&count=6`, {
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
              <a
                href={n.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded border border-cyan-400/15 bg-cyan-500/[0.04] px-2.5 py-2 transition hover:border-cyan-300/40 hover:bg-cyan-500/[0.08]"
              >
                <p className="line-clamp-2 text-[0.78rem] leading-snug text-cyan-50">
                  {n.title}
                </p>
                <p className="mt-1 flex items-center justify-between text-[0.6rem] text-cyan-200/55">
                  <span className="truncate font-display tracking-[0.12em]">
                    {n.publisher || 'Unknown'}
                  </span>
                  <span className="ml-2 shrink-0 font-mono">
                    {timeAgo(n.publishedAt)}
                  </span>
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="text-[0.7rem] text-cyan-100/40">
          No recent headlines for {pair}.
        </p>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="h-12 animate-pulse rounded bg-cyan-400/10"
        />
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
