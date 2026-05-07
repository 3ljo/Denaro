import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { isSubscriptionTier, type SubscriptionTier } from '@/lib/profile/types'
import Wrapper from '@t/layout/wrapper'
import Header from '@t/layout/header/header'
import FooterTwo from '@t/layout/footer/footer-2'
import HomePricing from '../_components/home-pricing'

export const metadata = {
  title: 'Pricing',
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

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthed = !!user

  // Pull just the tier so the CTAs can render "Current plan" / "Upgrade"
  // / "Manage" depending on what the user already has.
  let currentTier: SubscriptionTier | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .maybeSingle()
    currentTier = isSubscriptionTier(data?.tier) ? (data.tier as SubscriptionTier) : null
  }

  const params = await searchParams
  const showComingSoon = params?.status === 'coming-soon'

  const t = await getTranslations('marketing.pricing')

  return (
    <Wrapper>
      <Header style_2={true} />

      <main className="main--area">
        {showComingSoon && (
          <div className="container pt-10">
            <div className="mx-auto max-w-3xl rounded-md border border-amber-300/45 bg-amber-400/[0.06] px-4 py-3 text-center">
              <p className="font-display text-[0.62rem] tracking-[0.28em] text-amber-200/85">
                {t('comingSoon.badge')}
              </p>
              <p className="mt-1 text-[0.85rem] leading-snug text-white/85">
                {t('comingSoon.body')}
              </p>
            </div>
          </div>
        )}

        {/* Tier cards — template-styled, same component as the home page */}
        <HomePricing isAuthed={isAuthed} currentTier={currentTier} />

        {/* COMPARISON */}
        <section className="denaro-pricing-extras">
          <div className="container">
            <h2 className="denaro-pricing-extras__title">{t('comparison.title')}</h2>

            {/* Mobile: per-tier cards stacked */}
            <div className="mt-8 space-y-4 lg:hidden">
              {(['free', 'pro', 'elite'] as const).map((col, idx) => (
                <div
                  key={col}
                  className={[
                    'overflow-hidden rounded-md border',
                    col === 'pro'
                      ? 'border-amber-300/45 bg-amber-400/[0.04]'
                      : 'border-amber-300/15 bg-white/[0.02]',
                  ].join(' ')}
                >
                  <div className="flex items-baseline justify-between gap-3 border-b border-amber-300/15 px-4 py-3">
                    <p className="font-display text-[0.78rem] font-bold uppercase tracking-[0.2em] text-white">
                      {t(`tiers.${col}.name`)}
                    </p>
                    <p className="font-display text-[0.55rem] tracking-[0.28em] text-amber-300/80">
                      {col === 'pro' ? t('tiers.popular') : `// ${col.toUpperCase()}`}
                    </p>
                  </div>
                  <ul className="divide-y divide-amber-300/10">
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
                          <span className="text-[0.82rem] text-white/75">
                            {t(`comparison.rows.${row.key}`)}
                          </span>
                          <span
                            className={[
                              'font-display text-[0.78rem] tracking-wide',
                              val === 'yes'
                                ? 'text-amber-200'
                                : val === 'no'
                                ? 'text-white/30'
                                : 'text-white',
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
            <div className="mt-10 hidden overflow-hidden rounded-md border border-amber-300/20 lg:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-amber-400/[0.05]">
                  <tr>
                    <th className="px-5 py-4 font-display text-[0.6rem] tracking-[0.24em] text-white/55">
                      {t('comparison.feature')}
                    </th>
                    {(['free', 'pro', 'elite'] as const).map((col) => (
                      <th
                        key={col}
                        className={[
                          'px-5 py-4 text-center font-display text-[0.78rem] font-bold uppercase tracking-[0.2em]',
                          col === 'pro' ? 'text-amber-200' : 'text-white',
                        ].join(' ')}
                      >
                        {t(`tiers.${col}.name`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.key} className="border-t border-amber-300/10">
                      <td className="px-5 py-3 text-[0.84rem] text-white/80">
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
                              popular ? 'bg-amber-400/[0.05]' : '',
                              val === 'yes'
                                ? 'text-amber-200'
                                : val === 'no'
                                ? 'text-white/30'
                                : 'text-white',
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
        <section className="denaro-pricing-faq">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="denaro-pricing-extras__title">{t('faq.title')}</h2>
              <div className="mt-8 space-y-2 sm:mt-10 sm:space-y-3">
                {FAQ_KEYS.map((k) => (
                  <details
                    key={k}
                    className="group overflow-hidden rounded-md border border-amber-300/20 bg-white/[0.02] transition open:border-amber-300/55 open:bg-amber-400/[0.04]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                      <span className="font-display text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-white sm:text-[0.9rem]">
                        {t(`faq.items.${k}.q`)}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                        className="shrink-0 text-amber-200/70 transition group-open:rotate-180"
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
                    <div className="border-t border-amber-300/15 px-4 py-3.5 text-[0.85rem] leading-relaxed text-white/75 sm:px-5">
                      {t(`faq.items.${k}.a`)}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterTwo />
    </Wrapper>
  )
}
