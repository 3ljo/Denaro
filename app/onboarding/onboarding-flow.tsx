'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import {
  POPULAR_PAIRS,
  STRATEGIES,
  STRATEGY_BLURB,
  STRATEGY_LABEL,
  type Strategy,
} from '@/lib/profile/types'
import { saveOnboarding } from '@/lib/profile/actions'

type Step = 'welcome' | 'pairs' | 'strategy' | 'name'
const STEPS: Step[] = ['welcome', 'pairs', 'strategy', 'name']

export default function OnboardingFlow({
  defaultName,
  email,
}: {
  defaultName: string
  email: string
}) {
  const [step, setStep] = useState<Step>('welcome')
  const [pairs, setPairs] = useState<string[]>([])
  const [strategy, setStrategy] = useState<Strategy>('smc')
  const [name, setName] = useState(defaultName)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function togglePair(symbol: string) {
    setPairs((curr) => {
      if (curr.includes(symbol)) return curr.filter((s) => s !== symbol)
      if (curr.length >= 3) return curr
      return [...curr, symbol]
    })
  }

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await saveOnboarding({
        pairs,
        strategy,
        displayName: name,
      })
      if (result?.error) setError(result.error)
    })
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-denaro-bg safe-top safe-bottom">
      {/* Cosmic backdrop only — no character behind the form */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-60" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-1/4 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute -bottom-1/4 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Stage: side-by-side on lg+, stacked on mobile */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 py-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-10">
        {/* Character standing alongside the calibration */}
        <div className="relative flex w-full justify-center lg:flex-1">
          <div className="relative h-[28vh] w-full max-w-[260px] sm:h-[36vh] sm:max-w-[320px] lg:h-[78vh] lg:max-w-[460px]">
            <Image
              src="/pic/denaro.png"
              alt="Denaro"
              fill
              priority
              sizes="(min-width: 1024px) 460px, (min-width: 640px) 320px, 260px"
              className="object-contain object-bottom drop-shadow-[0_0_50px_rgba(34,211,238,0.3)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-[55%] -translate-x-1/2 rounded-full bg-cyan-400/30 blur-2xl animate-glowPulse lg:h-24 lg:w-[260px]"
            />
          </div>
        </div>

        {/* Form panel */}
        <div className="w-full max-w-md lg:max-w-md lg:flex-1">
          <div className="denaro-panel relative w-full overflow-hidden rounded-md">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-cyan-400/25 px-3 py-1.5 text-[0.55rem]">
            <span className="denaro-pill text-[0.55rem]">
              <span className="denaro-dot" />
              Denaro.OS
            </span>
            <span className="font-display tracking-[0.28em] text-cyan-200/70">
              CALIBRATION&nbsp;{stepIndex + 1}/{STEPS.length}
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 border-b border-cyan-400/15 px-3 py-2">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-1 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-6 bg-amber-300'
                    : i < stepIndex
                      ? 'w-3 bg-cyan-300/70'
                      : 'w-3 bg-cyan-400/20'
                }`}
              />
            ))}
          </div>

          <div className="px-4 py-5 sm:px-5 sm:py-6">
            {step === 'welcome' && (
              <Welcome
                email={email}
                onContinue={() => setStep('pairs')}
              />
            )}
            {step === 'pairs' && (
              <Pairs
                pairs={pairs}
                togglePair={togglePair}
                onBack={() => setStep('welcome')}
                onContinue={() => setStep('strategy')}
              />
            )}
            {step === 'strategy' && (
              <StrategyPick
                strategy={strategy}
                setStrategy={setStrategy}
                onBack={() => setStep('pairs')}
                onContinue={() => setStep('name')}
              />
            )}
            {step === 'name' && (
              <NamePick
                name={name}
                setName={setName}
                isPending={isPending}
                error={error}
                onBack={() => setStep('strategy')}
                onSubmit={submit}
              />
            )}
          </div>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ----- Steps ----- */

function Welcome({ email, onContinue }: { email: string; onContinue: () => void }) {
  return (
    <div>
      <p className="font-display text-[0.55rem] tracking-[0.4em] text-amber-300/90">
        // OPERATOR ▸ IDENTIFIED
      </p>
      <h1 className="mt-2 font-display text-xl font-bold uppercase leading-tight tracking-[0.16em] text-cyan-50 sm:text-2xl">
        Welcome to the Grid
      </h1>
      <p className="mt-2 break-all text-[0.7rem] tracking-wide text-cyan-100/55">
        {email}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-cyan-100/75">
        Denaro is your AI trading analyst. To tune the system to your style, answer 3 quick questions — your top pairs, your strategy lens, and what to call you.
      </p>
      <p className="mt-3 text-[0.7rem] leading-relaxed text-cyan-100/45">
        Takes about 30 seconds. Settings are editable later.
      </p>
      <div className="mt-6">
        <button onClick={onContinue} className="denaro-btn">
          Begin Calibration
        </button>
      </div>
    </div>
  )
}

function Pairs({
  pairs,
  togglePair,
  onBack,
  onContinue,
}: {
  pairs: string[]
  togglePair: (s: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div>
      <p className="font-display text-[0.55rem] tracking-[0.4em] text-amber-300/90">
        // STEP 01 ▸ MARKETS
      </p>
      <h1 className="mt-2 font-display text-lg font-bold uppercase leading-tight tracking-[0.16em] text-cyan-50 sm:text-xl">
        Pick your top 3 pairs
      </h1>
      <p className="mt-1 text-[0.75rem] leading-snug text-cyan-100/55">
        Denaro will tune analysis to these markets.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {POPULAR_PAIRS.map((p) => {
          const selected = pairs.includes(p.symbol)
          return (
            <button
              key={p.symbol}
              type="button"
              onClick={() => togglePair(p.symbol)}
              className={`rounded border px-2.5 py-1.5 font-display text-[0.65rem] tracking-[0.18em] transition ${
                selected
                  ? 'border-amber-300/80 bg-amber-400/15 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.35)]'
                  : 'border-cyan-400/30 bg-cyan-500/[0.04] text-cyan-100/80 hover:border-cyan-300/50 hover:bg-cyan-500/10'
              }`}
            >
              {selected && <span className="mr-1 text-amber-300">✓</span>}
              {p.symbol}
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-[0.65rem] tracking-wide text-cyan-100/45">
        {pairs.length}/3 selected
      </p>

      <div className="mt-5 flex gap-2">
        <button onClick={onBack} className="denaro-btn-ghost flex-1">
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={pairs.length === 0}
          className="denaro-btn flex-[2]"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function StrategyPick({
  strategy,
  setStrategy,
  onBack,
  onContinue,
}: {
  strategy: Strategy
  setStrategy: (s: Strategy) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div>
      <p className="font-display text-[0.55rem] tracking-[0.4em] text-amber-300/90">
        // STEP 02 ▸ LENS
      </p>
      <h1 className="mt-2 font-display text-lg font-bold uppercase leading-tight tracking-[0.16em] text-cyan-50 sm:text-xl">
        Pick your strategy
      </h1>
      <p className="mt-1 text-[0.75rem] leading-snug text-cyan-100/55">
        Denaro will use this lens for every analysis.
      </p>

      <div className="mt-4 space-y-2">
        {STRATEGIES.map((s) => {
          const selected = strategy === s
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStrategy(s)}
              className={`block w-full rounded-md border px-3 py-2.5 text-left transition ${
                selected
                  ? 'border-amber-300/80 bg-amber-400/10 shadow-[0_0_22px_rgba(251,191,36,0.25)]'
                  : 'border-cyan-400/25 bg-cyan-500/[0.04] hover:border-cyan-300/50 hover:bg-cyan-500/[0.07]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[0.78rem] font-bold uppercase tracking-[0.16em] text-cyan-50">
                  {STRATEGY_LABEL[s]}
                </span>
                {selected && (
                  <span className="font-display text-[0.55rem] tracking-[0.25em] text-amber-300">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="mt-1 text-[0.7rem] leading-snug text-cyan-100/60">
                {STRATEGY_BLURB[s]}
              </p>
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex gap-2">
        <button onClick={onBack} className="denaro-btn-ghost flex-1">
          Back
        </button>
        <button onClick={onContinue} className="denaro-btn flex-[2]">
          Continue
        </button>
      </div>
    </div>
  )
}

function NamePick({
  name,
  setName,
  isPending,
  error,
  onBack,
  onSubmit,
}: {
  name: string
  setName: (s: string) => void
  isPending: boolean
  error: string | null
  onBack: () => void
  onSubmit: () => void
}) {
  return (
    <div>
      <p className="font-display text-[0.55rem] tracking-[0.4em] text-amber-300/90">
        // STEP 03 ▸ HANDLE
      </p>
      <h1 className="mt-2 font-display text-lg font-bold uppercase leading-tight tracking-[0.16em] text-cyan-50 sm:text-xl">
        What should Denaro call you?
      </h1>
      <p className="mt-1 text-[0.75rem] leading-snug text-cyan-100/55">
        Optional. Defaults to your email handle.
      </p>

      <div className="mt-4">
        <label className="denaro-label">Display name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Operator"
          maxLength={40}
          className="denaro-input"
        />
      </div>

      {error && (
        <div className="denaro-banner denaro-banner-error mt-4">{error}</div>
      )}

      <div className="mt-5 flex gap-2">
        <button onClick={onBack} className="denaro-btn-ghost flex-1" disabled={isPending}>
          Back
        </button>
        <button onClick={onSubmit} className="denaro-btn flex-[2]" disabled={isPending}>
          {isPending ? 'Engaging…' : 'Enter the Grid'}
        </button>
      </div>
    </div>
  )
}
