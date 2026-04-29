import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile/actions'
import OnboardingFlow from './onboarding-flow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfile()
  if (profile?.onboarded_at) redirect('/dashboard')

  const emailHint = user.email?.split('@')[0] ?? ''
  return <OnboardingFlow defaultName={emailHint} email={user.email ?? ''} />
}
