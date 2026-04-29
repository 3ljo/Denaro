'use client'

import type { ReactNode } from 'react'

/**
 * Renders the streaming markdown-light output from /api/denaro/vision into
 * proper sections.
 *
 * Section-aware highlighting:
 * - **Key Levels** list items have their leading price wrapped in a gold span
 *   ("4578.00 — 4H demand zone" → 4578.00 is gold, rest is cyan).
 * - **Bias** paragraph: leading BULLISH / BEARISH / NEUTRAL becomes a colored
 *   pill (emerald / rose / amber).
 * - Inline `**bold**` → amber. Numbers that look like prices (3+ digits or
 *   2+ decimals) → gold mono.
 */
export default function FormattedAnalysis({ text }: { text: string }) {
  const blocks = splitBlocks(text)
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

type Section = 'bias' | 'levels' | 'other'

type Block =
  | { kind: 'heading'; text: string; section: Section }
  | { kind: 'list'; items: string[]; section: Section }
  | { kind: 'paragraph'; text: string; section: Section }

function classify(heading: string): Section {
  const h = heading.toLowerCase()
  if (h === 'bias' || h.startsWith('bias ')) return 'bias'
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

    // Single-line heading
    if (lines.length === 1 && /^\*\*.+\*\*$/.test(lines[0])) {
      const headText = lines[0].replace(/^\*\*|\*\*$/g, '')
      current = classify(headText)
      out.push({ kind: 'heading', text: headText, section: current })
      continue
    }

    // All-bullets list
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      out.push({
        kind: 'list',
        items: lines.map((l) => l.replace(/^[-*]\s+/, '')),
        section: current,
      })
      continue
    }

    // Heading on first line + body following
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
  // paragraph
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

/* --- section renderers --- */

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
    const word = m[1].toUpperCase() as
      | 'BULLISH'
      | 'BEARISH'
      | 'NEUTRAL'
      | 'RANGE'
    return (
      <>
        <BiasPill word={word} />
        <span className="min-w-0 flex-1">{renderInline(m[2])}</span>
      </>
    )
  }
  return renderInline(text)
}

function BiasPill({
  word,
}: {
  word: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'RANGE'
}) {
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
  // bold OR (3+ digit number with optional decimals) OR (any number with 2+ decimals)
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
