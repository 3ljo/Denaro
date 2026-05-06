import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import MarketingNav from './_components/marketing-nav'
import MarketingFooter from './_components/marketing-footer'

const STRATEGIES = [
  'smc',
  'price-action',
  'trend',
  'mean-reversion',
  'scalping',
  'swing',
] as const

export default async function Landing() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthed = !!user

  const t = await getTranslations('marketing.landing')
  const tStrat = await getTranslations('strategies')

  const features = [
    { key: 'markets', icon: <ChartIcon /> },
    { key: 'vision', icon: <EyeIcon /> },
    { key: 'news', icon: <BoltIcon /> },
    { key: 'ask', icon: <ChatIcon /> },
    { key: 'sessions', icon: <ClockIcon /> },
    { key: 'confluence', icon: <TargetIcon /> },
  ] as const

  return (
    <div className="relative min-h-dvh bg-denaro-bg text-cyan-50 safe-bottom">
      <CosmicBackdrop />
      <MarketingNav isAuthed={isAuthed} />

      {/* HERO */}
      <section className="relative z-10 overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-2 lg:gap-12 lg:pb-32 lg:pt-24">
          <div className="relative z-10 order-2 text-center lg:order-1 lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/[0.08] px-3 py-1 font-display text-[0.55rem] tracking-[0.32em] text-amber-200/90 sm:text-[0.6rem]">
              <span className="denaro-dot !bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              {t('hero.badge')}
            </span>

            <h1 className="mt-5 font-display text-[2rem] font-bold uppercase leading-[1.05] tracking-[0.02em] text-cyan-50 sm:text-5xl lg:text-6xl">
              {t('hero.title')}
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[0.92rem] leading-relaxed text-cyan-100/70 sm:text-base lg:mx-0">
              {t('hero.subtitle')}
            </p>

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              {isAuthed ? (
                <Link href="/dashboard" className="denaro-btn !w-auto !px-6 !py-3 !text-[0.7rem]">
                  {t('hero.ctaOpen')}
                </Link>
              ) : (
                <Link href="/register" className="denaro-btn !w-auto !px-6 !py-3 !text-[0.7rem]">
                  {t('hero.ctaPrimary')}
                </Link>
              )}
              <Link href="/pricing" className="denaro-btn-ghost !px-6 !py-3 !text-[0.7rem]">
                {t('hero.ctaSecondary')}
              </Link>
            </div>

            <p className="mt-5 font-display text-[0.6rem] tracking-[0.22em] text-cyan-100/45">
              {t('hero.trust').toUpperCase()}
            </p>

            {/* Quick stats */}
            <dl className="mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4 lg:mx-0">
              <Stat value="50+" label={t('stats.pairs')} />
              <Stat value="13" label={t('stats.languages')} />
              <Stat value="6" label={t('stats.strategies')} />
              <Stat value="99.9%" label={t('stats.uptime')} />
            </dl>
          </div>

          {/* Character pane */}
          <div className="relative order-1 mx-auto h-[280px] w-full max-w-md sm:h-[420px] lg:order-2 lg:h-[560px] lg:max-w-none">
            <div
              aria-hidden
              className="absolute inset-x-8 bottom-2 h-24 rounded-full bg-cyan-400/20 blur-3xl animate-glowPulse sm:h-36"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-cyan-500/15 via-transparent to-amber-500/10 blur-2xl"
            />
            <Image
              src="/pic/denaro.png"
              alt="Denaro"
              fill
              priority
              sizes="(min-width: 1024px) 600px, (min-width: 640px) 480px, 90vw"
              className="object-contain object-bottom drop-shadow-[0_0_60px_rgba(34,211,238,0.35)]"
            />
            {/* HUD bracket overlay */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <Bracket className="left-2 top-2" />
              <Bracket className="right-2 top-2 rotate-90" />
              <Bracket className="left-2 bottom-2 -rotate-90" />
              <Bracket className="right-2 bottom-2 rotate-180" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 border-y border-cyan-400/10 bg-cyan-500/[0.02]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <p className="font-display text-[0.6rem] tracking-[0.32em] text-amber-300/80">
              {t('features.badge')}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-[0.08em] text-cyan-50 sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[0.85rem] leading-relaxed text-cyan-100/65 sm:text-[0.92rem]">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {features.map(({ key, icon }) => (
              <article
                key={key}
                className="denaro-panel group relative overflow-hidden rounded-md p-5 transition hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(34,211,238,0.18)] sm:p-6"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-amber-300/40 bg-amber-400/[0.08] text-amber-200">
                  {icon}
                </div>
                <h3 className="mt-4 font-display text-base font-bold uppercase tracking-[0.16em] text-cyan-50">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="mt-2 text-[0.83rem] leading-relaxed text-cyan-100/70">
                  {t(`features.${key}.blurb`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGIES */}
      <section id="strategies" className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <p className="font-display text-[0.6rem] tracking-[0.32em] text-amber-300/80">
              {t('strategies.badge')}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-[0.08em] text-cyan-50 sm:text-4xl">
              {t('strategies.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[0.85rem] leading-relaxed text-cyan-100/65 sm:text-[0.92rem]">
              {t('strategies.subtitle')}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {STRATEGIES.map((s) => (
              <div
                key={s}
                className="rounded-md border border-cyan-400/25 bg-cyan-500/[0.04] p-5 transition hover:border-amber-300/50 hover:bg-amber-400/[0.04] sm:p-6"
              >
                <p className="font-display text-[0.55rem] tracking-[0.3em] text-amber-300/80">
                  {`// ${String(s).toUpperCase()}`}
                </p>
                <h3 className="mt-2 font-display text-[0.95rem] font-bold uppercase tracking-[0.16em] text-cyan-50 sm:text-base">
                  {tStrat(`${s}.label`)}
                </h3>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-cyan-100/65">
                  {tStrat(`${s}.blurb`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="relative z-10 border-y border-cyan-400/10 bg-cyan-500/[0.02]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
            <div className="text-center lg:text-left">
              <p className="font-display text-[0.6rem] tracking-[0.32em] text-amber-300/80">
                {t('pricingTeaser.badge')}
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-[0.08em] text-cyan-50 sm:text-4xl">
                {t('pricingTeaser.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[0.88rem] leading-relaxed text-cyan-100/65 sm:text-[0.92rem] lg:mx-0">
                {t('pricingTeaser.subtitle')}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Link
                href="/pricing"
                className="denaro-btn !w-auto !px-7 !py-3 !text-[0.7rem]"
              >
                {t('pricingTeaser.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="relative z-10">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="denaro-panel relative overflow-hidden rounded-md p-6 text-center sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
            />
            <p className="font-display text-[0.6rem] tracking-[0.32em] text-amber-300/80">
              {t('ctaBand.badge')}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-[0.06em] text-cyan-50 sm:text-4xl">
              {t('ctaBand.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[0.88rem] leading-relaxed text-cyan-100/70 sm:text-[0.95rem]">
              {t('ctaBand.subtitle')}
            </p>
            <div className="mt-6 flex justify-center">
              {isAuthed ? (
                <Link href="/dashboard" className="denaro-btn !w-auto !px-7 !py-3 !text-[0.7rem]">
                  {t('hero.ctaOpen')}
                </Link>
              ) : (
                <Link href="/register" className="denaro-btn !w-auto !px-7 !py-3 !text-[0.7rem]">
                  {t('ctaBand.button')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-cyan-400/20 bg-cyan-500/[0.04] px-3 py-3 text-left">
      <p className="font-display text-lg font-bold tracking-wide text-amber-200 sm:text-xl">
        {value}
      </p>
      <p className="mt-1 font-display text-[0.55rem] tracking-[0.22em] text-cyan-100/55">
        {label.toUpperCase()}
      </p>
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

function Bracket({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-4 w-4 ${className}`}
      style={{
        borderTop: '1.5px solid rgba(251, 191, 36, 0.85)',
        borderLeft: '1.5px solid rgba(251, 191, 36, 0.85)',
        filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))',
      }}
    />
  )
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 4 4 5-7" />
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}
function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
