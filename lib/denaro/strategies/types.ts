import type { Strategy, SubscriptionTier } from '@/lib/profile/types'

// Re-export for downstream callers that already import from this file.
export type { SubscriptionTier }

export type VisionSection = {
  heading: string
  instruction: string
}

export type NewsHorizon = 'minutes' | 'hours' | 'days' | 'weeks'

// Color tone for level-list dot + price highlight. Maps to tailwind classes
// in pair-card.tsx — keep the union in sync there.
export type CardFieldTone = 'rose' | 'emerald' | 'amber' | 'cyan'

export type CardField =
  | {
      id: string                // matches the JSON key the model returns
      label: string             // English label rendered on the card
      kind: 'level-list'
      tone: CardFieldTone
      // Items per list (model is asked to return this many).
      count?: number
    }
  | {
      id: string
      label: string
      kind: 'text-line'
    }

// Drops into the chat input as a prompt scaffold. `[pair]` is replaced at
// click time with the operator's first watched pair.
export type QuickPrompt = {
  label: string                 // chip label (terse, ~3 words)
  prompt: string                // full prompt text dropped into the input
}

export type StrategyDefinition = {
  id: Strategy
  tier: SubscriptionTier
  chatLens: string
  cardLens: string
  visionLens: string
  visionSections: VisionSection[]
  newsLens: string
  newsHorizon: NewsHorizon
  // Per-strategy pair-card field schema. Render order matters: the first
  // two `level-list` fields go into the 2-col grid; the rest stack below.
  cardFields: CardField[]
  // Per-strategy quick-prompt chips shown above the Ask Denaro input.
  quickPrompts: QuickPrompt[]
}
