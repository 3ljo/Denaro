'use client'

import type { ReactNode } from 'react'

/**
 * Renders the streaming markdown-light output from /api/denaro/vision into
 * proper sections. Looks for **Header** lines as section breaks, parses
 * `- bullet` lines into lists, and renders **bold** inline as gold spans.
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

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string }

function splitBlocks(text: string): Block[] {
  // Group consecutive non-empty lines into "sections", split on blank lines.
  const sections = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  const out: Block[] = []
  for (const section of sections) {
    const lines = section.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) continue

    // A section that's a single bold-wrapped line → heading
    if (lines.length === 1 && /^\*\*.+\*\*$/.test(lines[0])) {
      out.push({ kind: 'heading', text: lines[0].replace(/^\*\*|\*\*$/g, '') })
      continue
    }

    // A section where every line starts with "- " or "* " → list
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      out.push({
        kind: 'list',
        items: lines.map((l) => l.replace(/^[-*]\s+/, '')),
      })
      continue
    }

    // Mixed: maybe header on first line followed by paragraph.
    if (/^\*\*.+\*\*$/.test(lines[0]) && lines.length > 1) {
      out.push({ kind: 'heading', text: lines[0].replace(/^\*\*|\*\*$/g, '') })
      const rest = lines.slice(1)
      if (rest.every((l) => /^[-*]\s+/.test(l))) {
        out.push({
          kind: 'list',
          items: rest.map((l) => l.replace(/^[-*]\s+/, '')),
        })
      } else {
        out.push({ kind: 'paragraph', text: rest.join(' ') })
      }
      continue
    }

    out.push({ kind: 'paragraph', text: lines.join(' ') })
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
    return (
      <ul className="space-y-1">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[0.82rem] leading-snug text-cyan-50"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-300/70" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <p className="text-[0.82rem] leading-relaxed text-cyan-50">
      {renderInline(block.text)}
    </p>
  )
}

/** Render `**bold**` inline. Anything else stays plain text. */
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = []
  const regex = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <strong key={key++} className="font-semibold text-amber-200">
        {match[1]}
      </strong>,
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}
