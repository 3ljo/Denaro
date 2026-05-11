'use client'

import { useEffect, useRef, useState } from 'react'

export const BG_MODES = [
  { id: 'cosmos', value: '#050810', label: 'Cosmos' },
  { id: 'deep-navy', value: '#0a1424', label: 'Deep navy' },
  { id: 'navy', value: '#0d1a2e', label: 'Navy' },
  { id: 'twilight', value: '#142844', label: 'Twilight' },
  { id: 'slate', value: '#1f3a5e', label: 'Slate' },
  { id: 'dusk', value: '#4a648c', label: 'Dusk' },
] as const

type ModeId = (typeof BG_MODES)[number]['id']

export const BG_STORAGE_KEY = 'denaro-bg'
const DEFAULT: ModeId = 'navy'

export default function BgToggle() {
  const [active, setActive] = useState<ModeId>(DEFAULT)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BG_STORAGE_KEY) as ModeId | null
      if (saved && BG_MODES.some((m) => m.id === saved)) setActive(saved)
    } catch {}
  }, [])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(id: ModeId) {
    const mode = BG_MODES.find((m) => m.id === id)
    if (!mode) return
    setActive(id)
    setOpen(false)
    document.documentElement.style.setProperty('--dash-bg', mode.value)
    try {
      localStorage.setItem(BG_STORAGE_KEY, id)
    } catch {}
  }

  const activeMode = BG_MODES.find((m) => m.id === active) ?? BG_MODES[2]

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Background brightness — ${activeMode.label}`}
        title={`Background — ${activeMode.label}`}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-cyan-500/[0.04] px-2 py-1.5 transition ${
          open
            ? 'border-amber-300/60 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
            : 'border-cyan-400/25 hover:border-cyan-300/55 hover:bg-cyan-500/[0.08]'
        }`}
      >
        <span
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 rounded-sm border border-cyan-400/40"
          style={{ backgroundColor: activeMode.value }}
        />
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
          className={`text-cyan-100/70 transition ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M2.5 4.5l3.5 3 3.5-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Background brightness"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-md border border-cyan-400/25 bg-denaro-bg/95 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.55)] backdrop-blur-lg"
        >
          {BG_MODES.map((m, i) => {
            const on = m.id === active
            return (
              <li key={m.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => pick(m.id)}
                  className={`flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left transition ${
                    on
                      ? 'bg-amber-400/15 text-amber-100'
                      : 'text-cyan-100/85 hover:bg-cyan-500/10 hover:text-cyan-50'
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 shrink-0 rounded-sm border border-cyan-400/40"
                    style={{ backgroundColor: m.value }}
                  />
                  <span className="flex-1 font-display text-[0.7rem] tracking-[0.18em]">
                    {m.label}
                  </span>
                  <span className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-200/45">
                    {i + 1}
                  </span>
                  {on && (
                    <span className="font-display text-[0.55rem] tracking-[0.2em] text-amber-300">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
