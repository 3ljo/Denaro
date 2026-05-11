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
      {/* Cosmic backdrop — same as dashboard, glows removed for uniform color
          on lighter brightness modes. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 denaro-stars opacity-50" />
        <div className="absolute inset-0 denaro-grid" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-3 py-5 sm:px-5 sm:py-8">
        <SettingsForm profile={profile} email={user.email ?? ''} />
      </div>
    </main>
  )
}
