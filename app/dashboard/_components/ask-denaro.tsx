'use client'

import { useState } from 'react'
import { STRATEGY_LABEL, type Strategy } from '@/lib/profile/types'
import FormattedAnalysis from './formatted-analysis'

type Props = {
  pairs: string[]
  strategy: Strategy
}

type QuickAsk = { label: string; build: () => string }

function buildQuickAsks(pairs: string[], strategy: Strategy): QuickAsk[] {
  const lens = STRATEGY_LABEL[strategy]
  const first = pairs[0] ?? 'XAUUSD'
  const list = pairs.length > 0 ? pairs.join(', ') : 'XAUUSD'

  return [
    {
      label: 'Concept lookup',
      build: () =>
        `In one paragraph each, explain CHoCH vs BoS, and when each one signals a real shift in market structure.`,
    },
    {
      label: `Why is ${first} moving?`,
      build: () =>
        `Why might ${first} be moving the way it is right now? Give 3 candidate drivers — macro, structural, and session-driven — and rank them by likelihood.`,
    },
    {
      label: 'Position size calc',
      build: () =>
        `Help me size a trade. Account size: $[1000]. Risk per trade: [1]%. Pair: ${first}. Entry: [price]. Stop loss: [price]. Calculate: dollar risk, position size in lots/units, and a sanity check on the SL distance.`,
    },
    {
      label: 'Review my setup',
      build: () =>
        `Review this setup for ${first} from a ${lens} perspective.\n\nEntry: [price]\nStop loss: [price]\nTake profit: [price]\nReason: [why I'm taking it]\n\nTell me: is the structure clean? What invalidates it? Anything I missed?`,
    },
    {
      label: 'Best session',
      build: () =>
        `For my pairs (${list}) and a ${lens} approach, which trading session(s) historically offer the cleanest setups, and why? Be specific about volatility windows and avoid generic advice.`,
    },
    {
      label: 'Backtest plan',
      build: () =>
        `Give me a 5-step plan to backtest a ${lens} strategy on ${first}. Include: data window, entry rule, exit rule, what stats to track, and what disqualifies the strategy.`,
    },
  ]
}

const EXAMPLES = [
  'Explain liquidity sweeps with examples on XAUUSD',
  'I bought EURUSD at 1.1750, SL 1.1720, TP 1.1810 — anything wrong?',
  'What macro events this week could move USD pairs?',
  'How do I read order flow on a 15M chart?',
]

export default function AskDenaro({ pairs, strategy }: Props) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const quickAsks = buildQuickAsks(pairs, strategy)

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
        const errText = await res.text().catch(() => 'request failed')
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
      setError(err instanceof Error ? err.message : 'failed')
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
            // CHANNEL
          </p>
          <h3 className="font-display text-base font-bold uppercase tracking-[0.16em] text-cyan-50">
            Ask Denaro
          </h3>
          <p className="mt-1 text-[0.7rem] leading-snug text-cyan-100/55">
            Concepts, setup reviews, position sizing, market reads — anything
            that doesn&rsquo;t need a chart screenshot.
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
            CLEAR
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
            // EXAMPLES
          </p>
          <ul className="mt-1.5 space-y-1">
            {EXAMPLES.map((ex, i) => (
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
            Tip: square brackets like <code className="text-cyan-200/70">[1000]</code> in the templates are placeholders — replace before sending.
          </p>
        </div>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        rows={3}
        placeholder="Ask Denaro... (Shift+Enter for newline)"
        disabled={loading}
        className="denaro-input resize-none"
      />

      <button
        onClick={send}
        disabled={loading || !input.trim()}
        className="denaro-btn"
      >
        {loading ? 'Streaming…' : 'Send'}
      </button>

      {error && <p className="text-[0.7rem] text-rose-300/90">// {error}</p>}
      {(output || (loading && !error)) && (
        <div className="rounded border border-cyan-400/20 bg-cyan-500/[0.04] p-3">
          {loading && !output && (
            <p className="font-display text-[0.6rem] tracking-[0.32em] text-cyan-200/60">
              // CHANNEL OPEN…
            </p>
          )}
          {output && <FormattedAnalysis text={output} />}
        </div>
      )}
    </section>
  )
}
