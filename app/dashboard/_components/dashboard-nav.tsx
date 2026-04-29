'use client'

import type { ReactNode, SVGProps } from 'react'

export type TabId = 'markets' | 'news' | 'vision' | 'channel'

export type Tab = { id: TabId; label: string; icon: ReactNode }

const baseIcon: SVGProps<SVGSVGElement> = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const DASHBOARD_TABS: Tab[] = [
  {
    id: 'markets',
    label: 'Markets',
    icon: (
      <svg {...baseIcon}>
        <rect x="4" y="13" width="3.5" height="7" />
        <rect x="10.25" y="8" width="3.5" height="12" />
        <rect x="16.5" y="11" width="3.5" height="9" />
        <line x1="3" y1="20" x2="21" y2="20" />
      </svg>
    ),
  },
  {
    id: 'news',
    label: 'News',
    icon: (
      <svg {...baseIcon}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
      </svg>
    ),
  },
  {
    id: 'vision',
    label: 'Vision',
    icon: (
      <svg {...baseIcon}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'channel',
    label: 'Ask',
    icon: (
      <svg {...baseIcon}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

type Props = {
  active: TabId
  onSelect: (id: TabId) => void
}

/** Top horizontal tab bar — desktop only (≥ lg). */
export function DesktopTabBar({ active, onSelect }: Props) {
  return (
    <nav aria-label="Dashboard sections" className="hidden lg:block">
      <div className="denaro-panel rounded-md p-1">
        <div className="flex gap-1">
          {DASHBOARD_TABS.map((tab) => {
            const on = active === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={on ? 'page' : undefined}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 font-display text-[0.7rem] uppercase tracking-[0.22em] transition ${
                  on
                    ? 'bg-amber-400/15 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.2)]'
                    : 'text-cyan-200/65 hover:bg-cyan-500/10 hover:text-cyan-100'
                }`}
              >
                {tab.icon}
                {tab.label}
                {on && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

/** Fixed bottom navbar — mobile + tablet (< lg). */
export function MobileBottomNav({ active, onSelect }: Props) {
  return (
    <nav
      aria-label="Dashboard sections"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
    >
      {/* hairline glow on top edge */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
      <div className="border-t border-cyan-400/25 bg-denaro-bg/90 backdrop-blur-lg safe-bottom shadow-[0_-12px_36px_rgba(0,0,0,0.55)]">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {DASHBOARD_TABS.map((tab) => {
            const on = active === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={on ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 px-1 py-2.5 font-display text-[0.55rem] tracking-[0.2em] uppercase transition ${
                  on ? 'text-amber-100' : 'text-cyan-200/55 active:text-cyan-100'
                }`}
              >
                <span className="relative">
                  {tab.icon}
                  {on && (
                    <span
                      aria-hidden
                      className="absolute -inset-2.5 -z-10 rounded-full bg-amber-400/25 blur-lg"
                    />
                  )}
                </span>
                <span>{tab.label}</span>
                {on && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 top-0 h-[2px] rounded-b bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
