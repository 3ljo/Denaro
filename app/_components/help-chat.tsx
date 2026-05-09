'use client'

import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function HelpChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = (await res.json().catch(() => ({}))) as { reply?: string }
      const reply = data.reply || 'Sorry, something went wrong.'
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open help chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/40 bg-[rgba(5,8,16,0.92)] text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.25)] backdrop-blur transition hover:border-cyan-300/70 hover:text-cyan-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a8 8 0 0 1-11.6 7.13L4 20l1.12-4.18A8 8 0 1 1 21 12Z"
          />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,340px)] overflow-hidden rounded-md border border-cyan-400/30 bg-[rgba(5,8,16,0.95)] shadow-[0_0_30px_rgba(34,211,238,0.18)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-cyan-400/25 px-3 py-2">
        <span className="font-display text-[0.6rem] tracking-[0.28em] text-cyan-200/80">
          DENARO HELP
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Restart chat"
            onClick={() => setMessages([])}
            className="rounded p-1 text-cyan-300/70 hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h5M20 20v-5h-5M5 9a8 8 0 0 1 14-1M19 15a8 8 0 0 1-14 1"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Close help chat"
            onClick={() => setOpen(false)}
            className="rounded p-1 text-cyan-300/70 hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[55vh] min-h-[180px] overflow-y-auto px-3 py-2 text-[0.78rem]"
      >
        {messages.length === 0 ? (
          <p className="py-4 text-center text-cyan-100/50">
            Ask me anything about Denaro.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-md bg-cyan-400/10 px-2.5 py-1.5 text-cyan-50'
                    : 'mr-auto max-w-[85%] rounded-md bg-white/5 px-2.5 py-1.5 text-cyan-100/85'
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto max-w-[85%] rounded-md bg-white/5 px-2.5 py-1.5 text-cyan-100/60">
                ...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-cyan-400/25 px-2 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type your question..."
          disabled={loading}
          className="flex-1 rounded bg-transparent px-2 py-1 text-[0.78rem] text-cyan-50 placeholder:text-cyan-100/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="rounded border border-amber-300/60 bg-amber-300/10 px-2.5 py-1 font-display text-[0.6rem] tracking-[0.2em] text-amber-200 hover:bg-amber-300/20 disabled:opacity-40"
        >
          SEND
        </button>
      </div>
    </div>
  )
}
