import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile/actions'
import { logout } from '@/lib/auth/actions'
import DashboardContent from './_components/dashboard-content'
import ProfileMenu from './_components/profile-menu'
import LanguageSwitcher from '@/app/_components/language-switcher'

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
    <main className="relative min-h-dvh w-full bg-denaro-bg safe-top safe-bottom">
      {/* Cosmic backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-50" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:px-5 sm:py-5">
        {/* Header — mobile keeps only the welcome + avatar menu (which holds
            language, settings, and logout). Desktop expands with badge,
            subtitle, and the standalone language/logout controls. */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="hidden font-display text-[0.55rem] tracking-[0.4em] text-amber-300/80 sm:block">
              {t('badge')}
            </p>
            <h1 className="truncate font-display text-base font-bold uppercase tracking-[0.18em] text-cyan-50 sm:text-xl sm:tracking-[0.2em]">
              {t('welcomeBack', { name: greeting })}
            </h1>
            <p className="mt-1 hidden text-[0.7rem] tracking-wide text-cyan-100/50 sm:block">
              {t('lens')}{' '}
              <span className="text-amber-200/85">
                {tStrat(`${profile.strategy}.label`)}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <form action={logout} className="hidden sm:block">
              <button type="submit" className="denaro-btn-ghost">
                {t('logout')}
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
