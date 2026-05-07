import type { Strategy, SubscriptionTier } from '@/lib/profile/types'
import type { Interval } from '@/lib/market/ohlc'

// Re-export for downstream callers that already import from this file.
export type { SubscriptionTier }

// Vision chart stack: exactly 3 timeframes — HTF, MTF, LTF in that order.
// SMC reads on D1/H4/M15-style bias; scalping wants M30/M15/M5; swing wants
// W1/D1/H4. The vision card builds its 3-up grid from this and the system
// prompt names the timeframes in the OUTPUT instructions.
export type VisionStack = readonly [Interval, Interval, Interval]

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
  // Per-strategy chart stack the vision card displays + screenshots.
  // [HTF, MTF, LTF] — strict order, exactly 3 timeframes.
  visionStack: VisionStack
  // One-sentence user-facing copy shown as the vision card subtitle. Tells
  // the operator what the AI will produce *for this strategy* — vocabulary,
  // sections, what to expect — rather than the generic "let Denaro read".
  visionBlurb: string
}
