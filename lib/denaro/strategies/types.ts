import type { Strategy } from '@/lib/profile/types'

// Placeholder for the future subscription system. Phase 3 will gate strategy
// selection in the settings UI and on the server. For now every strategy is
// 'free' so picking one always works.
export type SubscriptionTier = 'free' | 'pro' | 'elite'

export type VisionSection = {
  heading: string
  instruction: string
}

export type NewsHorizon = 'minutes' | 'hours' | 'days' | 'weeks'

export type StrategyDefinition = {
  id: Strategy
  tier: SubscriptionTier
  chatLens: string
  cardLens: string
  visionLens: string
  visionSections: VisionSection[]
  newsLens: string
  newsHorizon: NewsHorizon
}
