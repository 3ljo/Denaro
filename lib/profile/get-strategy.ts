import 'server-only'
import { createClient } from '@/lib/supabase/server'
import {
  isStrategy,
  isSubscriptionTier,
  type Strategy,
  type SubscriptionTier,
} from './types'
import { canUseStrategy, defaultStrategyForTier } from './tier'

// Server-only: returns the operator's chosen strategy from their profile,
// validated against their current subscription tier. If the tier no longer
// allows the saved strategy (e.g. they downgraded from Pro to Free), falls
// back to the lowest-tier strategy that's still permitted.
//
// Falls back to 'smc' / 'free' if there's no session or profile row.
export async function getOperatorStrategy(): Promise<Strategy> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'smc'

  const { data } = await supabase
    .from('profiles')
    .select('strategy, tier')
    .eq('id', user.id)
    .single()

  const strategy: Strategy = isStrategy(data?.strategy) ? (data.strategy as Strategy) : 'smc'
  const tier: SubscriptionTier = isSubscriptionTier(data?.tier)
    ? (data.tier as SubscriptionTier)
    : 'free'

  return canUseStrategy(tier, strategy) ? strategy : defaultStrategyForTier(tier)
}
