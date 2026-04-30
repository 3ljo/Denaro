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
    <div className="denaro-panel rounded-md px-3 py-2.5 sm:px-4 sm:py-3">
      {/* Header row — section label on the left, live local clock on the
          right. Always sits on one line so the layout reads cleanly even on
          narrow phones. */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="font-display text-[0.55rem] tracking-[0.28em] text-amber-300/80 sm:text-[0.6rem] sm:tracking-[0.32em]"
          title={t('hint')}
        >
          {t('label')}
        </span>
        <span className="flex items-baseline gap-1.5 font-mono text-[0.78rem] tabular-nums text-cyan-100/90 sm:text-[0.85rem]">
          <span className="font-display text-[0.5rem] tracking-[0.22em] text-cyan-300/60 sm:text-[0.55rem]">
            {t('local')}
          </span>
          {localStr}
        </span>
      </div>

      {/* Sessions — fixed 4-column grid so the pills size evenly on every
          viewport instead of wrapping awkwardly. Active sessions glow
          emerald, inactive ones stay dim so the open markets pop. */}
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {SESSIONS.map((s) => {
          const on = now ? isActive(s, now.getUTCHours()) : false
          return (
            <span
              key={s.key}
              title={on ? t('open') : t('closed')}
              className={`flex items-center justify-center gap-1 rounded border px-1 py-1 text-center font-display text-[0.55rem] tracking-[0.16em] transition sm:text-[0.6rem] sm:tracking-[0.2em] ${
                on
                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(74,222,128,0.35)]'
                  : 'border-cyan-400/20 bg-cyan-500/[0.03] text-cyan-200/45'
              }`}
            >
              {on && (
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]"
                />
              )}
              <span className="truncate">{t(`sessions.${s.key}`)}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
