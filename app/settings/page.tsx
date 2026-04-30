import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile/actions'
import SettingsForm from './settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile?.onboarded_at) redirect('/onboarding')

  return (
    <main className="relative min-h-dvh w-full bg-denaro-bg safe-top safe-bottom">
      {/* Cosmic backdrop — same as dashboard */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-50" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-3 py-5 sm:px-5 sm:py-8">
        <SettingsForm profile={profile} email={user.email ?? ''} />
      </div>
    </main>
  )
}
