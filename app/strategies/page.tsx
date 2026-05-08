import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Wrapper from '@t/layout/wrapper'
import Header from '@t/layout/header/header'
import FooterTwo from '@t/layout/footer/footer-2'

export const metadata = {
  title: 'Strategies',
  description:
    'Six AI lenses Denaro uses to read the market — from Smart Money Concepts to Mean Reversion.',
}

const STRATEGY_KEYS = [
  'smc',
  'price-action',
  'trend',
  'mean-reversion',
  'scalping',
  'swing',
] as const

export default async function StrategiesPage() {
  const t = await getTranslations('strategies')

  return (
    <Wrapper>
      <Header style_2={true} />

      <main className="main--area">
        {/* HERO */}
        <section className="pt-32 pb-10 sm:pt-40 sm:pb-14 lg:pt-44">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-display text-[0.62rem] tracking-[0.32em] text-amber-300/85">
                // STRATEGY LENSES
              </p>
              <h1 className="mt-4 font-display text-[1.9rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.6rem] md:text-[3.1rem]">
                Six lenses. <span className="text-amber-300">One operator.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-white/70 sm:text-[1rem]">
                Denaro reads every chart through six distinct strategy lenses.
                Pick the one that matches your edge — or stack them for confluence.
              </p>
            </div>
          </div>
        </section>

        {/* GRID */}
        <section className="pb-16 sm:pb-24">
          <div className="container">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {STRATEGY_KEYS.map((key, idx) => (
                <article
                  key={key}
                  className="group relative overflow-hidden rounded-md border border-amber-300/15 bg-white/[0.02] p-6 transition hover:border-amber-300/45 hover:bg-amber-400/[0.04] sm:p-7"
                >
                  <p className="font-display text-[0.55rem] tracking-[0.32em] text-amber-300/70">
                    // {String(idx + 1).padStart(2, '0')}
                  </p>
                  <h2 className="mt-3 font-display text-[1.05rem] font-bold uppercase tracking-[0.08em] text-white sm:text-[1.15rem]">
                    {t(`${key}.label`)}
                  </h2>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-white/70 sm:text-[0.92rem]">
                    {t(`${key}.blurb`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 sm:pb-28">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-md border border-amber-300/30 bg-amber-400/[0.05] px-6 py-8 text-center sm:px-10 sm:py-10">
              <p className="font-display text-[0.62rem] tracking-[0.28em] text-amber-200/85">
                // READY TO READ THE MARKET
              </p>
              <h2 className="mt-3 font-display text-[1.5rem] font-bold leading-tight text-white sm:text-[1.85rem]">
                Pick your lens. Run the analyst.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[0.9rem] leading-relaxed text-white/70">
                All strategy lenses are available on Pro and Elite. Free includes one.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/pricing"
                  className="rounded-md bg-amber-300 px-6 py-3 font-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-amber-200"
                >
                  See pricing
                </Link>
                <Link
                  href="/register"
                  className="rounded-md border border-amber-300/45 px-6 py-3 font-display text-[0.78rem] font-bold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-300 hover:text-amber-100"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterTwo />
    </Wrapper>
  )
}
