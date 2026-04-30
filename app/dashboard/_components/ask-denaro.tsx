'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { type Strategy } from '@/lib/profile/types'
import FormattedAnalysis from './formatted-analysis'

type Props = {
  pairs: string[]
  strategy: Strategy
}

type QuickAsk = { label: string; build: () => string }

function useQuickAsks(pairs: string[], strategy: Strategy): QuickAsk[] {
  const tQuick = useTranslations('dashboard.ask.quick')
  const tStrat = useTranslations('strategies')
  const lens = tStrat(`${strategy}.label`)
  const first = pairs[0] ?? 'XAUUSD'
  const list = pairs.length > 0 ? pairs.join(', ') : 'XAUUSD'

  return [
    {
      label: tQuick('concept'),
      build: () => tQuick('conceptPrompt'),
    },
    {
      label: tQuick('whyMoving', { pair: first }),
      build: () => tQuick('whyMovingPrompt', { pair: first }),
    },
    {
      label: tQuick('sizing'),
      build: () => tQuick('sizingPrompt', { pair: first }),
    },
    {
      label: tQuick('review'),
      build: () => tQuick('reviewPrompt', { pair: first, lens }),
    },
    {
      label: tQuick('session'),
      build: () => tQuick('sessionPrompt', { list, lens }),
    },
    {
      label: tQuick('backtest'),
      build: () => tQuick('backtestPrompt', { pair: first, lens }),
    },
  ]
}

export default function AskDenaro({ pairs, strategy }: Props) {
  const t = useTranslations('dashboard.ask')
  const tCommon = useTranslations('common')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickAsks = useQuickAsks(pairs, strategy)
  const examplesRaw = useTranslations('dashboard.ask').raw('examples') as unknown
  const examples: string[] = Array.isArray(examplesRaw)
    ? (examplesRaw as string[])
    : []

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setLoading(true)
    setError(null)
    setOutput('')
    try {
      const res = await fetch('/api/denaro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
        }),
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
        setOutput(acc)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorFailed'))
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  return (
    <section className="denaro-panel space-y-3 rounded-md p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            {t('badge')}
          </p>
          <h3 className="font-display text-base font-bold uppercase tracking-[0.16em] text-cyan-50">
            {t('title')}
          </h3>
          <p className="mt-1 text-[0.7rem] leading-snug text-cyan-100/55">
            {t('subtitle')}
          </p>
        </div>
        {(output || error) && !loading && (
          <button
            type="button"
            onClick={() => {
              setOutput('')
              setError(null)
            }}
            className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/45 transition hover:text-cyan-100/80"
          >
            {tCommon('clear')}
          </button>
        )}
      </header>

      {/* Quick-ask chips — drop a contextual prompt into the input */}
      <div className="flex flex-wrap gap-1.5">
        {quickAsks.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => setInput(q.build())}
            disabled={loading}
            className="rounded border border-cyan-400/25 bg-cyan-500/[0.04] px-2.5 py-1 font-display text-[0.6rem] tracking-[0.18em] text-cyan-100/80 transition hover:border-cyan-300/50 hover:bg-cyan-500/[0.08] disabled:opacity-40"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Empty-state hint — only when there's no output yet */}
      {!output && !loading && !error && (
        <div className="rounded border border-cyan-400/15 bg-cyan-500/[0.03] p-3">
          <p className="font-display text-[0.55rem] tracking-[0.28em] text-amber-300/80">
            {t('examplesBadge')}
          </p>
          <ul className="mt-1.5 space-y-1">
            {examples.map((ex, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[0.72rem] leading-snug text-cyan-100/65"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-300/60" />
                <span>{ex}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.62rem] text-cyan-100/40">
            {t('tip', { bracket: '[1000]' })}
          </p>
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        rows={3}
        placeholder={t('placeholder')}
        disabled={loading}
        className="denaro-input resize-none"
      />

      <button
        onClick={send}
        disabled={loading || !input.trim()}
        className="denaro-btn"
      >
        {loading ? t('sending') : t('send')}
      </button>

      {error && <p className="text-[0.7rem] text-rose-300/90">// {error}</p>}
      {(output || (loading && !error)) && (
        <div className="rounded border border-cyan-400/20 bg-cyan-500/[0.04] p-3">
          {loading && !output && (
            <p className="font-display text-[0.6rem] tracking-[0.32em] text-cyan-200/60">
              {t('channelOpen')}
            </p>
          )}
          {output && <FormattedAnalysis text={output} />}
        </div>
      )}
    </section>
  )
}
