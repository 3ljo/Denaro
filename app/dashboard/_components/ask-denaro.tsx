'use client'

import { useState } from 'react'

export default function AskDenaro() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <header>
        <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
          // CHANNEL
        </p>
        <h3 className="font-display text-base font-bold uppercase tracking-[0.16em] text-cyan-50">
          Ask Denaro
        </h3>
      </header>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        rows={2}
        placeholder="Quick question for Denaro... (Shift+Enter for newline)"
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
      {output && (
        <div className="whitespace-pre-wrap rounded border border-cyan-400/25 bg-cyan-500/[0.05] p-3 text-[0.82rem] leading-relaxed text-cyan-50">
          {output}
        </div>
      )}
    </section>
  )
}
