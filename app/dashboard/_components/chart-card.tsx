'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import TradingViewChart from './tradingview-chart'

export default function ChartCard({ pair }: { pair: string }) {
  const t = useTranslations('dashboard.chartCard')
  const [maximized, setMaximized] = useState(false)

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!maximized) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMaximized(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [maximized])

  return (
    <>
      <div className="denaro-panel relative flex flex-col gap-3 rounded-md p-4">
        <header className="flex items-center justify-between gap-3">
          <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
            {t('badge')}
          </p>
          <button
            type="button"
            onClick={() => setMaximized(true)}
            aria-label={t('maximize')}
            title={t('maximize')}
            className="inline-flex items-center gap-1 rounded border border-cyan-400/30 bg-cyan-500/[0.06] px-2 py-1 font-display text-[0.55rem] tracking-[0.22em] text-cyan-100/80 transition hover:border-amber-300/60 hover:bg-amber-400/15 hover:text-amber-100"
          >
            <MaximizeIcon />
            <span className="hidden sm:inline">{t('maximize')}</span>
          </button>
        </header>

        <TradingViewChart symbol={pair} />
      </div>

      {maximized && (
        <MaximizedChartModal pair={pair} onClose={() => setMaximized(false)} />
      )}
    </>
  )
}

function MaximizedChartModal({
  pair,
  onClose,
}: {
  pair: string
  onClose: () => void
}) {
  const t = useTranslations('dashboard.chartCard')
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('fullscreenLabel', { pair })}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop — click to close. */}
      <button
        type="button"
        onClick={onClose}
        aria-label={t('close')}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal card — centered popup over the dashboard. */}
      <div className="denaro-panel relative z-10 flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-md shadow-[0_25px_80px_rgba(0,0,0,0.7)]">
        <header className="flex items-center justify-between gap-3 border-b border-cyan-400/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/80">
              {t('badge')}
            </p>
            <h2 className="font-display text-base font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-lg sm:tracking-[0.2em]">
              {pair}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            title={t('close')}
            className="inline-flex items-center gap-1.5 rounded border border-cyan-400/30 bg-cyan-500/[0.06] px-2.5 py-1.5 font-display text-[0.6rem] tracking-[0.22em] text-cyan-100/85 transition hover:border-rose-400/60 hover:bg-rose-500/15 hover:text-rose-100"
          >
            <CloseIcon />
            <span>{t('close')}</span>
          </button>
        </header>

        {/* Chart fills the rest of the modal. */}
        <div className="relative flex-1">
          <TradingViewChart symbol={pair} fill />
        </div>
      </div>
    </div>
  )
}

function MaximizeIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
