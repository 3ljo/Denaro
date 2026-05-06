import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function MarketingFooter() {
  const t = useTranslations('marketing.landing.footer')
  const year = new Date().getFullYear()
  return (
    <footer className="relative z-10 border-t border-cyan-400/15 bg-denaro-bg/60 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-amber-300/60 bg-gradient-to-br from-amber-300/30 via-amber-400/10 to-cyan-400/20 shadow-[0_0_18px_rgba(251,191,36,0.35)]"
              >
                <span className="font-display text-[0.7rem] font-bold text-amber-100">
                  D
                </span>
              </span>
              <span className="font-display text-base font-bold uppercase tracking-[0.3em] text-cyan-50">
                Denaro
              </span>
            </div>
            <p className="mt-3 max-w-sm text-[0.72rem] leading-relaxed text-cyan-100/55">
              {t('tagline')}
            </p>
            <p className="mt-3 max-w-sm text-[0.65rem] leading-relaxed text-cyan-100/40">
              {t('disclaimer')}
            </p>
          </div>

          <div>
            <p className="font-display text-[0.6rem] tracking-[0.28em] text-amber-300/80">
              {t('product').toUpperCase()}
            </p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/#features" className="text-[0.74rem] text-cyan-100/70 transition hover:text-cyan-50">{t('links.features')}</Link></li>
              <li><Link href="/#strategies" className="text-[0.74rem] text-cyan-100/70 transition hover:text-cyan-50">{t('links.strategies')}</Link></li>
              <li><Link href="/pricing" className="text-[0.74rem] text-cyan-100/70 transition hover:text-cyan-50">{t('links.pricing')}</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-display text-[0.6rem] tracking-[0.28em] text-amber-300/80">
              {t('company').toUpperCase()}
            </p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/login" className="text-[0.74rem] text-cyan-100/70 transition hover:text-cyan-50">{t('links.signIn')}</Link></li>
              <li><Link href="/register" className="text-[0.74rem] text-cyan-100/70 transition hover:text-cyan-50">{t('links.register')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-cyan-400/15 pt-5 sm:flex-row sm:items-center">
          <p className="font-display text-[0.6rem] tracking-[0.22em] text-cyan-100/40">
            © {year} DENARO · {t('rights').toUpperCase()}
          </p>
          <p className="font-display text-[0.55rem] tracking-[0.3em] text-cyan-100/30">
            v1.0 · AES-256 · UTC
          </p>
        </div>
      </div>
    </footer>
  )
}
