import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile/actions'
import { logout } from '@/lib/auth/actions'
import DashboardContent from './_components/dashboard-content'
import ProfileButton from './_components/profile-button'
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
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-[0.55rem] tracking-[0.4em] text-amber-300/80">
              {t('badge')}
            </p>
            <h1 className="font-display text-lg font-bold uppercase tracking-[0.2em] text-cyan-50 sm:text-xl">
              {t('welcomeBack', { name: greeting })}
            </h1>
            <p className="mt-1 text-[0.7rem] tracking-wide text-cyan-100/50">
              {t('lens')}{' '}
              <span className="text-amber-200/85">
                {tStrat(`${profile.strategy}.label`)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <form action={logout}>
              <button type="submit" className="denaro-btn-ghost">
                {t('logout')}
              </button>
            </form>
            <ProfileButton
              displayName={profile.display_name}
              email={user.email ?? ''}
            />
          </div>
        </header>

        <DashboardContent profile={profile} />
      </div>
    </main>
  )
}
