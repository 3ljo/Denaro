'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isStrategy, type Profile, type Strategy } from './types'

/** Fetches the operator's profile, or null if signed out / row missing. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('getProfile', error.message)
    return null
  }
  return (data as Profile) ?? null
}

export type OnboardingErrorKey = 'unauthorized' | 'pickAtLeastOnePair'

export async function saveOnboarding(input: {
  pairs: string[]
  strategy: string
  displayName?: string | null
}): Promise<{ errorKey?: OnboardingErrorKey; error?: string } | undefined> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { errorKey: 'unauthorized' }

  const pairs = (input.pairs ?? [])
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 3)

  if (pairs.length === 0) return { errorKey: 'pickAtLeastOnePair' }

  const strategy: Strategy = isStrategy(input.strategy) ? input.strategy : 'smc'
  const displayName = (input.displayName ?? '').trim() || null
  const now = new Date().toISOString()

  // Upsert — handle_new_user trigger usually pre-creates the row, but guard
  // the legacy case where it's missing.
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email!,
        pairs,
        strategy,
        display_name: displayName,
        onboarded_at: now,
        updated_at: now,
      },
      { onConflict: 'id' },
    )

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
