import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile/actions'
import { logout } from '@/lib/auth/actions'
import DashboardContent from './_components/dashboard-content'
import ProfileMenu from './_components/profile-menu'
import PlanBadge from './_components/plan-badge'
import BgToggle from './_components/bg-toggle'
import LanguageSwitcher from '@/app/_components/language-switcher'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  // Defense in depth — middleware does the first check.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile?.onboarded_at) redirect('/onboarding')

  const t = await getTranslations('dashboard.header')
  const tStrat = await getTranslations('strategies')

  const greeting =
    profile.display_name || user.email?.split('@')[0] || t('operatorFallback')

  return (
    <main className="relative min-h-dvh w-full bg-[var(--dash-bg,#050810)] safe-top safe-bottom">
      {/* Cosmic backdrop — only neutral patterns (stars, grid) so the chosen
          --dash-bg color reads uniformly across the whole viewport on ultrawide.
          Color glows were removed because they made the center brighter than
          the edges on lighter brightness modes (slate, dusk). */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-50" />
        <div className="absolute inset-0 denaro-grid" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:px-5 sm:py-5">
        {/* Header — lifted above sibling panels (`relative z-50`) so the
            language dropdown (and any other absolute-positioned control popups
            inside .denaro-panel stacking contexts) renders OVER the dashboard
            cards below instead of being clipped behind them. */}
        <header className="relative z-50 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="hidden font-display text-[0.55rem] tracking-[0.4em] text-amber-300/80 sm:block">
              {t('badge')}
            </p>
            {/* Mobile: tiny label on first line, name on its own line so a
                long display_name wraps cleanly instead of being truncated.
                Desktop: original single-line heading. */}
            <p className="block font-display text-[0.55rem] tracking-[0.32em] text-amber-300/70 sm:hidden">
              {t('welcomeShort')}
            </p>
            <h1 className="break-words font-display text-2xl font-bold uppercase italic leading-tight tracking-[0.18em] text-cyan-50 sm:hidden">
              {greeting}
            </h1>
            <h1 className="hidden truncate font-display text-xl font-bold uppercase tracking-[0.2em] text-cyan-50 sm:block">
              {t.rich('welcomeBack', {
                name: greeting,
                b: (chunks) => (
                  <span className="text-2xl italic tracking-[0.18em]">
                    {chunks}
                  </span>
                ),
              })}
            </h1>
            <p className="mt-1 hidden text-[0.7rem] tracking-wide text-cyan-100/50 sm:block">
              {t('lens')}{' '}
              <span className="text-amber-200/85">
                {tStrat(`${profile.strategy}.label`)}
              </span>
            </p>
          </div>
          {/* Single panel grouping the three header controls so they read as
              one unit. Language (globe + code) on the left, small red Sign out
              with icon, then the avatar menu on the right. */}
          <div className="denaro-panel flex shrink-0 items-center gap-1.5 rounded-md p-1">
            <PlanBadge tier={profile.tier} />
            <BgToggle />
            <LanguageSwitcher />
            <form action={logout} className="hidden sm:block">
              <button
                type="submit"
                aria-label={t('logout')}
                title={t('logout')}
                className="inline-flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-500/10 px-2 py-1.5 font-display text-[0.6rem] tracking-[0.22em] text-rose-200 transition hover:border-rose-400/70 hover:bg-rose-500/20 hover:text-rose-100"
              >
                <LogoutIcon />
                <span>{t('logout')}</span>
              </button>
            </form>
            <ProfileMenu
              displayName={profile.display_name}
              email={user.email ?? ''}
              lensLabel={tStrat(`${profile.strategy}.label`)}
            />
          </div>
        </header>

        <DashboardContent profile={profile} />
      </div>
    </main>
  )
}

function LogoutIcon() {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  )
}
