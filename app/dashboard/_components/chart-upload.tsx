'use client'

import { useRef, useState } from 'react'

const MAX_FILES = 3

export default function ChartUpload() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [note, setNote] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []).slice(0, MAX_FILES)
    setFiles(list)
    setError(null)
  }

  function removeAt(i: number) {
    setFiles((curr) => curr.filter((_, idx) => idx !== i))
  }

  async function analyze() {
    if (files.length === 0 || loading) return
    setLoading(true)
    setError(null)
    setOutput('')

    const fd = new FormData()
    files.forEach((f) => fd.append('charts', f))
    if (note.trim()) fd.append('note', note.trim())

    try {
      const res = await fetch('/api/denaro/vision', {
        method: 'POST',
        body: fd,
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

  return (
    <section className="denaro-panel space-y-3 rounded-md p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            // VISION
          </p>
          <h3 className="font-display text-base font-bold uppercase tracking-[0.16em] text-cyan-50">
            Chart Read
          </h3>
        </div>
        <span className="text-[0.62rem] tracking-wide text-cyan-200/50">
          Up to {MAX_FILES} screenshots — order HTF → LTF
        </span>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        multiple
        onChange={onPick}
        className="hidden"
      />

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded border border-cyan-400/30 bg-cyan-500/[0.05] px-2 py-1 text-[0.7rem] text-cyan-100/85"
            >
              <span className="font-mono">{f.name}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="font-display text-[0.65rem] text-rose-300/80 hover:text-rose-200"
                aria-label="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Optional note (e.g. 'XAUUSD 4H/1H/15M, watching liquidity sweep')"
        className="denaro-input resize-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="denaro-btn-ghost"
          disabled={loading}
        >
          {files.length > 0 ? 'Change images' : 'Pick screenshots'}
        </button>
        <button
          type="button"
          onClick={analyze}
          disabled={loading || files.length === 0}
          className="denaro-btn w-auto px-4"
        >
          {loading ? 'Reading…' : 'Analyze'}
        </button>
      </div>

      {error && (
        <p className="text-[0.7rem] text-rose-300/90">// {error}</p>
      )}
      {output && (
        <div className="whitespace-pre-wrap rounded border border-cyan-400/25 bg-cyan-500/[0.05] p-3 text-[0.82rem] leading-relaxed text-cyan-50">
          {output}
        </div>
      )}
    </section>
  )
}
