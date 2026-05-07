import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { isStrategy, type Strategy } from './types'

// Server-only: returns the operator's chosen strategy from their profile.
// Falls back to 'smc' if there's no session, no profile row, or the value
// isn't a recognised strategy. Routes that need the strategy should call
// this rather than trusting the request body — same source of truth as
// the calibration screen and (eventually) the subscription tier.
export async function getOperatorStrategy(): Promise<Strategy> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'smc'

  const { data } = await supabase
    .from('profiles')
    .select('strategy')
    .eq('id', user.id)
    .single()

  return isStrategy(data?.strategy) ? (data.strategy as Strategy) : 'smc'
}
