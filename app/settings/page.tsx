import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile/actions'
import SettingsForm from './settings-form'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (!profile?.onboarded_at) redirect('/onboarding')

  return (
    <main className="relative min-h-dvh w-full bg-[var(--dash-bg,#050810)] safe-top safe-bottom">
      {/* Cosmic backdrop — same as dashboard */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-50" />
        <div className="absolute inset-0 denaro-grid" />
        <div className="absolute -top-[20vw] left-1/2 h-[min(60rem,80vw)] w-[min(110rem,150vw)] -translate-x-1/2 rounded-[50%] bg-cyan-500/10 blur-[160px]" />
        <div className="absolute -bottom-[15vw] -right-[10vw] h-[min(45rem,55vw)] w-[min(55rem,60vw)] rounded-full bg-amber-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-3 py-5 sm:px-5 sm:py-8">
        <SettingsForm profile={profile} email={user.email ?? ''} />
      </div>
    </main>
  )
}
