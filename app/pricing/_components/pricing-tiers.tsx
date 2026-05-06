'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

type Cycle = 'monthly' | 'yearly'

const TIERS = [
  {
    key: 'free' as const,
    monthly: 0,
    yearly: 0,
    accent: 'cyan',
    cta: '/register',
  },
  {
    key: 'pro' as const,
    monthly: 19,
    yearly: 15, // displayed monthly when annualized
    accent: 'gold',
    popular: true,
    cta: '/register?plan=pro',
  },
  {
    key: 'elite' as const,
    monthly: 49,
    yearly: 39,
    accent: 'cyan',
    cta: '/register?plan=elite',
  },
]

export default function PricingTiers({ isAuthed }: { isAuthed: boolean }) {
  const t = useTranslations('marketing.pricing')
  const [cycle, setCycle] = useState<Cycle>('yearly')

  return (
    <div className="space-y-10">
      {/* Billing toggle */}
      <div className="flex flex-col items-center gap-2">
        <div
          role="tablist"
          aria-label="Billing cycle"
          className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/[0.05] p-1"
        >
          <CycleBtn
            active={cycle === 'monthly'}
            onClick={() => setCycle('monthly')}
          >
            {t('billing.monthly')}
          </CycleBtn>
          <CycleBtn
            active={cycle === 'yearly'}
            onClick={() => setCycle('yearly')}
          >
            <span className="flex items-center gap-2">
              {t('billing.yearly')}
              <span className="rounded-full border border-amber-300/50 bg-amber-400/15 px-1.5 py-px font-display text-[0.5rem] tracking-[0.18em] text-amber-200">
                {t('billing.save')}
              </span>
            </span>
          </CycleBtn>
        </div>
      </div>

      {/* Tiers */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        {TIERS.map((tier) => {
          const popular = tier.popular
          const price = cycle === 'monthly' ? tier.monthly : tier.yearly
          const features = t.raw(`tiers.${tier.key}.features`) as string[]
          const ctaHref = isAuthed ? '/dashboard' : tier.cta
          return (
            <article
              key={tier.key}
              className={[
                'relative flex flex-col overflow-hidden rounded-md border p-6 backdrop-blur-md transition',
                popular
                  ? 'border-amber-300/55 bg-gradient-to-b from-amber-400/[0.07] via-cyan-500/[0.04] to-amber-400/[0.05] shadow-[0_0_28px_rgba(251,191,36,0.18)] lg:scale-[1.025]'
                  : 'border-cyan-400/30 bg-cyan-500/[0.04] hover:border-cyan-300/55',
              ].join(' ')}
            >
              {popular && (
                <span className="absolute right-4 top-4 rounded-full border border-amber-300/60 bg-amber-400/20 px-2.5 py-1 font-display text-[0.5rem] tracking-[0.28em] text-amber-100">
                  {t('tiers.popular')}
                </span>
              )}

              <div>
                <p className="font-display text-[0.55rem] tracking-[0.3em] text-amber-300/80">
                  {`// ${tier.key.toUpperCase()}`}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-[0.16em] text-cyan-50">
                  {t(`tiers.${tier.key}.name`)}
                </h3>
                <p className="mt-1.5 text-[0.82rem] leading-snug text-cyan-100/65">
                  {t(`tiers.${tier.key}.tagline`)}
                </p>
              </div>

              <div className="mt-5 min-h-[78px]">
                {price === 0 ? (
                  <div>
                    <p className="font-display text-3xl font-bold text-cyan-50 sm:text-4xl">
                      $0
                    </p>
                    <p className="mt-1 font-display text-[0.6rem] tracking-[0.22em] text-cyan-100/55">
                      {t('billing.free').toUpperCase()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-bold text-cyan-50 sm:text-4xl">
                        ${price}
                      </span>
                      <span className="text-[0.78rem] text-cyan-100/55">
                        {t('billing.perMonth')}
                      </span>
                    </div>
                    <p className="mt-1 font-display text-[0.6rem] tracking-[0.22em] text-cyan-100/55">
                      {cycle === 'yearly'
                        ? t('billing.perMonthBilledYearly').toUpperCase()
                        : `${t('billing.monthly').toUpperCase()}`}
                    </p>
                  </div>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[0.84rem] leading-snug text-cyan-100/85">
                    <Check className={popular ? 'text-amber-300' : 'text-cyan-300'} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={ctaHref}
                className={[
                  'mt-6 inline-flex items-center justify-center rounded-md px-4 py-3 font-display text-[0.66rem] font-bold uppercase tracking-[0.24em] transition',
                  popular
                    ? 'border border-amber-300/60 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-[#1a1303] hover:brightness-110 hover:shadow-[0_0_24px_rgba(251,191,36,0.5)]'
                    : 'border border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-50 hover:border-cyan-300/70 hover:bg-cyan-500/[0.14]',
                ].join(' ')}
              >
                {t(`tiers.${tier.key}.cta`)}
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function CycleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={[
        'rounded-full px-4 py-1.5 font-display text-[0.62rem] tracking-[0.22em] uppercase transition sm:px-5 sm:py-2 sm:text-[0.66rem]',
        active
          ? 'bg-amber-400/15 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
          : 'text-cyan-100/65 hover:text-cyan-50',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Check({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`mt-0.5 shrink-0 ${className}`}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
