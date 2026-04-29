'use client'

import { useEffect, useState } from 'react'

/**
 * Forex session windows in UTC. The Sydney session wraps midnight, so it
 * needs the wraparound branch in isActive().
 */
const SESSIONS = [
  { short: 'SYDNEY',  open: 22, close: 7 },
  { short: 'TOKYO',   open: 0,  close: 9 },
  { short: 'LONDON',  open: 8,  close: 17 },
  { short: 'NEW YORK', open: 13, close: 22 },
] as const

function isActive(s: (typeof SESSIONS)[number], hour: number) {
  return s.open < s.close
    ? hour >= s.open && hour < s.close
    : hour >= s.open || hour < s.close
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function SessionBar() {
  // Avoid SSR/CSR mismatch — render times only after mount.
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const utcHour = now?.getUTCHours() ?? 0
  const utcStr = now
    ? `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`
    : '—'
  const localStr = now
    ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  const active = SESSIONS.filter((s) => isActive(s, utcHour))
  const overlap = active.length > 1

  return (
    <div className="denaro-panel relative flex items-center gap-3 overflow-x-auto rounded-md px-3 py-2">
      <span className="denaro-pill shrink-0 text-[0.55rem]">
        <span className="denaro-dot" />
        {overlap ? 'OVERLAP' : 'SESSION'}
      </span>

      <div className="flex shrink-0 gap-1">
        {SESSIONS.map((s) => {
          const on = now ? isActive(s, utcHour) : false
          return (
            <span
              key={s.short}
              className={`rounded border px-1.5 py-0.5 font-display text-[0.55rem] tracking-[0.18em] transition ${
                on
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(74,222,128,0.35)]'
                  : 'border-cyan-400/15 bg-transparent text-cyan-200/35'
              }`}
            >
              {s.short}
            </span>
          )
        })}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 font-mono text-[0.7rem]">
        <span className="text-cyan-100/70">
          <span className="mr-1 font-display tracking-[0.2em] text-cyan-300/55">UTC</span>
          {utcStr}
        </span>
        <span className="hidden text-cyan-100/70 sm:inline">
          <span className="mr-1 font-display tracking-[0.2em] text-cyan-300/55">LOCAL</span>
          {localStr}
        </span>
      </div>
    </div>
  )
}
