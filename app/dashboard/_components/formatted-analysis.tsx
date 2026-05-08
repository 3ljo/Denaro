'use client'

import { useState, type ReactNode } from 'react'

/**
 * Renders the streaming markdown-light output from /api/denaro/vision into
 * proper sections. The model is instructed to end with a **Plan** bullet
 * list (Entry / SL / TP1 / TP2 / R:R / Confidence) — when present it is
 * lifted out and rendered as a structured trade ticket above the prose
 * reasoning.
 */
export default function FormattedAnalysis({
  text,
  pair,
}: {
  text: string
  pair?: string
}) {
  const blocks = splitBlocks(text)
  const planIdx = blocks.findIndex(
    (b) => b.kind === 'list' && b.section === 'plan',
  )
  const bias = extractBiasWord(blocks)

  if (planIdx >= 0) {
    const plan = blocks[planIdx] as Extract<Block, { kind: 'list' }>
    const planData = parsePlan(plan.items)
    const skip = new Set<number>([planIdx])
    // Skip the heading immediately preceding the plan list too.
    const prev = blocks[planIdx - 1]
    if (prev && prev.kind === 'heading' && prev.section === 'plan') {
      skip.add(planIdx - 1)
    }
    const rest = blocks.filter((_, i) => !skip.has(i))

    return (
      <div className="space-y-3.5">
        <TradeTicket plan={planData} bias={bias} pair={pair} />
        {rest.length > 0 && (
          <div className="space-y-3 border-t border-cyan-400/15 pt-3.5">
            {rest.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

type Section = 'bias' | 'levels' | 'plan' | 'other'

type Block =
  | { kind: 'heading'; text: string; section: Section }
  | { kind: 'list'; items: string[]; section: Section }
  | { kind: 'paragraph'; text: string; section: Section }

function classify(heading: string): Section {
  const h = heading.toLowerCase().trim()
  if (h === 'bias' || h.startsWith('bias ')) return 'bias'
  if (h === 'plan' || h.includes('trade plan') || h.includes('trade ticket')) {
    return 'plan'
  }
  if (h.includes('level')) return 'levels'
  return 'other'
}

function splitBlocks(text: string): Block[] {
  const sections = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  const out: Block[] = []
  let current: Section = 'other'

  for (const section of sections) {
    const lines = section
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) continue

    if (lines.length === 1 && /^\*\*.+\*\*$/.test(lines[0])) {
      const headText = lines[0].replace(/^\*\*|\*\*$/g, '')
      current = classify(headText)
      out.push({ kind: 'heading', text: headText, section: current })
      continue
    }

    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      out.push({
        kind: 'list',
        items: lines.map((l) => l.replace(/^[-*]\s+/, '')),
        section: current,
      })
      continue
    }

    if (/^\*\*.+\*\*$/.test(lines[0]) && lines.length > 1) {
      const headText = lines[0].replace(/^\*\*|\*\*$/g, '')
      current = classify(headText)
      out.push({ kind: 'heading', text: headText, section: current })
      const rest = lines.slice(1)
      if (rest.every((l) => /^[-*]\s+/.test(l))) {
        out.push({
          kind: 'list',
          items: rest.map((l) => l.replace(/^[-*]\s+/, '')),
          section: current,
        })
      } else {
        out.push({
          kind: 'paragraph',
          text: rest.join(' '),
          section: current,
        })
      }
      continue
    }

    out.push({ kind: 'paragraph', text: lines.join(' '), section: current })
  }
  return out
}

function Block({ block }: { block: Block }) {
  if (block.kind === 'heading') {
    return (
      <h4 className="font-display text-[0.62rem] font-bold uppercase tracking-[0.28em] text-amber-300/90">
        {block.text}
      </h4>
    )
  }
  if (block.kind === 'list') {
    const renderItem =
      block.section === 'levels' ? renderLevelLine : renderInline
    return (
      <ul className="space-y-1.5">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[0.82rem] leading-snug text-cyan-50"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-300/70" />
            <span className="min-w-0 flex-1">{renderItem(item)}</span>
          </li>
        ))}
      </ul>
    )
  }
  if (block.section === 'bias') {
    return (
      <p className="flex flex-wrap items-baseline gap-2 text-[0.82rem] leading-relaxed text-cyan-50">
        {renderBiasLine(block.text)}
      </p>
    )
  }
  return (
    <p className="text-[0.82rem] leading-relaxed text-cyan-50">
      {renderInline(block.text)}
    </p>
  )
}

/* --- trade ticket --- */

type BiasWord = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'RANGE'
type Confidence = 'LOW' | 'MEDIUM' | 'HIGH'
type LevelValue = { price: string; diff: string | null }
type PlanData = {
  entry: LevelValue | null
  sl: LevelValue | null
  tp1: LevelValue | null
  tp2: LevelValue | null
  rr: string | null
  confidence: Confidence | null
  noTrade: string | null
}

function parsePlan(items: string[]): PlanData {
  const data: PlanData = {
    entry: null,
    sl: null,
    tp1: null,
    tp2: null,
    rr: null,
    confidence: null,
    noTrade: null,
  }
  for (const item of items) {
    const idx = item.indexOf(': ')
    if (idx === -1) continue
    const rawLabel = item.slice(0, idx).trim()
    const value = item.slice(idx + 2).trim()
    const label = rawLabel.toLowerCase().replace(/[\s./-]+/g, '')
    if (label === 'entry') data.entry = parseLevel(value)
    else if (label === 'sl' || label === 'stoploss' || label === 'stop') {
      data.sl = parseLevel(value)
    } else if (label === 'tp1' || label === 'takeprofit1') {
      data.tp1 = parseLevel(value)
    } else if (label === 'tp2' || label === 'takeprofit2') {
      data.tp2 = parseLevel(value)
    } else if (label === 'rr') {
      data.rr = value
    } else if (label === 'confidence' || label === 'conf') {
      const v = value.toUpperCase()
      if (v.includes('HIGH')) data.confidence = 'HIGH'
      else if (v.includes('MED')) data.confidence = 'MEDIUM'
      else if (v.includes('LOW')) data.confidence = 'LOW'
    } else if (label === 'notrade') {
      data.noTrade = value
    }
  }
  return data
}

function parseLevel(value: string): LevelValue {
  // "above 4723.53", "4723.53", "4723.53 (-13.5 pips)"
  const m = value.match(/^(.*?)\s*(?:\((.+?)\))?\s*$/)
  if (m) return { price: m[1].trim(), diff: m[2] ?? null }
  return { price: value, diff: null }
}

function extractBiasWord(blocks: Block[]): BiasWord | null {
  for (const b of blocks) {
    if (b.kind === 'paragraph' && b.section === 'bias') {
      const m = b.text.match(/\b(BULLISH|BEARISH|NEUTRAL|RANGE)\b/i)
      if (m) return m[1].toUpperCase() as BiasWord
    }
  }
  return null
}

function TradeTicket({
  plan,
  bias,
  pair,
}: {
  plan: PlanData
  bias: BiasWord | null
  pair?: string
}) {
  if (plan.noTrade) {
    return (
      <div className="rounded-lg border border-amber-300/45 bg-amber-400/[0.06] p-3 shadow-[0_0_22px_rgba(251,191,36,0.15)]">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block rounded border border-amber-300/55 bg-amber-400/15 px-2 py-0.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.22em] text-amber-200">
            No Trade
          </span>
          {plan.confidence && <ConfChip value={plan.confidence} />}
        </div>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-cyan-50">
          {plan.noTrade}
        </p>
      </div>
    )
  }

  type RowType = 'tp2' | 'tp1' | 'entry' | 'sl'
  type Row = { type: RowType; label: string; value: LevelValue }
  const rawRows: Row[] = [
    { type: 'tp2', label: 'TP 2', value: plan.tp2 as LevelValue },
    { type: 'tp1', label: 'TP 1', value: plan.tp1 as LevelValue },
    { type: 'entry', label: 'Entry', value: plan.entry as LevelValue },
    { type: 'sl', label: 'Stop', value: plan.sl as LevelValue },
  ].filter((r): r is Row => r.value !== null)

  // Sort top-to-bottom by actual price so the ticket reads like a chart ladder.
  const rows = [...rawRows].sort((a, b) => {
    const an = parsePriceNum(a.value.price)
    const bn = parsePriceNum(b.value.price)
    if (an === null || bn === null) return 0
    return bn - an
  })

  // R:R proportional bar — only meaningful when both risk and reward exist.
  const entryN = plan.entry ? parsePriceNum(plan.entry.price) : null
  const slN = plan.sl ? parsePriceNum(plan.sl.price) : null
  const tp2N = plan.tp2 ? parsePriceNum(plan.tp2.price) : null
  const risk = entryN !== null && slN !== null ? Math.abs(entryN - slN) : 0
  const reward = entryN !== null && tp2N !== null ? Math.abs(tp2N - entryN) : 0
  const total = risk + reward
  const riskPct = total > 0 ? Math.max(4, (risk / total) * 100) : 50
  const rewardPct = total > 0 ? 100 - riskPct : 50

  return (
    <div className="rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-amber-400/[0.04] px-3 py-3 shadow-[0_0_28px_rgba(34,211,238,0.10)] sm:px-4">
      <div className="flex items-center justify-between gap-2 pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {bias && <BiasPill word={bias} />}
          {pair && (
            <span className="truncate font-display text-[0.62rem] font-bold tracking-[0.22em] uppercase text-cyan-100/85">
              {pair}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {plan.confidence && <ConfChip value={plan.confidence} />}
          <CopyButton
            text={buildPlanText(plan, bias, pair)}
            label="Copy full plan"
            variant="all"
          />
        </div>
      </div>

      <div className="divide-y divide-cyan-400/10 border-y border-cyan-400/15">
        {rows.map((r) => (
          <PlanRow key={r.type} type={r.type} label={r.label} value={r.value} />
        ))}
      </div>

      {plan.rr && total > 0 ? (
        <div className="pt-3">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full border border-cyan-400/15 bg-slate-950/40">
            <div
              className="bg-rose-400/75 shadow-[0_0_8px_rgba(248,113,113,0.5)]"
              style={{ width: `${riskPct}%` }}
            />
            <div
              className="bg-emerald-400/75 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
              style={{ width: `${rewardPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <span className="font-display text-[0.55rem] font-semibold tracking-[0.24em] uppercase text-rose-300/75">
              risk
            </span>
            <span className="font-mono text-[0.82rem] font-semibold tracking-wide text-amber-200">
              {plan.rr}
            </span>
            <span className="font-display text-[0.55rem] font-semibold tracking-[0.24em] uppercase text-emerald-300/75">
              reward
            </span>
          </div>
        </div>
      ) : (
        plan.rr && (
          <div className="flex items-baseline justify-between gap-3 pt-2.5">
            <span className="font-display text-[0.6rem] font-semibold tracking-[0.26em] uppercase text-cyan-200/65">
              R : R
            </span>
            <span className="font-mono text-[0.82rem] font-semibold tracking-wide text-amber-200">
              {plan.rr}
            </span>
          </div>
        )
      )}
    </div>
  )
}

function PlanRow({
  type,
  label,
  value,
}: {
  type: 'entry' | 'sl' | 'tp1' | 'tp2'
  label: string
  value: LevelValue
}) {
  const dotCls =
    type === 'sl'
      ? 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.65)]'
      : type === 'entry'
        ? 'bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
        : 'bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
  const labelCls =
    type === 'entry' ? 'text-cyan-100/90' : 'text-cyan-200/60'
  const priceCls =
    type === 'entry'
      ? 'text-amber-50 text-[1.02rem] sm:text-[1.08rem]'
      : 'text-amber-100/95 text-[0.92rem] sm:text-[0.96rem]'
  const diffTone =
    type === 'sl'
      ? 'text-rose-300/85'
      : type === 'entry'
        ? 'text-cyan-200/55'
        : 'text-emerald-300/85'
  const copyText = extractPriceForCopy(value.price)
  return (
    <div className="group flex items-center gap-3 py-2.5">
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotCls}`} />
      <span
        className={`flex-1 font-display text-[0.6rem] font-semibold tracking-[0.26em] uppercase ${labelCls}`}
      >
        {label}
      </span>
      <span className={`font-mono font-semibold leading-none ${priceCls}`}>
        {value.price || '—'}
      </span>
      {value.diff && (
        <span
          className={`shrink-0 font-mono text-[0.7rem] leading-none ${diffTone}`}
        >
          {value.diff}
        </span>
      )}
      {copyText && (
        <CopyButton text={copyText} label={`Copy ${label} (${copyText})`} />
      )}
    </div>
  )
}

function extractPriceForCopy(raw: string): string {
  const m = raw.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return m ? m[0] : ''
}

function buildPlanText(
  plan: PlanData,
  bias: BiasWord | null,
  pair: string | undefined,
): string {
  const lines: string[] = []

  const biasEmoji =
    bias === 'BULLISH' ? '📈' : bias === 'BEARISH' ? '📉' : '〰️'
  const headerParts: string[] = []
  if (pair) headerParts.push(pair)
  if (bias) headerParts.push(bias)
  if (headerParts.length > 0) {
    lines.push(`${biasEmoji} ${headerParts.join(' · ')}`)
    lines.push('')
  }

  if (plan.entry) {
    lines.push(
      `🎯 Entry: ${plan.entry.price}${plan.entry.diff ? ` (${plan.entry.diff})` : ''}`,
    )
  }
  if (plan.sl) {
    lines.push(
      `🛑 Stop: ${plan.sl.price}${plan.sl.diff ? ` (${plan.sl.diff})` : ''}`,
    )
  }
  if (plan.tp1) {
    lines.push(
      `✅ TP1: ${plan.tp1.price}${plan.tp1.diff ? ` (${plan.tp1.diff})` : ''}`,
    )
  }
  if (plan.tp2) {
    lines.push(
      `✅ TP2: ${plan.tp2.price}${plan.tp2.diff ? ` (${plan.tp2.diff})` : ''}`,
    )
  }
  if (plan.rr) lines.push(`⚖️ R:R: ${plan.rr}`)
  if (plan.confidence) {
    const c =
      plan.confidence === 'HIGH'
        ? '🟢'
        : plan.confidence === 'MEDIUM'
          ? '🟡'
          : '🔴'
    lines.push(`${c} Confidence: ${plan.confidence}`)
  }

  lines.push('')
  lines.push('— via Denaro')

  return lines.join('\n')
}

function CopyButton({
  text,
  label,
  variant = 'row',
}: {
  text: string
  label: string
  variant?: 'row' | 'all'
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard unavailable (insecure context, etc.) — silent fail
    }
  }

  const base =
    'inline-flex shrink-0 items-center justify-center rounded transition'
  const cls =
    variant === 'all'
      ? `${base} gap-1 border border-cyan-400/30 bg-cyan-500/[0.05] px-1.5 py-0.5 font-display text-[0.5rem] font-semibold tracking-[0.24em] uppercase ${
          copied
            ? 'border-emerald-400/55 text-emerald-200'
            : 'text-cyan-200/65 hover:border-cyan-300/55 hover:text-cyan-50'
        }`
      : `${base} h-5 w-5 ${
          copied ? 'text-emerald-300' : 'text-cyan-200/35 hover:text-cyan-100'
        }`

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={label}
      aria-label={label}
      className={cls}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      {variant === 'all' && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  )
}

function ClipboardIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function parsePriceNum(raw: string): number | null {
  const m = raw.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
  return m ? parseFloat(m[0]) : null
}

function ConfChip({ value }: { value: Confidence }) {
  const cls =
    value === 'HIGH'
      ? 'border-emerald-400/55 bg-emerald-500/15 text-emerald-200'
      : value === 'MEDIUM'
        ? 'border-cyan-400/55 bg-cyan-500/15 text-cyan-100'
        : 'border-rose-400/55 bg-rose-500/15 text-rose-200'
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 font-display text-[0.55rem] font-semibold tracking-[0.24em] uppercase ${cls}`}
    >
      <span className="text-[0.5rem] tracking-[0.28em] opacity-60">CONF</span>
      <span>{value}</span>
    </span>
  )
}

/* --- prose section renderers --- */

/** "4578.00 — 4H demand zone" → gold price + neutral dash + cyan body. */
function renderLevelLine(text: string): ReactNode {
  const m = text.match(/^([\d.,]+)\s*([—\-–:])\s*(.+)$/)
  if (m) {
    return (
      <>
        <span className="font-mono font-semibold text-amber-200">{m[1]}</span>
        <span className="mx-1.5 text-cyan-300/45">{m[2]}</span>
        <span>{renderInline(m[3])}</span>
      </>
    )
  }
  return renderInline(text)
}

/** "BEARISH. The prevailing..." → red/green/amber pill + body. */
function renderBiasLine(text: string): ReactNode {
  const m = text.match(/^(BULLISH|BEARISH|NEUTRAL|RANGE)\b[\s.:,—\-]*(.*)$/i)
  if (m) {
    const word = m[1].toUpperCase() as BiasWord
    return (
      <>
        <BiasPill word={word} />
        <span className="min-w-0 flex-1">{renderInline(m[2])}</span>
      </>
    )
  }
  return renderInline(text)
}

function BiasPill({ word }: { word: BiasWord }) {
  const cls =
    word === 'BULLISH'
      ? 'border-emerald-400/55 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(74,222,128,0.25)]'
      : word === 'BEARISH'
        ? 'border-rose-400/55 bg-rose-500/15 text-rose-200 shadow-[0_0_12px_rgba(248,113,113,0.25)]'
        : 'border-amber-300/55 bg-amber-400/15 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 font-display text-[0.6rem] font-bold uppercase tracking-[0.22em] ${cls}`}
    >
      {word}
    </span>
  )
}

/* --- inline tokens --- */

/** Inline parser — handles `**bold**` and price-shaped numbers. */
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*)|(\b\d{3,}(?:\.\d{1,4})?\b|\b\d+\.\d{2,4}\b)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    if (match[1]) {
      parts.push(
        <strong key={key++} className="font-semibold text-amber-200">
          {match[1].slice(2, -2)}
        </strong>,
      )
    } else if (match[2]) {
      parts.push(
        <span
          key={key++}
          className="font-mono font-semibold text-amber-200"
        >
          {match[2]}
        </span>,
      )
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}
