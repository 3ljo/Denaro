'use client'

import { useEffect, useRef, useState } from 'react'
import { QUICK_PROMPTS } from '@/lib/denaro/quick-prompts'

type Message = { role: 'user' | 'assistant'; content: string }

export default function DenaroChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim()
    if (!text || isStreaming) return

    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages([...next, { role: 'assistant', content: '' }])
    setInput('')
    setIsStreaming(true)

    try {
      const res = await fetch('/api/denaro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => 'request failed')
        setMessages([
          ...next,
          { role: 'assistant', content: `// signal lost — ${errText}` },
        ])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages([...next, { role: 'assistant', content: acc }])
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error'
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `// signal lost — ${msg}` },
      ])
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  function loadQuickPrompt(idx: number) {
    setInput(QUICK_PROMPTS[idx].build())
    inputRef.current?.focus()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Quick prompts */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => loadQuickPrompt(i)}
            className="denaro-btn-ghost"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="denaro-panel flex-1 overflow-y-auto rounded-md p-3 sm:p-4"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <Bubble
                key={i}
                role={m.role}
                content={m.content}
                streaming={
                  isStreaming &&
                  m.role === 'assistant' &&
                  i === messages.length - 1
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
        className="flex items-end gap-2"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask Denaro... (Shift+Enter for newline)"
          disabled={isStreaming}
          rows={2}
          className="denaro-input min-h-[2.5rem] flex-1 resize-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="denaro-btn w-auto whitespace-nowrap px-4 sm:px-5"
        >
          {isStreaming ? '···' : 'Send'}
        </button>
      </form>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[18rem] flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="font-display text-[0.6rem] tracking-[0.4em] text-amber-300/80">
        // CHANNEL OPEN
      </p>
      <p className="font-display text-base font-bold uppercase tracking-[0.18em] text-cyan-50">
        Denaro is online
      </p>
      <p className="max-w-sm text-[0.78rem] leading-relaxed text-cyan-100/55">
        Ask about a market, paste a trade CSV, or pick a quick prompt above to drop a scaffold into the input.
      </p>
    </div>
  )
}

function Bubble({
  role,
  content,
  streaming,
}: {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-md border border-amber-300/30 bg-amber-500/10 px-3.5 py-2.5 text-[0.85rem] leading-relaxed text-amber-50 backdrop-blur-sm">
          {content}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-500/10 font-display text-[0.65rem] font-bold tracking-wider text-cyan-200">
        D
      </div>
      <div className="max-w-[85%] whitespace-pre-wrap rounded-md border border-cyan-400/30 bg-cyan-500/[0.07] px-3.5 py-2.5 text-[0.85rem] leading-relaxed text-cyan-50 backdrop-blur-sm">
        {content || (streaming ? '' : ' ')}
        {streaming && (
          <span className="ml-1 inline-block h-3 w-1.5 translate-y-[2px] animate-pulse bg-cyan-300" />
        )}
      </div>
    </div>
  )
}
