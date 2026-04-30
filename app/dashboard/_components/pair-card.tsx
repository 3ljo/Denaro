'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Card } from '@/lib/denaro/structured-analysis'
import type { Strategy } from '@/lib/profile/types'

export default function PairCard({
  pair,
  strategy,
}: {
  pair: string
  strategy: Strategy
}) {
  const t = useTranslations('dashboard.pairCard')
  const tCommon = useTranslations('common')
  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(force = false) {
    setLoading(true)
    setError(null)
    if (force) setCard(null)
    try {
      const res = await fetch('/api/denaro/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair, strategy }),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(body || `request failed (${res.status})`)
      }
      const json = (await res.json()) as Card
      setCard(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair, strategy])

  return (
    <div className="denaro-panel relative flex flex-col gap-3 rounded-md p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            {t('badge')}
          </p>
          <h3 className="font-display text-lg font-bold uppercase tracking-[0.18em] text-cyan-50">
            {pair}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {card && <ConfluenceRing score={card.confluence_score} />}
          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading}
            aria-label={tCommon('refresh')}
            className="rounded border border-cyan-400/30 bg-cyan-500/[0.06] px-2 py-1 font-display text-[0.6rem] tracking-[0.2em] text-cyan-100/80 transition hover:border-cyan-300/60 hover:bg-cyan-500/10 disabled:opacity-40"
          >
            {loading ? '…' : '↻'}
          </button>
        </div>
      </header>

      {loading && !card && <Skeleton />}
      {error && !card && <ErrorView error={error} />}
      {card && <CardBody card={card} />}
    </div>
  )
}

function CardBody({ card }: { card: Card }) {
  const t = useTranslations('dashboard.pairCard')
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BiasPill bias={card.bias} />
      </div>

      <p className="text-[0.85rem] leading-snug text-cyan-50">
        {card.summary}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <LevelList title={t('resistance')} levels={card.key_resistances} tone="rose" />
        <LevelList title={t('support')} levels={card.key_supports} tone="emerald" />
      </div>

      <div className="space-y-1.5 border-t border-cyan-400/15 pt-2.5">
        <Field label={t('nextMove')} value={card.next_move} />
        <Field label={t('invalidation')} value={card.invalidation} />
      </div>
    </div>
  )
}

function BiasPill({ bias }: { bias: 'bullish' | 'bearish' | 'range' }) {
  const t = useTranslations('dashboard.pairCard.bias')
  const map = {
    bullish: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200',
    bearish: 'border-rose-400/50 bg-rose-500/15 text-rose-200',
    range: 'border-amber-300/50 bg-amber-400/15 text-amber-200',
  } as const
  return (
    <span
      className={`rounded border px-2 py-0.5 font-display text-[0.6rem] uppercase tracking-[0.22em] ${map[bias]}`}
    >
      {t(bias)}
    </span>
  )
}

function LevelList({
  title,
  levels,
  tone,
}: {
  title: string
  levels: string[]
  tone: 'rose' | 'emerald'
}) {
  const dot = tone === 'rose' ? 'bg-rose-400' : 'bg-emerald-400'
  return (
    <div>
      <p className="mb-1 font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/70">
        {title}
      </p>
      <ul className="space-y-1">
        {levels.slice(0, 3).map((lv, i) => (
          <li
            key={i}
            className="flex items-start gap-1.5 text-[0.72rem] leading-tight text-cyan-100/85"
          >
            <span className={`mt-1 h-1 w-1 shrink-0 rounded-full ${dot}`} />
            <span className="break-words">{lv}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/70">
        {label}
      </p>
      <p className="text-[0.78rem] leading-snug text-cyan-100/85">{value}</p>
    </div>
  )
}

function ConfluenceRing({ score }: { score: number }) {
  const t = useTranslations('dashboard.pairCard')
  const clamped = Math.max(0, Math.min(100, Math.round(score || 0)))
  const r = 16
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c
  const color = clamped >= 70 ? '#4ade80' : clamped >= 40 ? '#fbbf24' : '#f87171'
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-label={t('confluenceLabel', { score: clamped })}>
      <circle cx="20" cy="20" r={r} stroke="rgba(125,211,252,0.18)" strokeWidth="3" fill="none" />
      <circle
        cx="20"
        cy="20"
        r={r}
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 20 20)"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fill={color}
        fontFamily="var(--font-orbitron), system-ui"
        fontSize="11"
        fontWeight="700"
      >
        {clamped}
      </text>
    </svg>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-20 animate-pulse rounded bg-cyan-400/15" />
      <div className="h-3 w-full animate-pulse rounded bg-cyan-400/10" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-cyan-400/10" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 animate-pulse rounded bg-cyan-400/10" />
        <div className="h-10 animate-pulse rounded bg-cyan-400/10" />
      </div>
      <div className="h-3 w-2/3 animate-pulse rounded bg-cyan-400/10" />
    </div>
  )
}

function ErrorView({ error }: { error: string }) {
  const tCommon = useTranslations('common')
  return (
    <div className="rounded border border-rose-400/30 bg-rose-500/10 p-2.5 text-[0.7rem] text-rose-200">
      {tCommon('signalLost', { error })}
    </div>
  )
}
