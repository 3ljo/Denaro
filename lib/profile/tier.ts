import { STRATEGIES, type Strategy, type SubscriptionTier } from './types'
import { STRATEGY_REGISTRY } from '@/lib/denaro/strategies'

// Hierarchy: a higher tier always inherits everything the lower tiers can do.
// 'free' < 'pro' < 'elite'
const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
}

export function tierAllows(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier]
}

export function canUseStrategy(tier: SubscriptionTier, strategy: Strategy): boolean {
  return tierAllows(tier, STRATEGY_REGISTRY[strategy].tier)
}

export function getAllowedStrategies(tier: SubscriptionTier): Strategy[] {
  return STRATEGIES.filter((s) => canUseStrategy(tier, s))
}

// Used when a user's tier no longer permits their saved strategy (e.g. they
// downgraded from Pro to Free). Falls back to the lowest-tier strategy that's
// still allowed — by design that's always 'smc' since it's the free default.
export function defaultStrategyForTier(tier: SubscriptionTier): Strategy {
  const allowed = getAllowedStrategies(tier)
  return allowed[0] ?? 'smc'
}
