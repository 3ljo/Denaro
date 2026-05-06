import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import MarketingNav from '../_components/marketing-nav'
import MarketingFooter from '../_components/marketing-footer'
import PricingTiers from './_components/pricing-tiers'

export const metadata = {
  title: 'Denaro // Pricing',
  description: 'Plans that scale with you. Start free, upgrade any time.',
}

const COMPARISON_ROWS = [
  { key: 'pairs', values: ['freePairs', 'proPairs', 'elitePairs'] as const },
  { key: 'analysis', values: ['no', 'yes', 'yes'] as const },
  { key: 'vision', values: ['no', 'yes', 'yes'] as const },
  { key: 'news', values: ['no', 'yes', 'yes'] as const },
  { key: 'ask', values: ['askFree', 'askPro', 'askElite'] as const },
  { key: 'strategies', values: ['stratFree', 'stratPro', 'stratElite'] as const },
  { key: 'confluence', values: ['no', 'yes', 'yes'] as const },
  { key: 'priorityModel', values: ['no', 'no', 'yes'] as const },
  { key: 'backtest', values: ['no', 'no', 'yes'] as const },
  { key: 'support', values: ['supportFree', 'supportPro', 'supportElite'] as const },
] as const

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthed = !!user

  const t = await getTranslations('marketing.pricing')

  return (
    <div className="relative min-h-dvh bg-denaro-bg text-cyan-50 safe-bottom">
      <CosmicBackdrop />
      <MarketingNav isAuthed={isAuthed} />

      {/* HERO */}
      <section className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pb-14 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/[0.08] px-3 py-1 font-display text-[0.55rem] tracking-[0.32em] text-amber-200/90 sm:text-[0.6rem]">
            <span className="denaro-dot !bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
            {t('hero.badge')}
          </span>
          <h1 className="mt-5 font-display text-[2rem] font-bold uppercase leading-[1.05] tracking-[0.04em] text-cyan-50 sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[0.92rem] leading-relaxed text-cyan-100/70 sm:text-base">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* TIERS */}
      <section className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
          <PricingTiers isAuthed={isAuthed} />
        </div>
      </section>

      {/* COMPARISON */}
      <section className="relative z-10 border-y border-cyan-400/10 bg-cyan-500/[0.02]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center font-display text-2xl font-bold uppercase tracking-[0.08em] text-cyan-50 sm:text-3xl">
            {t('comparison.title')}
          </h2>

          {/* Mobile: per-tier cards stacked */}
          <div className="mt-8 space-y-4 lg:hidden">
            {(['free', 'pro', 'elite'] as const).map((col, idx) => (
              <div
                key={col}
                className={[
                  'overflow-hidden rounded-md border backdrop-blur-md',
                  col === 'pro'
                    ? 'border-amber-300/45 bg-amber-400/[0.04]'
                    : 'border-cyan-400/25 bg-cyan-500/[0.04]',
                ].join(' ')}
              >
                <div className="flex items-baseline justify-between gap-3 border-b border-cyan-400/15 px-4 py-3">
                  <p className="font-display text-[0.78rem] font-bold uppercase tracking-[0.2em] text-cyan-50">
                    {t(`tiers.${col}.name`)}
                  </p>
                  <p className="font-display text-[0.55rem] tracking-[0.28em] text-amber-300/80">
                    {col === 'pro' ? t('tiers.popular') : `// ${col.toUpperCase()}`}
                  </p>
                </div>
                <ul className="divide-y divide-cyan-400/10">
                  {COMPARISON_ROWS.map((row) => {
                    const val = row.values[idx]
                    const display =
                      val === 'yes'
                        ? t('comparison.yes')
                        : val === 'no'
                        ? t('comparison.no')
                        : t(`comparison.values.${val}`)
                    return (
                      <li
                        key={row.key}
                        className="flex items-center justify-between gap-4 px-4 py-2.5"
                      >
                        <span className="text-[0.82rem] text-cyan-100/75">
                          {t(`comparison.rows.${row.key}`)}
                        </span>
                        <span
                          className={[
                            'font-display text-[0.78rem] tracking-wide',
                            val === 'yes'
                              ? 'text-amber-200'
                              : val === 'no'
                              ? 'text-cyan-100/30'
                              : 'text-cyan-100',
                          ].join(' ')}
                        >
                          {display}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="mt-10 hidden overflow-hidden rounded-md border border-cyan-400/20 lg:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-cyan-500/[0.05]">
                <tr>
                  <th className="px-5 py-4 font-display text-[0.6rem] tracking-[0.24em] text-cyan-100/55">
                    {t('comparison.feature')}
                  </th>
                  {(['free', 'pro', 'elite'] as const).map((col) => (
                    <th
                      key={col}
                      className={[
                        'px-5 py-4 text-center font-display text-[0.78rem] font-bold uppercase tracking-[0.2em]',
                        col === 'pro' ? 'text-amber-200' : 'text-cyan-50',
                      ].join(' ')}
                    >
                      {t(`tiers.${col}.name`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-cyan-400/10">
                    <td className="px-5 py-3 text-[0.84rem] text-cyan-100/80">
                      {t(`comparison.rows.${row.key}`)}
                    </td>
                    {row.values.map((val, idx) => {
                      const display =
                        val === 'yes'
                          ? t('comparison.yes')
                          : val === 'no'
                          ? t('comparison.no')
                          : t(`comparison.values.${val}`)
                      const popular = idx === 1
                      return (
                        <td
                          key={`${row.key}-${idx}`}
                          className={[
                            'px-5 py-3 text-center font-display text-[0.82rem]',
                            popular ? 'bg-amber-400/[0.04]' : '',
                            val === 'yes'
                              ? 'text-amber-200'
                              : val === 'no'
                              ? 'text-cyan-100/30'
                              : 'text-cyan-100',
                          ].join(' ')}
                        >
                          {display}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center font-display text-2xl font-bold uppercase tracking-[0.08em] text-cyan-50 sm:text-3xl">
            {t('faq.title')}
          </h2>
          <div className="mt-8 space-y-2 sm:mt-10 sm:space-y-3">
            {FAQ_KEYS.map((k) => (
              <details
                key={k}
                className="group overflow-hidden rounded-md border border-cyan-400/25 bg-cyan-500/[0.04] transition open:border-amber-300/45 open:bg-amber-400/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                  <span className="font-display text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-cyan-50 sm:text-[0.9rem]">
                    {t(`faq.items.${k}.q`)}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                    className="shrink-0 text-cyan-200/70 transition group-open:rotate-180"
                  >
                    <path
                      d="M2.5 4.5l3.5 3 3.5-3"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <div className="border-t border-cyan-400/15 px-4 py-3.5 text-[0.85rem] leading-relaxed text-cyan-100/75 sm:px-5">
                  {t(`faq.items.${k}.a`)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

function CosmicBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 denaro-stars opacity-40" />
      <div className="absolute inset-0 denaro-grid" />
      <div className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[160px]" />
      <div className="absolute -bottom-40 right-0 h-[36rem] w-[36rem] rounded-full bg-amber-500/10 blur-[160px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  )
}
