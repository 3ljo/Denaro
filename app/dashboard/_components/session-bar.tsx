'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

/** Forex session windows in UTC. Sydney wraps midnight. */
const SESSIONS = [
  { key: 'sydney',  open: 22, close: 7 },
  { key: 'tokyo',   open: 0,  close: 9 },
  { key: 'london',  open: 8,  close: 17 },
  { key: 'newYork', open: 13, close: 22 },
] as const

function isActive(s: (typeof SESSIONS)[number], hour: number) {
  return s.open < s.close
    ? hour >= s.open && hour < s.close
    : hour >= s.open || hour < s.close
}

/** Compact clock + only the currently-open trading session(s). */
export default function SessionBar() {
  const t = useTranslations('dashboard.session')
  // Avoid SSR/CSR mismatch — render times only after mount.
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const localStr = now
    ? now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—'

  return (
    <div className="denaro-panel flex flex-wrap items-center gap-3 rounded-md px-3 py-2">
      {/* Section label — tells users what this row is for. */}
      <span
        className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80"
        title={t('hint')}
      >
        {t('label')}
      </span>

      {/* All four sessions — active in emerald, inactive dimmed so the user
          can see at a glance which markets are open right now. */}
      <div className="flex flex-wrap items-center gap-1">
        {SESSIONS.map((s) => {
          const on = now ? isActive(s, now.getUTCHours()) : false
          return (
            <span
              key={s.key}
              title={on ? t('open') : t('closed')}
              className={`rounded border px-1.5 py-0.5 font-display text-[0.55rem] tracking-[0.18em] transition ${
                on
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(74,222,128,0.35)]'
                  : 'border-cyan-400/15 bg-transparent text-cyan-200/35'
              }`}
            >
              {t(`sessions.${s.key}`)}
            </span>
          )
        })}
      </div>

      {/* Local time — pushed to the right on wider screens. */}
      <span className="ml-auto flex items-baseline gap-1.5 font-mono text-[0.75rem] text-cyan-100/80">
        <span className="font-display text-[0.55rem] tracking-[0.22em] text-cyan-300/60">
          {t('local')}
        </span>
        {localStr}
      </span>
    </div>
  )
}
