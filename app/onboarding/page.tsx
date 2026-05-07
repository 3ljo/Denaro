import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile/actions'
import OnboardingFlow from './onboarding-flow'

export const metadata = { title: 'Welcome' }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (profile?.onboarded_at) redirect('/dashboard')

  const emailHint = user.email?.split('@')[0] ?? ''
  // New users default to 'free' tier; the auto-create trigger backfills the
  // column. Pass it through so the strategy step can lock paid options.
  const tier = profile?.tier ?? 'free'
  return (
    <OnboardingFlow
      defaultName={emailHint}
      email={user.email ?? ''}
      tier={tier}
    />
  )
}
